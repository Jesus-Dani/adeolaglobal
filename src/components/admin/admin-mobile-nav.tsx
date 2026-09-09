"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, LogOut } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_LINKS } from "./admin-nav-links";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open admin menu" />}>
        <Menu strokeWidth={1.5} />
      </SheetTrigger>
      <SheetContent side="left" className="flex w-3/4 max-w-xs flex-col bg-deep-plum text-white">
        <SheetHeader className="border-b border-white/10">
          <SheetTitle className="font-display text-display-m text-white">ADEOLA Admin</SheetTitle>
        </SheetHeader>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
          {ADMIN_NAV_LINKS.map((link) => {
            const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <SheetClose
                key={link.href}
                nativeButton={false}
                render={
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-m transition-colors",
                      active ? "bg-white/10 font-medium text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
                    )}
                  />
                }
              >
                <Icon className="size-5 shrink-0" strokeWidth={1.5} />
                {link.label}
              </SheetClose>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-body-m text-white/70 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="size-5 shrink-0" strokeWidth={1.5} />
            Log out
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
