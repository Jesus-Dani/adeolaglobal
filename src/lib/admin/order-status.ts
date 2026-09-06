import type { OrderStatus } from "@/lib/supabase/types";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "out_for_delivery",
  "delivered",
  "payment_failed",
  "stock_conflict",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  payment_failed: "Payment failed",
  stock_conflict: "Stock conflict",
};
