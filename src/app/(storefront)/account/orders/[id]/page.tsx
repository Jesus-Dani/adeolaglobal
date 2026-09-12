import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HairlineDivider } from "@/components/hairline-divider";
import { BankTransferDetails } from "@/components/bank-transfer-details";
import { getMyOrderDetail } from "@/lib/orders";
import { formatNaira } from "@/lib/currency";
import { ORDER_STATUS_LABELS } from "@/lib/admin/order-status";

export const metadata = { title: "Order Detail | ADEOLA Global Ltd" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/account/orders/${id}`);

  const order = await getMyOrderDetail(supabase, user.id, id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-display-l text-deep-plum">{order.orderNumber}</h1>
        <span className="rounded-full bg-soft-lilac px-2.5 py-1 text-body-s font-medium text-deep-plum">
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>
      <p className="mt-1 text-body-s text-muted-foreground">
        Placed {new Date(order.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
      </p>
      <HairlineDivider className="mt-4 max-w-40" />

      {order.status === "pending" && (
        <div className="mt-6">
          <BankTransferDetails amount={order.subtotal} />
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-white">
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
          {order.deliveryNotes && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Notes</dt>
              <dd className="text-right text-charcoal">{order.deliveryNotes}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
