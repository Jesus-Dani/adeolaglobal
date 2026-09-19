import { createClient } from "@/lib/supabase/client";
import { getVariantPrice } from "@/lib/product-helpers";
import type { WishlistItem } from "./wishlist";

export async function fetchWishlistFromDb(userId: string): Promise<WishlistItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("wishlists")
    .select("products(id, slug, name, base_price, sale_price, images)")
    .eq("user_id", userId);

  if (error) throw error;

  return (data ?? []).flatMap((row) =>
    row.products
      ? [
          {
            productId: row.products.id,
            productSlug: row.products.slug,
            productName: row.products.name,
            image: row.products.images[0] ?? null,
            price: getVariantPrice({ price_override: null }, row.products).price,
          },
        ]
      : [],
  );
}

/** Merges a guest (localStorage) wishlist into the signed-in user's DB wishlist. */
export async function mergeGuestWishlistIntoDb(
  userId: string,
  guestItems: WishlistItem[],
): Promise<WishlistItem[]> {
  if (guestItems.length > 0) {
    const supabase = createClient();
    const rows = guestItems.map((item) => ({ user_id: userId, product_id: item.productId }));
    const { error } = await supabase.from("wishlists").upsert(rows, { onConflict: "user_id,product_id" });
    if (error) throw error;
  }

  return fetchWishlistFromDb(userId);
}

export async function toggleWishlistInDb(userId: string, productId: string, currentlySaved: boolean) {
  const supabase = createClient();
  if (currentlySaved) {
    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("wishlists")
      .upsert({ user_id: userId, product_id: productId }, { onConflict: "user_id,product_id" });
    if (error) throw error;
  }
}
