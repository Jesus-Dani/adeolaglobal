import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { createAdminClient } from "@/lib/supabase/server";

interface ChargeSuccessEvent {
  event: string;
  data: {
    reference: string;
    channel: string | null;
  };
}

export async function POST(request: NextRequest) {
  // Signature verification needs the exact raw bytes Paystack signed —
  // must read as text before any JSON parsing touches the payload.
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: ChargeSuccessEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Only charge.success drives order confirmation; every other event type
  // (transfers, disputes, etc.) is acknowledged but otherwise ignored.
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("confirm_order_payment", {
    p_paystack_reference: event.data.reference,
    p_channel: event.data.channel ?? "unknown",
  });

  if (error) {
    // Non-2xx makes Paystack retry with backoff — worth it in case this was
    // a transient DB issue; a genuine reference mismatch will just fail the
    // same way again, which is fine, it surfaces in logs either way.
    console.error("confirm_order_payment failed:", error.message, event.data.reference);
    return NextResponse.json({ error: "Could not process payment confirmation" }, { status: 500 });
  }

  return NextResponse.json({ received: true, result: data });
}
