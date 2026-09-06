"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/admin/order-status";
import type { OrderStatus } from "@/lib/supabase/types";

export function StatusControl({ orderId, currentStatus }: { orderId: string; currentStatus: OrderStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(next: OrderStatus) {
    setSaving(true);
    setError(null);
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    const body = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(body.error);
      return;
    }
    setStatus(next);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        disabled={saving}
        onChange={(e) => handleChange(e.target.value as OrderStatus)}
        className="rounded-lg border border-border bg-white px-3 py-2 text-body-s text-charcoal"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      {error && <span className="text-body-s text-destructive">{error}</span>}
    </div>
  );
}
