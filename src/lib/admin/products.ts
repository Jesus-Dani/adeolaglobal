import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, ProductStatus } from "@/lib/supabase/types";

export interface ProductVariantInput {
  id?: string;
  size?: string | null;
  colour?: string | null;
  material?: string | null;
  style?: string | null;
  sku: string;
  priceOverride?: number | null;
  stockCount: number;
  lowStockThreshold?: number;
}

export interface ProductInput {
  name: string;
  slug: string;
  description?: string | null;
  categoryId: string;
  basePrice: number;
  costPrice?: number | null;
  status: ProductStatus;
  isBestseller?: boolean;
  isNew?: boolean;
  images: string[];
  variants: ProductVariantInput[];
}

/**
 * Upserts a product's variants against the submitted list: variants with an
 * `id` are updated, variants without one are inserted, and any existing
 * variant not present in the submitted list is deleted. Used by both create
 * and update so the admin form always just submits "the whole product" and
 * doesn't need to track which variant operations happened client-side.
 */
export async function syncProductVariants(
  admin: SupabaseClient<Database>,
  productId: string,
  variants: ProductVariantInput[],
): Promise<{ error: string | null }> {
  const { data: existing, error: fetchError } = await admin
    .from("product_variants")
    .select("id")
    .eq("product_id", productId);

  if (fetchError) return { error: fetchError.message };

  const existingIds = new Set((existing ?? []).map((v) => v.id));
  const submittedIds = new Set(variants.filter((v) => v.id).map((v) => v.id));

  const idsToDelete = [...existingIds].filter((id) => !submittedIds.has(id));
  if (idsToDelete.length > 0) {
    const { error } = await admin.from("product_variants").delete().in("id", idsToDelete);
    if (error) return { error: error.message };
  }

  const toUpdate = variants.filter((v) => v.id);
  const toInsert = variants.filter((v) => !v.id);

  for (const variant of toUpdate) {
    const { error } = await admin
      .from("product_variants")
      .update({
        size: variant.size ?? null,
        colour: variant.colour ?? null,
        material: variant.material ?? null,
        style: variant.style ?? null,
        sku: variant.sku,
        price_override: variant.priceOverride ?? null,
        stock_count: variant.stockCount,
        low_stock_threshold: variant.lowStockThreshold ?? 5,
      })
      .eq("id", variant.id!);
    if (error) return { error: error.message };
  }

  if (toInsert.length > 0) {
    const { error } = await admin.from("product_variants").insert(
      toInsert.map((variant) => ({
        product_id: productId,
        size: variant.size ?? null,
        colour: variant.colour ?? null,
        material: variant.material ?? null,
        style: variant.style ?? null,
        sku: variant.sku,
        price_override: variant.priceOverride ?? null,
        stock_count: variant.stockCount,
        low_stock_threshold: variant.lowStockThreshold ?? 5,
      })),
    );
    if (error) return { error: error.message };
  }

  return { error: null };
}
