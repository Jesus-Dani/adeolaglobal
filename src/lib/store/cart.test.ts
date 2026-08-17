import { beforeEach, describe, expect, it } from "vitest";
import { useCartStore, cartSubtotal, cartItemCount, type CartItem } from "./cart";

function makeItem(overrides: Partial<CartItem> = {}): Omit<CartItem, "quantity"> {
  return {
    variantId: "v1",
    productId: "p1",
    productSlug: "rosemary-hair-growth-oil-100ml",
    productName: "Rosemary Hair Growth Oil 100ml",
    image: null,
    variantLabel: "100ml",
    unitPrice: 8500,
    stockCount: 25,
    ...overrides,
  };
}

describe("cart store", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it("adds a new item with the requested quantity", () => {
    useCartStore.getState().addItem(makeItem(), 2);
    expect(useCartStore.getState().items).toEqual([{ ...makeItem(), quantity: 2 }]);
  });

  it("increments quantity when the same variant is added again", () => {
    useCartStore.getState().addItem(makeItem(), 1);
    useCartStore.getState().addItem(makeItem(), 1);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it("caps quantity at the variant's stock count", () => {
    useCartStore.getState().addItem(makeItem({ stockCount: 3 }), 5);
    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it("setQuantity removes the item when set to zero", () => {
    useCartStore.getState().addItem(makeItem(), 1);
    useCartStore.getState().setQuantity("v1", 0);
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("setQuantity also caps at stock count", () => {
    useCartStore.getState().addItem(makeItem({ stockCount: 3 }), 1);
    useCartStore.getState().setQuantity("v1", 10);
    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it("removeItem drops only the matching variant", () => {
    useCartStore.getState().addItem(makeItem({ variantId: "v1" }), 1);
    useCartStore.getState().addItem(makeItem({ variantId: "v2" }), 1);
    useCartStore.getState().removeItem("v1");
    expect(useCartStore.getState().items.map((i) => i.variantId)).toEqual(["v2"]);
  });
});

describe("cartSubtotal", () => {
  it("sums unitPrice * quantity across items", () => {
    const items: CartItem[] = [
      { ...makeItem({ variantId: "v1", unitPrice: 8500 }), quantity: 2 },
      { ...makeItem({ variantId: "v2", unitPrice: 7000 }), quantity: 1 },
    ];
    expect(cartSubtotal(items)).toBe(8500 * 2 + 7000);
  });

  it("returns 0 for an empty cart", () => {
    expect(cartSubtotal([])).toBe(0);
  });
});

describe("cartItemCount", () => {
  it("sums quantities, not distinct line count", () => {
    const items: CartItem[] = [
      { ...makeItem({ variantId: "v1" }), quantity: 3 },
      { ...makeItem({ variantId: "v2" }), quantity: 2 },
    ];
    expect(cartItemCount(items)).toBe(5);
  });
});
