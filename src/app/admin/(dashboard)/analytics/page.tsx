import { HairlineDivider } from "@/components/hairline-divider";
import { getAnalyticsDashboard } from "@/lib/admin/analytics-events";

export const metadata = { title: "Analytics | Admin | ADEOLA Global Ltd" };

export default async function AdminAnalyticsPage() {
  const dashboard = await getAnalyticsDashboard();
  const maxUsers = Math.max(1, ...dashboard.funnel.map((s) => s.distinctUsers));

  return (
    <div>
      <h1 className="font-display text-display-l text-deep-plum">Analytics</h1>
      <p className="mt-2 text-body-s text-muted-foreground">
        Logged-in-user activity over the last {dashboard.windowDays} days.
      </p>
      <HairlineDivider className="mt-4 max-w-40" />

      <div className="mt-8">
        <h2 className="font-display text-display-m text-deep-plum">Funnel</h2>
        <p className="mt-2 text-body-s text-muted-foreground">
          Distinct users per stage in this window. Not a strict cohort funnel, so a user counted at a
          later stage isn&apos;t guaranteed to have hit every earlier one.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full text-left text-body-m">
            <thead className="border-b border-border text-body-s text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Stage</th>
                <th className="px-4 py-3 font-medium">Users</th>
                <th className="px-4 py-3 font-medium">Drop-off</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {dashboard.funnel.map((stage) => (
                <tr key={stage.eventType} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-charcoal">{stage.label}</td>
                  <td className="px-4 py-3 tabular-nums text-charcoal">{stage.distinctUsers}</td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {stage.dropOffPct === null ? "-" : `${stage.dropOffPct}%`}
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-2 w-32 rounded-full bg-soft-lilac">
                      <div
                        className="h-2 rounded-full bg-plum"
                        style={{ width: `${(stage.distinctUsers / maxUsers) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {dashboard.funnel.at(-1)?.distinctUsers === 0 && (
          <p className="mt-2 text-body-s text-muted-foreground">
            No completed purchases are logged yet. This stage fires once an admin confirms an order&apos;s
            bank transfer.
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-display-m text-deep-plum">Top viewed products</h2>
          {dashboard.topProducts.length === 0 ? (
            <p className="mt-3 text-body-m text-muted-foreground">No product views yet.</p>
          ) : (
            <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-white">
              <table className="w-full text-left text-body-m">
                <thead className="border-b border-border text-body-s text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.topProducts.map((p) => (
                    <tr key={p.productId} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-charcoal">{p.name}</td>
                      <td className="px-4 py-3 tabular-nums text-charcoal">{p.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <h2 className="font-display text-display-m text-deep-plum">Top search queries</h2>
          {dashboard.topQueries.length === 0 ? (
            <p className="mt-3 text-body-m text-muted-foreground">No searches yet.</p>
          ) : (
            <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-white">
              <table className="w-full text-left text-body-m">
                <thead className="border-b border-border text-body-s text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Query</th>
                    <th className="px-4 py-3 font-medium">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.topQueries.map((q) => (
                    <tr key={q.query} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-charcoal">{q.query}</td>
                      <td className="px-4 py-3 tabular-nums text-charcoal">{q.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
