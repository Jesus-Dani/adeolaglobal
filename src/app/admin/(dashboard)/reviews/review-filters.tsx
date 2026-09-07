"use client";

import { useRouter, usePathname } from "next/navigation";
import { REVIEW_STATUSES, REVIEW_STATUS_LABELS } from "@/lib/admin/review-status";

export function ReviewFilters({ initialStatus }: { initialStatus: string }) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(status: string) {
    router.push(status ? `${pathname}?status=${status}` : pathname);
  }

  return (
    <label className="flex flex-col gap-1">
      <span className="text-body-s font-medium text-charcoal">Status</span>
      <select
        value={initialStatus}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-border bg-white px-3 py-2 text-body-m text-charcoal"
      >
        <option value="">All statuses</option>
        {REVIEW_STATUSES.map((s) => (
          <option key={s} value={s}>
            {REVIEW_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </label>
  );
}
