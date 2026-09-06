"use client";

import { useState } from "react";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatNaira } from "@/lib/currency";
import { isOutOfStock, type ProductWithVariants } from "@/lib/product-helpers";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import {
  getActiveAttributes,
  getAttributeValues,
  resolveVariant,
  defaultSelection,
  type VariantSelection,
} from "@/lib/variant-selection";

const ATTRIBUTE_LABELS: Record<string, string> = {
  size: "Size",
  colour: "Colour",
  material: "Material",
  style: "Style",
};

export function PdpPurchasePanel({ product }: { product: ProductWithVariants }) {
  const variants = product.product_variants;
  const activeAttributes = getActiveAttributes(variants);
  const [selection, setSelection] = useState<VariantSelection>(() => defaultSelection(variants));
  const [quantity, setQuantity] = useState(1);

  const addItem = useCartStore((s) => s.addItem);
  const isSaved = useWishlistStore((s) => s.isSaved(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const selectedVariant = resolveVariant(variants, selection);
  const productOutOfStock = isOutOfStock(product);
  const price = selectedVariant?.price_override ?? product.base_price;

  function handleAddToCart() {
    if (!selectedVariant) return;
    addItem(
      {
        variantId: selectedVariant.id,
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        image: product.images[0] ?? null,
        variantLabel:
          [selectedVariant.size, selectedVariant.colour, selectedVariant.material, selectedVariant.style]
            .filter(Boolean)
            .join(" / ") || null,
        unitPrice: price,
        stockCount: selectedVariant.stock_count,
      },
      quantity,
    );
    setQuantity(1);
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-price font-bold tabular-nums text-plum">{formatNaira(price)}</p>

      {activeAttributes.map((attr) => (
        <div key={attr} className="flex flex-col gap-2">
          <span className="text-body-s font-medium text-charcoal">{ATTRIBUTE_LABELS[attr]}</span>
          <div className="flex flex-wrap gap-2">
            {getAttributeValues(variants, attr).map((value) => {
              const selected = selection[attr] === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelection((s) => ({ ...s, [attr]: value }))}
                  aria-pressed={selected}
                  className={cn(
                    "border px-3 py-1.5 text-body-s transition-colors",
                    selected
                      ? "border-plum bg-plum text-white"
                      : "border-border bg-white text-charcoal hover:border-plum",
                  )}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selectedVariant && (
        <p className="text-body-s text-muted-foreground">
          {selectedVariant.stock_count > 0
            ? `${selectedVariant.stock_count} in stock`
            : "Out of stock"}
        </p>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 border border-border px-2 py-1">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex size-7 items-center justify-center hover:bg-muted"
          >
            <Minus className="size-3.5" strokeWidth={1.5} />
          </button>
          <span className="w-6 text-center tabular-nums">{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={!selectedVariant || quantity >= selectedVariant.stock_count}
            onClick={() => setQuantity((q) => q + 1)}
            className="flex size-7 items-center justify-center hover:bg-muted disabled:opacity-40"
          >
            <Plus className="size-3.5" strokeWidth={1.5} />
          </button>
        </div>

        <Button
          size="lg"
          disabled={!selectedVariant || productOutOfStock || selectedVariant.stock_count === 0}
          onClick={handleAddToCart}
          className="flex-1 uppercase text-label tracking-wide"
        >
          <ShoppingBag strokeWidth={1.5} />
          {productOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>

        <button
          type="button"
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isSaved}
          onClick={() =>
            toggleWishlist({
              productId: product.id,
              productSlug: product.slug,
              productName: product.name,
              image: product.images[0] ?? null,
              price: product.base_price,
            })
          }
          className="flex size-11 shrink-0 items-center justify-center border border-border hover:border-plum"
        >
          <Heart className={cn("size-5", isSaved ? "fill-plum text-plum" : "text-charcoal")} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
