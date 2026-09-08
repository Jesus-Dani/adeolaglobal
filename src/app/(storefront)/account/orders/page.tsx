import { redirect } from "next/navigation";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HairlineDivider } from "@/components/hairline-divider";
import { EmptyState } from "@/components/empty-state";
import { getMyOrders } from "@/lib/orders";
import { formatNaira } from "@/lib/currency";
import { ORDER_STATUS_LABELS } from "@/lib/admin/order-status";

export const metadata = { title: "Order History | ADEOLA Global Ltd" };

export default async function OrderHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account/orders");

  const orders = await getMyOrders(supabase, user.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-display-l text-deep-plum">Order History</h1>
      <HairlineDivider className="mt-4 max-w-40" />

      {orders.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No orders yet."
          body="Your order history will appear here once you've made a purchase."
          action={{ label: "Shop now", href: "/shop" }}
        />
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="rounded-xl border border-border bg-white p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-body-m font-medium text-charcoal">{order.orderNumber}</span>
                <span className="rounded-full bg-soft-lilac px-2.5 py-1 text-body-s font-medium text-deep-plum">
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
              <p className="mt-2 text-body-s text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
              </p>
              <p className="mt-1 text-body-m font-semibold text-plum">{formatNaira(order.subtotal)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
