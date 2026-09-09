import { HairlineDivider } from "@/components/hairline-divider";
import { listCustomers } from "@/lib/admin/customers";
import { formatNaira } from "@/lib/currency";

export const metadata = { title: "Customers | Admin | ADEOLA Global Ltd" };

export default async function AdminCustomersPage() {
  const customers = await listCustomers();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-display-l text-deep-plum">Customers</h1>
        <a href="/api/admin/customers/export" className="text-body-s text-plum hover:text-deep-plum">
          Export CSV
        </a>
      </div>
      <HairlineDivider className="mt-4 max-w-40" />

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full text-left text-body-m">
          <thead className="border-b border-border text-body-s text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Total Spent</th>
              <th className="px-4 py-3 font-medium">Last Order</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-body-s text-muted-foreground">
                  No registered customers yet.
                </td>
              </tr>
            )}
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-charcoal">{c.name ?? "-"}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.email ?? "-"}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.phone ?? "-"}</td>
                <td className="px-4 py-3 tabular-nums text-charcoal">{c.orderCount}</td>
                <td className="px-4 py-3 tabular-nums font-semibold text-plum">{formatNaira(c.totalSpent)}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {c.lastOrderAt
                    ? new Date(c.lastOrderAt).toLocaleDateString("en-NG", { dateStyle: "medium" })
                    : "-"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(c.joinedAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
