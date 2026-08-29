"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const ADMIN_NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/revenue", label: "Revenue" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/categories", label: "Categories" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-deep-plum text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 overflow-x-auto px-4 sm:px-6 lg:px-8">
        <Link href="/admin" className="shrink-0 font-display text-display-m">
          ADEOLA Admin
        </Link>

        <nav className="flex items-center gap-5">
          {ADMIN_NAV_LINKS.map((link) => {
            const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "whitespace-nowrap text-body-s transition-colors hover:text-white",
                  active ? "text-white font-medium" : "text-white/70",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="ml-auto shrink-0 whitespace-nowrap text-body-s text-white/70 hover:text-white"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
