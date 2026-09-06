import { getDashboardStats } from "@/lib/admin/analytics";
import { KpiCard } from "@/components/admin/kpi-card";
import { formatNaira } from "@/lib/currency";

export const metadata = { title: "Admin Dashboard | ADEOLA Global Ltd" };

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="font-display text-display-l text-deep-plum">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard label="Revenue" value={formatNaira(stats.revenue)} href="/admin/revenue" />
        <KpiCard label="Profit" value={formatNaira(stats.profit)} href="/admin/revenue" />
        <KpiCard label="Orders" value={String(stats.orderCount)} href="/admin/orders" />
        <KpiCard label="Low Stock" value={String(stats.lowStockCount)} href="/admin/inventory" />
        <KpiCard
          label="Top Product"
          value={stats.topProducts[0]?.name ?? "—"}
          href="/admin/revenue"
        />
      </div>

      <div className="mt-8">
        <h2 className="font-display text-display-m text-deep-plum">Top Products</h2>
        {stats.topProducts.length === 0 ? (
          <p className="mt-3 text-body-m text-muted-foreground">No sales yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-white">
            <table className="w-full text-left text-body-m">
              <thead className="border-b border-border text-body-s text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Units Sold</th>
                  <th className="px-4 py-3 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((p) => (
                  <tr key={p.productId} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-charcoal">{p.name}</td>
                    <td className="px-4 py-3 tabular-nums text-charcoal">{p.unitsSold}</td>
                    <td className="px-4 py-3 tabular-nums font-semibold text-plum">
                      {formatNaira(p.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
