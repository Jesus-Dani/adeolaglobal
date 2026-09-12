import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/server";
import { ORDER_STATUSES } from "@/lib/admin/orders";
import { notifyOrderStatusChange } from "@/lib/push/send";
import { trackEvent } from "@/lib/analytics/track";
import type { OrderStatus } from "@/lib/supabase/types";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body: { status?: OrderStatus } = await request.json();

  if (!body.status || !ORDER_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Confirming is the one transition that also has to decrement stock —
  // done atomically in confirm_order_manually() rather than here, so a
  // plain UPDATE can never mark an order confirmed without also reserving
  // the stock it sold.
  if (body.status === "confirmed") {
    const { data: result, error: rpcError } = await admin.rpc("confirm_order_manually", {
      p_order_id: id,
    });
    if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 });

    const { data, error } = await admin
      .from("orders")
      .select("id, status, order_number, user_id")
      .eq("id", id)
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (data.user_id && result === "confirmed") {
      notifyOrderStatusChange(data.user_id, data.order_number, data.status).catch((err) =>
        console.error("[push] notifyOrderStatusChange failed:", err),
      );
      trackEvent(admin, data.user_id, { eventType: "purchase", metadata: { orderNumber: data.order_number } }).catch(
        (err) => console.error("[analytics] purchase event failed:", err),
      );
    }

    return NextResponse.json({ order: data, result });
  }

  const { data, error } = await admin
    .from("orders")
    .update({ status: body.status })
    .eq("id", id)
    .select("id, status, order_number, user_id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (data.user_id) {
    notifyOrderStatusChange(data.user_id, data.order_number, data.status).catch((err) =>
      console.error("[push] notifyOrderStatusChange failed:", err),
    );
  }

  return NextResponse.json({ order: data });
}
