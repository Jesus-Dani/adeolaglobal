"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNaira } from "@/lib/currency";
import { isOutOfStock, type ProductWithVariants } from "@/lib/product-helpers";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { Button } from "@/components/ui/button";

export function ProductCard({ product }: { product: ProductWithVariants }) {
  const outOfStock = isOutOfStock(product);
  const addItem = useCartStore((s) => s.addItem);
  const isSaved = useWishlistStore((s) => s.isSaved(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const singleVariant = product.product_variants.length === 1 ? product.product_variants[0] : null;
  const image = product.images[0] ?? null;

  function handleAddToCart() {
    if (!singleVariant || outOfStock) return;
    addItem(
      {
        variantId: singleVariant.id,
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        image,
        variantLabel: [singleVariant.size, singleVariant.colour, singleVariant.material, singleVariant.style]
          .filter(Boolean)
          .join(" / ") || null,
        unitPrice: singleVariant.price_override ?? product.base_price,
        stockCount: singleVariant.stock_count,
      },
      1,
    );
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-soft-lilac">
        <Link href={`/shop/${product.slug}`} className="block h-full w-full">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, 45vw"
              className={cn(
                "object-cover transition-transform group-hover:scale-[1.02]",
                outOfStock && "grayscale opacity-60",
              )}
            />
          ) : null}
        </Link>

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {outOfStock ? (
            <span className="rounded-md bg-muted px-2 py-0.5 text-body-s font-medium text-muted-foreground">
              Out of stock
            </span>
          ) : product.is_bestseller ? (
            <span className="rounded-md bg-gold/15 px-2 py-0.5 text-body-s font-medium text-deep-plum">
              Bestseller
            </span>
          ) : product.is_new ? (
            <span className="rounded-md bg-soft-lilac px-2 py-0.5 text-body-s font-medium text-deep-plum">
              New
            </span>
          ) : null}
        </div>

        <button
          type="button"
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isSaved}
          onClick={() =>
            toggleWishlist({
              productId: product.id,
              productSlug: product.slug,
              productName: product.name,
              image,
              price: product.base_price,
            })
          }
          className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors hover:bg-white"
        >
          <Heart
            className={cn("size-4 transition-colors", isSaved ? "fill-plum text-plum" : "text-charcoal")}
            strokeWidth={1.5}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/shop/${product.slug}`}>
          <h3 className="line-clamp-2 text-body-m text-charcoal">{product.name}</h3>
        </Link>
        <p className="text-price font-bold tabular-nums text-plum">{formatNaira(product.base_price)}</p>

        {singleVariant ? (
          <Button
            size="sm"
            disabled={outOfStock}
            onClick={handleAddToCart}
            className="mt-auto w-full uppercase text-label tracking-wide"
          >
            <ShoppingBag strokeWidth={1.5} />
            Add to Cart
          </Button>
        ) : (
          <Link
            href={`/shop/${product.slug}`}
            className="mt-auto flex h-8 w-full items-center justify-center rounded-lg bg-primary text-label text-primary-foreground uppercase tracking-wide hover:bg-primary/80"
          >
            Select Options
          </Link>
        )}
      </div>
    </div>
  );
}
