"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_LINKS } from "./admin-nav-links";

const COLLAPSED_STORAGE_KEY = "adeola-admin-sidebar-collapsed";

export function AdminSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-white/10 bg-deep-plum text-white transition-[width] duration-200 lg:flex",
        collapsed ? "w-[72px]" : "w-60",
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && (
          <Link href="/admin" className="truncate font-display text-body-l font-semibold">
            ADEOLA Admin
          </Link>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white",
            collapsed && "mx-auto",
          )}
        >
          {collapsed ? <ChevronRight className="size-4" strokeWidth={1.5} /> : <ChevronLeft className="size-4" strokeWidth={1.5} />}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
        {ADMIN_NAV_LINKS.map((link) => {
          const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              title={link.label}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-s transition-colors",
                collapsed && "justify-center px-0",
                active ? "bg-white/10 font-medium text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="size-5 shrink-0" strokeWidth={1.5} />
              {!collapsed && <span className="truncate">{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={handleLogout}
          title="Log out"
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-body-s text-white/70 transition-colors hover:bg-white/5 hover:text-white",
            collapsed && "justify-center px-0",
          )}
        >
          <LogOut className="size-5 shrink-0" strokeWidth={1.5} />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
}

export { COLLAPSED_STORAGE_KEY };
