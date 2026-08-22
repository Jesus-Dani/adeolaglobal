"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, X } from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlist";
import { EmptyState } from "@/components/empty-state";
import { HairlineDivider } from "@/components/hairline-divider";
import { formatNaira } from "@/lib/currency";

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const remove = useWishlistStore((s) => s.remove);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-display-l text-deep-plum">Your Wishlist</h1>
      <HairlineDivider className="mt-4 max-w-40" />

      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty."
          body="Save items you'll love for later."
          action={{ label: "Shop now", href: "/shop" }}
        />
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white"
            >
              <div className="relative aspect-square overflow-hidden bg-soft-lilac">
                <Link href={`/shop/${item.productSlug}`} className="relative block h-full w-full">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      sizes="(min-width: 1024px) 25vw, 45vw"
                      className="object-cover transition-transform group-hover:scale-[1.02]"
                    />
                  )}
                </Link>
                <button
                  type="button"
                  aria-label="Remove from wishlist"
                  onClick={() => remove(item.productId)}
                  className="absolute top-2 right-2 flex size-8 items-center justify-center bg-white/90 shadow-sm hover:bg-white"
                >
                  <X className="size-4 text-charcoal" strokeWidth={1.5} />
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <Link href={`/shop/${item.productSlug}`}>
                  <h3 className="line-clamp-2 text-body-m text-charcoal">{item.productName}</h3>
                </Link>
                <p className="mt-auto text-price font-bold tabular-nums text-plum">
                  {formatNaira(item.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
