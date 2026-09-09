import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Polled by the order confirmation page while status is still "pending" —
 * the Paystack webhook can land a few seconds after the checkout redirect,
 * so the page needs a way to notice the moment it resolves without a hard
 * reload. RLS-respecting client: a reference for someone else's order (or
 * no session at all) just returns 404, same as a genuinely unknown one.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("order_id")
    .eq("paystack_reference", reference)
    .maybeSingle();
  if (paymentError) return NextResponse.json({ error: paymentError.message }, { status: 500 });
  if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("status")
    .eq("id", payment.order_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ status: order.status });
}
