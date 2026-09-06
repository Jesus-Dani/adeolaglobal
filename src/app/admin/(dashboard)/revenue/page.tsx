import { HairlineDivider } from "@/components/hairline-divider";
import { getRevenueDetail } from "@/lib/admin/analytics";
import { formatNaira } from "@/lib/currency";

export const metadata = { title: "Revenue | Admin | ADEOLA Global Ltd" };

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  return new Date(Number(year), Number(m) - 1, 1).toLocaleDateString("en-NG", {
    month: "short",
    year: "numeric",
  });
}

export default async function AdminRevenuePage() {
  const detail = await getRevenueDetail();
  const maxMonthRevenue = Math.max(1, ...detail.byMonth.map((m) => m.revenue));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-display-l text-deep-plum">Revenue &amp; Profit</h1>
        <a href="/api/admin/revenue/export" className="text-body-s text-plum hover:text-deep-plum">
          Export CSV
        </a>
      </div>
      <HairlineDivider className="mt-4 max-w-40" />

      <div className="mt-6 grid grid-cols-2 gap-4 sm:max-w-md">
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-body-s text-muted-foreground">Total revenue</p>
          <p className="mt-1 font-display text-display-m text-deep-plum">{formatNaira(detail.totalRevenue)}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-body-s text-muted-foreground">Total profit</p>
          <p className="mt-1 font-display text-display-m text-deep-plum">{formatNaira(detail.totalProfit)}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-display-m text-deep-plum">By month</h2>
        {detail.byMonth.length === 0 ? (
          <p className="mt-3 text-body-m text-muted-foreground">No sales yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-white p-4">
            <div className="flex items-end gap-4">
              {detail.byMonth.map((m) => (
                <div key={m.month} className="flex flex-col items-center gap-2">
                  <div className="flex h-40 items-end gap-1">
                    <div
                      title={`Revenue: ${formatNaira(m.revenue)}`}
                      className="w-4 rounded-t bg-plum"
                      style={{ height: `${Math.max(4, (m.revenue / maxMonthRevenue) * 160)}px` }}
                    />
                    <div
                      title={`Profit: ${formatNaira(m.profit)}`}
                      className="w-4 rounded-t bg-soft-lilac"
                      style={{ height: `${Math.max(4, (m.profit / maxMonthRevenue) * 160)}px` }}
                    />
                  </div>
                  <span className="whitespace-nowrap text-body-s text-muted-foreground">
                    {formatMonth(m.month)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-display-m text-deep-plum">Top by revenue</h2>
          <ProductTable rows={detail.topByRevenue} />
        </div>
        <div>
          <h2 className="font-display text-display-m text-deep-plum">Top by margin</h2>
          <ProductTable rows={detail.topByMargin} />
        </div>
      </div>
    </div>
  );
}

function ProductTable({
  rows,
}: {
  rows: { productId: string; name: string; revenue: number; profit: number; unitsSold: number }[];
}) {
  if (rows.length === 0) {
    return <p className="mt-3 text-body-m text-muted-foreground">No sales yet.</p>;
  }

  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-white">
      <table className="w-full text-left text-body-m">
        <thead className="border-b border-border text-body-s text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 font-medium">Units</th>
            <th className="px-4 py-3 font-medium">Revenue</th>
            <th className="px-4 py-3 font-medium">Profit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.productId} className="border-b border-border last:border-0">
              <td className="px-4 py-3 text-charcoal">{p.name}</td>
              <td className="px-4 py-3 tabular-nums text-charcoal">{p.unitsSold}</td>
              <td className="px-4 py-3 tabular-nums text-charcoal">{formatNaira(p.revenue)}</td>
              <td className="px-4 py-3 tabular-nums font-semibold text-plum">{formatNaira(p.profit)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
