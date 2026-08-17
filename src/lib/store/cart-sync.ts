import { createClient } from "@/lib/supabase/client";
import type { CartItem } from "./cart";

function variantLabel(v: { size: string | null; colour: string | null; material: string | null; style: string | null }) {
  return [v.size, v.colour, v.material, v.style].filter(Boolean).join(" / ") || null;
}

/**
 * Loads the signed-in user's DB cart, joined with product/variant info for
 * display. Two queries rather than a single 2-level embed (cart_items ->
 * product_variants -> products) — our hand-written Database type has no
 * Relationships metadata (only `supabase gen types` normally provides that),
 * so multi-level embeds can't be inferred and fall back to `never`. A
 * 1-level embed (variant -> product) infers fine.
 */
export async function fetchCartFromDb(userId: string): Promise<CartItem[]> {
  const supabase = createClient();

  const { data: items, error: itemsError } = await supabase
    .from("cart_items")
    .select("variant_id, quantity")
    .eq("cart_id", userId);
  if (itemsError) throw itemsError;
  if (!items || items.length === 0) return [];

  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select(
      "id, size, colour, material, style, price_override, stock_count, products(id, slug, name, base_price, images)",
    )
    .in(
      "id",
      items.map((i) => i.variant_id),
    );
  if (variantsError) throw variantsError;

  const variantById = new Map((variants ?? []).map((v) => [v.id, v]));

  return items.flatMap((item) => {
    const variant = variantById.get(item.variant_id);
    if (!variant || !variant.products) return [];
    const product = variant.products;
    return [
      {
        variantId: variant.id,
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        image: product.images[0] ?? null,
        variantLabel: variantLabel(variant),
        unitPrice: variant.price_override ?? product.base_price,
        quantity: item.quantity,
        stockCount: variant.stock_count,
      },
    ];
  });
}

/**
 * Merges a guest (localStorage) cart into the signed-in user's DB cart —
 * quantities add together, capped at stock, per TRD.md s3's guest/account
 * merge-on-login requirement. Returns the merged, DB-authoritative cart.
 */
export async function mergeGuestCartIntoDb(userId: string, guestItems: CartItem[]): Promise<CartItem[]> {
  if (guestItems.length === 0) return fetchCartFromDb(userId);

  const supabase = createClient();
  const existing = await fetchCartFromDb(userId);
  const existingByVariant = new Map(existing.map((i) => [i.variantId, i]));

  const upserts = guestItems.map((guestItem) => {
    const current = existingByVariant.get(guestItem.variantId);
    const quantity = Math.min(
      (current?.quantity ?? 0) + guestItem.quantity,
      guestItem.stockCount,
    );
    return { cart_id: userId, variant_id: guestItem.variantId, quantity };
  });

  const { error } = await supabase.from("cart_items").upsert(upserts, { onConflict: "cart_id,variant_id" });
  if (error) throw error;

  return fetchCartFromDb(userId);
}

export async function setCartItemQuantityInDb(userId: string, variantId: string, quantity: number) {
  const supabase = createClient();
  if (quantity <= 0) {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", userId)
      .eq("variant_id", variantId);
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from("cart_items")
    .upsert({ cart_id: userId, variant_id: variantId, quantity }, { onConflict: "cart_id,variant_id" });
  if (error) throw error;
}
