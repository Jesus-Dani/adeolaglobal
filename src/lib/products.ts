import { createClient } from "@/lib/supabase/server";
import type { Category, PublicProduct, ProductVariant } from "@/lib/supabase/types";

// Explicit column list — never `select('*')`. cost_price is admin-only (see
// the Phase 1 migration's column-privilege revoke); a storefront query for
// it would simply fail.
const PRODUCT_COLUMNS =
  "id, category_id, name, slug, description, base_price, images, status, is_bestseller, is_new, created_at, updated_at";

const VARIANT_COLUMNS = "id, size, colour, material, style, sku, price_override, stock_count";

export type ProductWithVariants = PublicProduct & {
  product_variants: Pick<
    ProductVariant,
    "id" | "size" | "colour" | "material" | "style" | "sku" | "price_override" | "stock_count"
  >[];
};

export interface GetProductsParams {
  /** Category slug. */
  category?: string;
  search?: string;
  sort?: "price_asc" | "price_desc" | "newest" | "featured";
  minPrice?: number;
  maxPrice?: number;
}

export async function getProducts(params: GetProductsParams = {}): Promise<ProductWithVariants[]> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(`${PRODUCT_COLUMNS}, product_variants(${VARIANT_COLUMNS})`)
    .eq("status", "active");

  if (params.category) {
    const category = await getCategoryBySlug(params.category);
    if (!category) return [];
    query = query.eq("category_id", category.id);
  }

  if (params.search) {
    query = query.textSearch("fts", params.search, { type: "websearch" });
  }

  if (params.minPrice != null) query = query.gte("base_price", params.minPrice);
  if (params.maxPrice != null) query = query.lte("base_price", params.maxPrice);

  switch (params.sort) {
    case "price_asc":
      query = query.order("base_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("base_price", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("is_bestseller", { ascending: false }).order("name", { ascending: true });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getProductBySlug(slug: string): Promise<ProductWithVariants | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`${PRODUCT_COLUMNS}, product_variants(${VARIANT_COLUMNS})`)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, sort_order, created_at")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, sort_order, created_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** A product is out of stock when every variant is (or it has none at all). */
export function isOutOfStock(product: Pick<ProductWithVariants, "product_variants">): boolean {
  return (
    product.product_variants.length === 0 ||
    product.product_variants.every((v) => v.stock_count <= 0)
  );
}
