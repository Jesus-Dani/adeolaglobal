import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  image: string | null;
  /** e.g. "100ml", "Lilac" — the variant's distinguishing attribute(s), joined for display. */
  variantLabel: string | null;
  /** Snapshotted at add-time (price_override ?? base_price), same convention Phase 3's order_items will use. */
  unitPrice: number;
  quantity: number;
  stockCount: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  replaceAll: (items: CartItem[]) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.variantId === item.variantId);

        if (existing) {
          set({
            items: items.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: Math.min(i.quantity + quantity, i.stockCount) }
                : i,
            ),
          });
          return;
        }

        set({ items: [...items, { ...item, quantity: Math.min(quantity, item.stockCount) }] });
      },

      removeItem: (variantId) => set({ items: get().items.filter((i) => i.variantId !== variantId) }),

      setQuantity: (variantId, quantity) =>
        set({
          items:
            quantity <= 0
              ? get().items.filter((i) => i.variantId !== variantId)
              : get().items.map((i) =>
                  i.variantId === variantId ? { ...i, quantity: Math.min(quantity, i.stockCount) } : i,
                ),
        }),

      replaceAll: (items) => set({ items }),
      clear: () => set({ items: [] }),
    }),
    { name: "adeola-cart" },
  ),
);

// Pure derived helpers — kept outside the store so they're trivially unit
// testable without mounting React or touching localStorage (TRD.md s8).
export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
