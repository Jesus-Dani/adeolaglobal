import { createAdminClient } from "@/lib/supabase/server";
import type { AnalyticsEventType } from "@/lib/supabase/types";

const WINDOW_DAYS = 30;

const FUNNEL_STAGES: AnalyticsEventType[] = [
  "product_view",
  "search",
  "add_to_cart",
  "checkout_start",
  "purchase",
];

const FUNNEL_LABELS: Record<AnalyticsEventType, string> = {
  product_view: "Viewed a product",
  search: "Searched",
  add_to_cart: "Added to cart",
  checkout_start: "Started checkout",
  purchase: "Completed purchase",
};

export interface FunnelStage {
  eventType: AnalyticsEventType;
  label: string;
  distinctUsers: number;
  dropOffPct: number | null;
}

export interface AnalyticsDashboard {
  windowDays: number;
  funnel: FunnelStage[];
  topProducts: { productId: string; name: string; views: number }[];
  topQueries: { query: string; count: number }[];
}

interface EventRow {
  user_id: string;
  event_type: AnalyticsEventType;
  product_id: string | null;
  metadata: Record<string, unknown>;
}

export async function getAnalyticsDashboard(): Promise<AnalyticsDashboard> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await admin
    .from("analytics_events")
    .select("user_id, event_type, product_id, metadata")
    .gte("created_at", since);
  if (error) throw error;

  const events = (data ?? []) as EventRow[];

  const usersByStage = new Map<AnalyticsEventType, Set<string>>();
  for (const stage of FUNNEL_STAGES) usersByStage.set(stage, new Set());
  for (const event of events) {
    usersByStage.get(event.event_type)?.add(event.user_id);
  }

  const funnel: FunnelStage[] = [];
  let previousCount: number | null = null;
  for (const stage of FUNNEL_STAGES) {
    const count = usersByStage.get(stage)?.size ?? 0;
    const dropOffPct =
      previousCount === null || previousCount === 0
        ? null
        : Math.round(((previousCount - count) / previousCount) * 100);
    funnel.push({ eventType: stage, label: FUNNEL_LABELS[stage], distinctUsers: count, dropOffPct });
    previousCount = count;
  }

  const viewCounts = new Map<string, number>();
  for (const event of events) {
    if (event.event_type === "product_view" && event.product_id) {
      viewCounts.set(event.product_id, (viewCounts.get(event.product_id) ?? 0) + 1);
    }
  }
  const productIds = [...viewCounts.keys()];
  const { data: products, error: productsError } =
    productIds.length > 0
      ? await admin.from("products").select("id, name").in("id", productIds)
      : { data: [], error: null };
  if (productsError) throw productsError;
  const nameByProductId = new Map((products ?? []).map((p) => [p.id, p.name]));

  const topProducts = [...viewCounts.entries()]
    .map(([productId, views]) => ({ productId, name: nameByProductId.get(productId) ?? "-", views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  const queryCounts = new Map<string, number>();
  for (const event of events) {
    if (event.event_type !== "search") continue;
    const query = event.metadata?.query;
    if (typeof query === "string" && query.trim()) {
      const key = query.trim().toLowerCase();
      queryCounts.set(key, (queryCounts.get(key) ?? 0) + 1);
    }
  }
  const topQueries = [...queryCounts.entries()]
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return { windowDays: WINDOW_DAYS, funnel, topProducts, topQueries };
}
