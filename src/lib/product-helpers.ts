// Pure types/helpers with no server-only imports, so Client Components can
// use them without pulling src/lib/supabase/server.ts (next/headers) into
// the browser bundle. src/lib/products.ts (the actual data-fetching layer,
// server-only) re-exports these too.

import type { PublicProduct, ProductVariant } from "@/lib/supabase/types";

export type ProductWithVariants = PublicProduct & {
  product_variants: Pick<
    ProductVariant,
    "id" | "size" | "colour" | "material" | "style" | "sku" | "price_override" | "stock_count"
  >[];
};

/** A product is out of stock when every variant is (or it has none at all). */
export function isOutOfStock(product: Pick<ProductWithVariants, "product_variants">): boolean {
  return (
    product.product_variants.length === 0 ||
    product.product_variants.every((v) => v.stock_count <= 0)
  );
}

export interface VariantPrice {
  /** What the customer actually pays. */
  price: number;
  /** The struck-through "was" price, or null when this variant isn't on sale. */
  compareAtPrice: number | null;
}

/**
 * The one place price/sale precedence is decided: a variant's own
 * price_override always wins outright (it was set deliberately for that
 * variant, unrelated to any storefront-wide sale). Otherwise, a product's
 * sale_price applies when it's actually lower than base_price. Every
 * consumer (storefront display, add-to-cart, and checkout's server-side
 * repricing) calls this instead of recomputing the rule itself, so they
 * can never quietly drift out of sync with each other.
 */
export function getVariantPrice(
  variant: { price_override: number | null },
  product: { base_price: number; sale_price: number | null },
): VariantPrice {
  if (variant.price_override != null) {
    return { price: variant.price_override, compareAtPrice: null };
  }
  if (product.sale_price != null && product.sale_price < product.base_price) {
    return { price: product.sale_price, compareAtPrice: product.base_price };
  }
  return { price: product.base_price, compareAtPrice: null };
}
