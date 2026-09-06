import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/server";
import { syncProductVariants } from "@/lib/admin/products";
import type { ProductImportGroup } from "@/lib/admin/csv-import";

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { groups }: { groups: ProductImportGroup[] } = await request.json();
  if (!groups?.length) {
    return NextResponse.json({ error: "No products to import" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: categories, error: categoriesError } = await admin.from("categories").select("id, slug");
  if (categoriesError) return NextResponse.json({ error: categoriesError.message }, { status: 500 });
  const categoryIdBySlug = new Map((categories ?? []).map((c) => [c.slug, c.id]));

  const results: { slug: string; status: "created" | "updated" | "error"; error?: string }[] = [];

  for (const group of groups) {
    const categoryId = categoryIdBySlug.get(group.categorySlug);
    if (!categoryId) {
      results.push({ slug: group.slug, status: "error", error: `Unknown category_slug "${group.categorySlug}"` });
      continue;
    }

    const { data: existing } = await admin.from("products").select("id").eq("slug", group.slug).maybeSingle();

    const productFields = {
      name: group.name,
      slug: group.slug,
      description: group.description,
      category_id: categoryId,
      base_price: group.basePrice,
      cost_price: group.costPrice,
      status: group.status,
      is_bestseller: group.isBestseller,
      is_new: group.isNew,
      images: group.images,
    };

    let productId: string;
    if (existing) {
      const { error } = await admin.from("products").update(productFields).eq("id", existing.id);
      if (error) {
        results.push({ slug: group.slug, status: "error", error: error.message });
        continue;
      }
      productId = existing.id;
    } else {
      const { data: created, error } = await admin.from("products").insert(productFields).select("id").single();
      if (error || !created) {
        results.push({ slug: group.slug, status: "error", error: error?.message ?? "Insert failed" });
        continue;
      }
      productId = created.id;
    }

    // Import variants are matched by SKU rather than replacing the whole set
    // — re-running the same CSV (e.g. to update stock) shouldn't recreate
    // variant rows and lose their id-based history.
    const { data: existingVariants } = await admin
      .from("product_variants")
      .select("id, sku")
      .eq("product_id", productId);
    const variantIdBySku = new Map((existingVariants ?? []).map((v) => [v.sku, v.id]));

    const { error: variantsError } = await syncProductVariants(
      admin,
      productId,
      group.variants.map((v) => ({ ...v, id: variantIdBySku.get(v.sku) })),
    );

    if (variantsError) {
      results.push({ slug: group.slug, status: "error", error: variantsError });
      continue;
    }

    results.push({ slug: group.slug, status: existing ? "updated" : "created" });
  }

  return NextResponse.json({ results });
}
