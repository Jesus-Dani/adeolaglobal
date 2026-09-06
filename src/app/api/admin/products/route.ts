import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/server";
import { syncProductVariants, type ProductInput } from "@/lib/admin/products";

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const body: ProductInput = await request.json();
  if (!body.name || !body.slug || !body.categoryId || !body.variants?.length) {
    return NextResponse.json(
      { error: "Name, slug, category, and at least one variant are required" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data: product, error: productError } = await admin
    .from("products")
    .insert({
      name: body.name,
      slug: body.slug,
      description: body.description ?? null,
      category_id: body.categoryId,
      base_price: body.basePrice,
      cost_price: body.costPrice ?? null,
      status: body.status,
      is_bestseller: body.isBestseller ?? false,
      is_new: body.isNew ?? false,
      images: body.images,
    })
    .select("id")
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: productError?.message ?? "Could not create product" }, { status: 500 });
  }

  const { error: variantsError } = await syncProductVariants(admin, product.id, body.variants);
  if (variantsError) {
    // Best-effort cleanup so a failed variant insert doesn't leave an orphan
    // product with zero variants sitting in the catalog.
    await admin.from("products").delete().eq("id", product.id);
    return NextResponse.json({ error: variantsError }, { status: 500 });
  }

  return NextResponse.json({ id: product.id });
}
