import { notFound } from "next/navigation";
import { HairlineDivider } from "@/components/hairline-divider";
import { getOrderDetail } from "@/lib/admin/orders";
import { StatusBadge } from "../status-badge";
import { StatusControl } from "./status-control";

export const metadata = { title: "Order | Admin | ADEOLA Global Ltd" };

const currency = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" });

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderDetail(id);
  if (!order) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-display-l text-deep-plum">{order.orderNumber}</h1>
          <p className="mt-1 text-body-s text-muted-foreground">
            Placed {new Date(order.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <StatusControl orderId={order.id} currentStatus={order.status} />
        </div>
      </div>
      <HairlineDivider className="mt-4 max-w-40" />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-body-m font-medium text-charcoal">Items</h2>
          <div className="mt-2 overflow-x-auto rounded-xl border border-border bg-white">
            <table className="w-full text-left text-body-m">
              <thead className="border-b border-border text-body-s text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Variant</th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-charcoal">{item.productName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.variantLabel}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.sku}</td>
                    <td className="px-4 py-3 tabular-nums text-charcoal">{item.quantity}</td>
                    <td className="px-4 py-3 tabular-nums text-charcoal">
                      {currency.format(item.priceAtPurchase)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border font-medium">
                  <td colSpan={4} className="px-4 py-3 text-right text-charcoal">
                    Subtotal
                  </td>
                  <td className="px-4 py-3 tabular-nums text-charcoal">{currency.format(order.subtotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-border bg-white p-4">
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

          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-body-m font-medium text-charcoal">Payment</h2>
            {order.payment ? (
              <dl className="mt-2 space-y-1 text-body-s">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Reference</dt>
                  <dd className="text-charcoal">{order.payment.paystackReference}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="text-charcoal">{order.payment.status}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Channel</dt>
                  <dd className="text-charcoal">{order.payment.channel ?? "-"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Amount</dt>
                  <dd className="text-charcoal">{currency.format(order.payment.amount)}</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-2 text-body-s text-muted-foreground">No payment record yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
