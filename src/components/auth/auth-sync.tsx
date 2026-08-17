"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { mergeGuestCartIntoDb } from "@/lib/store/cart-sync";
import { mergeGuestWishlistIntoDb } from "@/lib/store/wishlist-sync";

/**
 * Mounted once in the root layout. Bridges the guest-only Zustand stores
 * (src/lib/store/*) with the DB once a session exists — merges whatever was
 * in localStorage into the user's account on sign-in (TRD.md s3), and clears
 * local state on sign-out so the next person on a shared device doesn't see
 * someone else's cart.
 */
export function AuthSync() {
  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const userId = session?.user.id;
      if (event === "SIGNED_IN" && userId) {
        const guestCart = useCartStore.getState().items;
        const guestWishlist = useWishlistStore.getState().items;

        const [mergedCart, mergedWishlist] = await Promise.all([
          mergeGuestCartIntoDb(userId, guestCart),
          mergeGuestWishlistIntoDb(userId, guestWishlist),
        ]);

        useCartStore.getState().replaceAll(mergedCart);
        useWishlistStore.getState().replaceAll(mergedWishlist);
      }

      if (event === "SIGNED_OUT") {
        useCartStore.getState().clear();
        useWishlistStore.getState().clear();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
