import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  productId: string;
  productSlug: string;
  productName: string;
  image: string | null;
  price: number;
}

interface WishlistState {
  items: WishlistItem[];
  isSaved: (productId: string) => boolean;
  toggle: (item: WishlistItem) => void;
  remove: (productId: string) => void;
  replaceAll: (items: WishlistItem[]) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isSaved: (productId) => get().items.some((i) => i.productId === productId),
      toggle: (item) => {
        const exists = get().items.some((i) => i.productId === item.productId);
        set({
          items: exists
            ? get().items.filter((i) => i.productId !== item.productId)
            : [...get().items, item],
        });
      },
      remove: (productId) => set({ items: get().items.filter((i) => i.productId !== productId) }),
      replaceAll: (items) => set({ items }),
      clear: () => set({ items: [] }),
    }),
    { name: "adeola-wishlist" },
  ),
);
