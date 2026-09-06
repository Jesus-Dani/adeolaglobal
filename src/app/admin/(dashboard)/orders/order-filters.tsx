"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/admin/order-status";

export function OrderFilters({ initialStatus, initialSearch }: { initialStatus: string; initialSearch: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(initialSearch);

  function pushParams(status: string, searchValue: string) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (searchValue) params.set("search", searchValue);
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-body-s font-medium text-charcoal">Status</span>
        <select
          value={initialStatus}
          onChange={(e) => pushParams(e.target.value, search)}
          className="rounded-lg border border-border bg-white px-3 py-2 text-body-m text-charcoal"
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-body-s font-medium text-charcoal">Order number</span>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            pushParams(initialStatus, search);
          }}
        >
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ADG-0001"
            className="w-48"
          />
        </form>
      </label>
    </div>
  );
}
