import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-session";
import { listCustomers } from "@/lib/admin/customers";
import { toCsv, csvResponseHeaders } from "@/lib/admin/csv-export";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const customers = await listCustomers();
  const csv = toCsv(
    customers.map((c) => ({
      name: c.name ?? "",
      email: c.email ?? "",
      phone: c.phone ?? "",
      order_count: c.orderCount,
      total_spent: c.totalSpent,
      last_order_at: c.lastOrderAt ?? "",
      joined_at: c.joinedAt,
    })),
    ["name", "email", "phone", "order_count", "total_spent", "last_order_at", "joined_at"],
  );

  return new NextResponse(csv, { headers: csvResponseHeaders("customers.csv") });
}
