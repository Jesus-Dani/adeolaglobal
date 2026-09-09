"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminSidebar, COLLAPSED_STORAGE_KEY } from "./admin-sidebar";
import { AdminMobileNav } from "./admin-mobile-nav";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Must read localStorage after mount, not during the initial render —
    // reading it synchronously would return a different value on the
    // client than what was server-rendered (always "expanded"), causing a
    // real hydration mismatch. This is the one legitimate case for
    // setState-in-effect: syncing from an external store React can't see
    // during SSR.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(localStorage.getItem(COLLAPSED_STORAGE_KEY) === "true");
    } catch {
      // Private browsing / storage disabled — default (expanded) is fine.
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next));
      } catch {
        // Nothing to persist to — the toggle still works for this session.
      }
      return next;
    });
  }

  return (
    <div className="flex min-h-screen bg-soft-lilac">
      <AdminSidebar collapsed={collapsed} onToggle={toggleCollapsed} />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-white px-4 sm:px-6 lg:hidden">
          <AdminMobileNav />
          <Link href="/admin" className="font-display text-display-m text-deep-plum">
            ADEOLA Admin
          </Link>
        </div>

        <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
