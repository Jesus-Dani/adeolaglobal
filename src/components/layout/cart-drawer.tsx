"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import { formatNaira } from "@/lib/currency";
import { useCartStore, cartSubtotal, cartItemCount } from "@/lib/store/cart";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const count = cartItemCount(items);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" aria-label="Open cart" className="relative" />}
      >
        <ShoppingBag strokeWidth={1.5} />
        {count > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4.5 min-w-4.5 px-1 text-[0.65rem]">{count}</Badge>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="font-display text-display-m text-deep-plum">Your Cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty."
            body="Add something you'll love."
            action={{ label: "Shop now", href: "/shop" }}
          />
        ) : (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto px-4">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-soft-lilac">
                    {item.image && (
                      <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-body-m text-charcoal">{item.productName}</p>
                        {item.variantLabel && (
                          <p className="text-body-s text-muted-foreground">{item.variantLabel}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        aria-label="Remove item"
                        onClick={() => removeItem(item.variantId)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-4" strokeWidth={1.5} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                          className="flex size-6 items-center justify-center border border-border hover:bg-muted"
                        >
                          <Minus className="size-3" strokeWidth={1.5} />
                        </button>
                        <span className="w-4 text-center text-body-s tabular-nums">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          disabled={item.quantity >= item.stockCount}
                          onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                          className="flex size-6 items-center justify-center border border-border hover:bg-muted disabled:opacity-40"
                        >
                          <Plus className="size-3" strokeWidth={1.5} />
                        </button>
                      </div>
                      <span className="text-price font-bold tabular-nums text-plum">
                        {formatNaira(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-border p-4">
              <div className="flex items-center justify-between text-body-l">
                <span className="text-charcoal">Subtotal</span>
                <span className="text-price font-bold tabular-nums text-plum">
                  {formatNaira(cartSubtotal(items))}
                </span>
              </div>
              <p className="mt-1 text-body-s text-muted-foreground">
                Delivery is arranged with you after checkout.
              </p>
              <SheetClose
                nativeButton={false}
                render={
                  <Link
                    href="/checkout"
                    className={cn(buttonVariants(), "mt-3 w-full uppercase text-label tracking-wide")}
                  />
                }
              >
                Checkout
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={
                  <Link
                    href="/shop"
                    className={cn(buttonVariants({ variant: "outline" }), "mt-2 w-full uppercase text-label tracking-wide")}
                  />
                }
              >
                Continue Shopping
              </SheetClose>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
