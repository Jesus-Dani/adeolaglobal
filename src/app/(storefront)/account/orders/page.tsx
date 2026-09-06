import { redirect } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HairlineDivider } from "@/components/hairline-divider";
import { EmptyState } from "@/components/empty-state";

export const metadata = { title: "Order History | ADEOLA Global Ltd" };

export default async function OrderHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account/orders");

  // Orders/payments land in Phase 3 (TRD.md s5) — this is the real empty
  // state the page will show once there's simply no order history yet.
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-display-l text-deep-plum">Order History</h1>
      <HairlineDivider className="mt-4 max-w-40" />
      <EmptyState
        icon={PackageSearch}
        title="No orders yet."
        body="Your order history will appear here once you've made a purchase."
        action={{ label: "Shop now", href: "/shop" }}
      />
    </div>
  );
}
