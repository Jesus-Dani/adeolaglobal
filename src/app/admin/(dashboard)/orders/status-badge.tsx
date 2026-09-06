import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/admin/order-status";
import type { OrderStatus } from "@/lib/supabase/types";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  out_for_delivery: "bg-sky-100 text-sky-800",
  delivered: "bg-emerald-100 text-emerald-800",
  payment_failed: "bg-destructive/10 text-destructive",
  stock_conflict: "bg-orange-100 text-orange-800",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-body-s font-medium",
        STATUS_STYLES[status],
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
