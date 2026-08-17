"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
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
import { cn } from "@/lib/utils";

/**
 * Cart state (items, totals) lands in Phase 2 — TRD.md s5. This wires up the
 * slide-out drawer shell and the empty-state pattern (UI-Design-Brief.md s11)
 * so it's ready to receive real cart data without a layout change.
 */
export function CartDrawer({ itemCount = 0 }: { itemCount?: number }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" aria-label="Open cart" className="relative" />}
      >
        <ShoppingBag strokeWidth={1.5} />
        {itemCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4.5 min-w-4.5 px-1 text-[0.65rem]">
            {itemCount}
          </Badge>
        )}
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="font-display text-display-m text-deep-plum">
            Your Cart
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <ShoppingBag className="size-10 text-plum/40" strokeWidth={1.5} aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-body-l text-charcoal">Your cart is empty.</p>
            <p className="text-body-m text-muted-foreground">Add something you&apos;ll love.</p>
          </div>
          <SheetClose
            nativeButton={false}
            render={
              <Link
                href="/shop"
                className={cn(buttonVariants(), "uppercase text-label tracking-wide")}
              />
            }
          >
            Shop now
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
