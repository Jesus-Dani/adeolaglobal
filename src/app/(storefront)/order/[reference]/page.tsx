import { redirect, notFound } from "next/navigation";
import { CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getOrderByReference } from "@/lib/orders";
import { formatNaira } from "@/lib/currency";
import { HairlineDivider } from "@/components/hairline-divider";
import { OrderStatusPoller } from "./order-status-poller";

export const metadata = { title: "Order Confirmation | ADEOLA Global Ltd" };

const STATUS_BANNER = {
  pending: {
    icon: Clock,
    title: "Confirming your payment...",
    body: "This usually takes just a few seconds. This page will update on its own.",
  },
  confirmed: {
    icon: CheckCircle2,
    title: "Payment confirmed!",
    body: "Thank you — your order is being prepared.",
  },
  out_for_delivery: {
    icon: CheckCircle2,
    title: "Payment confirmed!",
    body: "Thank you — your order is on its way.",
  },
  delivered: {
    icon: CheckCircle2,
    title: "Payment confirmed!",
    body: "This order has already been delivered.",
  },
  stock_conflict: {
    icon: AlertTriangle,
    title: "Payment received",
    body: "There's a stock issue with one or more items — we'll reach out shortly to sort it out.",
  },
  payment_failed: {
    icon: XCircle,
    title: "Payment did not go through",
    body: "You have not been charged. Please try checking out again.",
  },
} as const;

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/order/${reference}`);

  const order = await getOrderByReference(supabase, user.id, reference);
  if (!order) notFound();

  const banner = STATUS_BANNER[order.status];
  const Icon = banner.icon;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {order.status === "pending" && <OrderStatusPoller reference={reference} />}

      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-white p-8 text-center">
        <Icon
          className={
            order.status === "payment_failed"
              ? "size-10 text-destructive"
              : order.status === "stock_conflict"
                ? "size-10 text-gold"
                : "size-10 text-plum"
          }
          strokeWidth={1.5}
        />
        <p className="font-display text-display-m text-deep-plum">{banner.title}</p>
        <p className="text-body-m text-muted-foreground">{banner.body}</p>
        <p className="mt-1 text-body-s text-muted-foreground">Order {order.orderNumber}</p>
      </div>

      {order.status !== "payment_failed" && (
        <>
          <HairlineDivider className="mt-8 mb-6 max-w-40" />

          <div className="overflow-x-auto rounded-xl border border-border bg-white">
            <table className="w-full text-left text-body-m">
              <thead className="border-b border-border text-body-s text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Variant</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-charcoal">{item.productName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.variantLabel}</td>
                    <td className="px-4 py-3 tabular-nums text-charcoal">{item.quantity}</td>
                    <td className="px-4 py-3 tabular-nums text-charcoal">{formatNaira(item.priceAtPurchase)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border font-medium">
                  <td colSpan={3} className="px-4 py-3 text-right text-charcoal">
                    Subtotal
                  </td>
                  <td className="px-4 py-3 tabular-nums text-charcoal">{formatNaira(order.subtotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-white p-4">
            <h2 className="text-body-m font-medium text-charcoal">Delivery</h2>
            <dl className="mt-2 space-y-1 text-body-s">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Name</dt>
                <dd className="text-charcoal">{order.deliveryName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="text-charcoal">{order.deliveryPhone}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Address</dt>
                <dd className="text-right text-charcoal">{order.deliveryAddress}</dd>
              </div>
            </dl>
          </div>
        </>
      )}
    </div>
  );
}
