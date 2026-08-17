"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "./nav-links";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open menu" />}>
        <Menu strokeWidth={1.5} />
      </SheetTrigger>
      <SheetContent side="left" className="w-3/4 max-w-xs">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="flex items-center gap-2 font-display text-display-m text-deep-plum">
            <Image
              src="/brand/logo-mark.png"
              alt=""
              width={28}
              height={28}
              className="rounded-full"
            />
            ADEOLA
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {NAV_LINKS.map((link) => (
            <SheetClose
              key={link.href}
              nativeButton={false}
              render={
                <Link
                  href={link.href}
                  className="rounded-lg px-3 py-3 text-body-l text-charcoal transition-colors hover:bg-soft-lilac hover:text-deep-plum"
                />
              }
            >
              {link.label}
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
