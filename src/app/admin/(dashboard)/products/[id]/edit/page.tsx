import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { HairlineDivider } from "@/components/hairline-divider";
import type { ProductInput } from "@/lib/admin/products";
import { ProductForm } from "../../product-form";

export const metadata = { title: "Edit Product | Admin | ADEOLA Global Ltd" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: categories, error: categoriesError }, { data: product, error: productError }] =
    await Promise.all([
      admin.from("categories").select("id, name").order("sort_order", { ascending: true }),
      admin
        .from("products")
        .select(
          "name, slug, description, category_id, base_price, cost_price, status, is_bestseller, is_new, images, product_variants(id, size, colour, material, style, sku, price_override, stock_count, low_stock_threshold)",
        )
        .eq("id", id)
        .maybeSingle(),
    ]);

  if (categoriesError) throw categoriesError;
  if (productError) throw productError;
  if (!product) notFound();

  const initial: ProductInput = {
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryId: product.category_id,
    basePrice: product.base_price,
    costPrice: product.cost_price,
    status: product.status,
    isBestseller: product.is_bestseller,
    isNew: product.is_new,
    images: product.images,
    variants: product.product_variants.map((v) => ({
      id: v.id,
      size: v.size,
      colour: v.colour,
      material: v.material,
      style: v.style,
      sku: v.sku,
      priceOverride: v.price_override,
      stockCount: v.stock_count,
      lowStockThreshold: v.low_stock_threshold,
    })),
  };

  return (
    <div>
      <h1 className="font-display text-display-l text-deep-plum">Edit Product</h1>
      <HairlineDivider className="mt-4 max-w-40" />
      <div className="mt-8 max-w-4xl">
        <ProductForm categories={categories ?? []} productId={id} initial={initial} />
      </div>
    </div>
  );
}
