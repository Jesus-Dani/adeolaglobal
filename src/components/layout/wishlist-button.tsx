"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWishlistStore } from "@/lib/store/wishlist";

export function WishlistButton() {
  const count = useWishlistStore((s) => s.items.length);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Wishlist"
      className="relative"
      nativeButton={false}
      render={<Link href="/wishlist" />}
    >
      <Heart strokeWidth={1.5} />
      {count > 0 && (
        <Badge className="absolute -top-1 -right-1 h-4.5 min-w-4.5 px-1 text-[0.65rem]">{count}</Badge>
      )}
    </Button>
  );
}
