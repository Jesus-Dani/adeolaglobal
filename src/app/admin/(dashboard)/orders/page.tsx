import Link from "next/link";
import { HairlineDivider } from "@/components/hairline-divider";
import { listOrders, ORDER_STATUSES } from "@/lib/admin/orders";
import { OrderFilters } from "./order-filters";
import { StatusBadge } from "./status-badge";

export const metadata = { title: "Orders | Admin | ADEOLA Global Ltd" };

const currency = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" });

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const params = await searchParams;
  const status = ORDER_STATUSES.find((s) => s === params.status);
  const orders = await listOrders({ status, search: params.search });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-display-l text-deep-plum">Orders</h1>
        <a
          href={`/api/admin/orders/export${status ? `?status=${status}` : ""}`}
          className="text-body-s text-plum hover:text-deep-plum"
        >
          Export CSV
        </a>
      </div>
      <HairlineDivider className="mt-4 max-w-40" />

      <div className="mt-6">
        <OrderFilters initialStatus={params.status ?? ""} initialSearch={params.search ?? ""} />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full text-left text-body-m">
          <thead className="border-b border-border text-body-s text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Subtotal</th>
              <th className="px-4 py-3 font-medium">Placed</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-body-s text-muted-foreground">
                  No orders match these filters.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="text-plum hover:text-deep-plum">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-charcoal">{order.deliveryName}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 tabular-nums text-charcoal">{currency.format(order.subtotal)}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
