import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-session";
import { listOrders, ORDER_STATUSES } from "@/lib/admin/orders";
import { toCsv, csvResponseHeaders } from "@/lib/admin/csv-export";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const statusParam = request.nextUrl.searchParams.get("status") ?? undefined;
  const status = ORDER_STATUSES.find((s) => s === statusParam);

  const orders = await listOrders({ status });
  const csv = toCsv(
    orders.map((o) => ({
      order_number: o.orderNumber,
      status: o.status,
      customer: o.deliveryName,
      subtotal: o.subtotal,
      placed_at: o.createdAt,
    })),
    ["order_number", "status", "customer", "subtotal", "placed_at"],
  );

  return new NextResponse(csv, { headers: csvResponseHeaders("orders.csv") });
}
