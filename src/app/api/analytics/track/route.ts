import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { trackEvent } from "@/lib/analytics/track";
import type { AnalyticsEventType } from "@/lib/supabase/types";

const CLIENT_TRIGGERABLE_EVENTS: AnalyticsEventType[] = ["add_to_cart"];

export async function POST(request: NextRequest) {
  const body: { eventType?: AnalyticsEventType; productId?: string; metadata?: Record<string, unknown> } =
    await request.json();

  if (!body.eventType || !CLIENT_TRIGGERABLE_EVENTS.includes(body.eventType)) {
    return NextResponse.json({ error: "Invalid eventType" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Silently no-op for guests — analytics is logged-in-users-only, and this
  // endpoint must never surface an error to a storefront interaction like
  // Add to Cart just because tracking was skipped.
  await trackEvent(supabase, user?.id, {
    eventType: body.eventType,
    productId: body.productId,
    metadata: body.metadata,
  });

  return NextResponse.json({ ok: true });
}
