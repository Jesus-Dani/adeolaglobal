import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-session";
import { getRevenueDetail } from "@/lib/admin/analytics";
import { toCsv, csvResponseHeaders } from "@/lib/admin/csv-export";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const detail = await getRevenueDetail();
  const csv = toCsv(
    detail.topByRevenue.map((p) => ({
      product: p.name,
      units_sold: p.unitsSold,
      revenue: p.revenue,
      profit: p.profit,
    })),
    ["product", "units_sold", "revenue", "profit"],
  );

  return new NextResponse(csv, { headers: csvResponseHeaders("revenue.csv") });
}
