import { createAdminClient } from "@/lib/supabase/server";
import { PAID_STATUSES } from "@/lib/admin/analytics";

export interface CustomerRow {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
  joinedAt: string;
}

export async function listCustomers(): Promise<CustomerRow[]> {
  const admin = createAdminClient();

  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, name, phone, created_at")
    .eq("role", "customer");
  if (profilesError) throw profilesError;
  if (!profiles || profiles.length === 0) return [];

  const profileIds = profiles.map((p) => p.id);

  const { data: orders, error: ordersError } = await admin
    .from("orders")
    .select("user_id, status, subtotal, created_at")
    .in("user_id", profileIds);
  if (ordersError) throw ordersError;

  const statsByUser = new Map<string, { orderCount: number; totalSpent: number; lastOrderAt: string | null }>();
  for (const order of orders ?? []) {
    if (!order.user_id) continue;
    const entry = statsByUser.get(order.user_id) ?? { orderCount: 0, totalSpent: 0, lastOrderAt: null };
    entry.orderCount += 1;
    if (PAID_STATUSES.includes(order.status)) entry.totalSpent += order.subtotal;
    if (!entry.lastOrderAt || order.created_at > entry.lastOrderAt) entry.lastOrderAt = order.created_at;
    statsByUser.set(order.user_id, entry);
  }

  const emailById = new Map<string, string | null>();
  let page = 1;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    for (const user of data.users) emailById.set(user.id, user.email ?? null);
    if (data.users.length < 200) break;
    page += 1;
  }

  return profiles
    .map((profile) => {
      const stats = statsByUser.get(profile.id) ?? { orderCount: 0, totalSpent: 0, lastOrderAt: null };
      return {
        id: profile.id,
        name: profile.name,
        email: emailById.get(profile.id) ?? null,
        phone: profile.phone,
        orderCount: stats.orderCount,
        totalSpent: stats.totalSpent,
        lastOrderAt: stats.lastOrderAt,
        joinedAt: profile.created_at,
      };
    })
    .sort((a, b) => b.totalSpent - a.totalSpent);
}
