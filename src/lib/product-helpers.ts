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
