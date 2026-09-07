import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, AnalyticsEventType } from "@/lib/supabase/types";

interface TrackEventInput {
  eventType: AnalyticsEventType;
  productId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Logs an analytics event for the given user. No-ops (and never throws) when
 * there's no authenticated user, since tracking must never break a storefront
 * page — analytics per the TRD is logged-in-users-only, not a hard dependency.
 */
export async function trackEvent(
  supabase: SupabaseClient<Database>,
  userId: string | null | undefined,
  event: TrackEventInput,
): Promise<void> {
  if (!userId) return;

  const { error } = await supabase.from("analytics_events").insert({
    user_id: userId,
    event_type: event.eventType,
    product_id: event.productId ?? null,
    metadata: event.metadata ?? {},
  });

  if (error) {
    console.error(`[analytics] failed to log "${event.eventType}" event:`, error.message);
  }
}
