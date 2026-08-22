import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { initializeTransaction } from "@/lib/paystack";

interface CheckoutRequestBody {
  items: { variantId: string; quantity: number }[];
  email: string;
  delivery: {
    name: string;
    phone: string;
    address: string;
    notes?: string;
  };
  termsAccepted: boolean;
}

export async function POST(request: NextRequest) {
  let body: CheckoutRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.termsAccepted) {
    return NextResponse.json({ error: "Terms of Service must be accepted" }, { status: 400 });
  }
  if (!body.items?.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }
  if (!body.email || !body.delivery?.name || !body.delivery?.phone || !body.delivery?.address) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Who's checking out, if anyone — orders.user_id is nullable for guests.
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const admin = createAdminClient();

    // Re-fetch every variant's REAL price and stock from the DB — the
    // client's cart data is never trusted for the actual charge amount.
    const variantIds = body.items.map((i) => i.variantId);
    const { data: variants, error: variantsError } = await admin
      .from("product_variants")
      .select("id, price_override, stock_count, products(base_price, status)")
      .in("id", variantIds);

    if (variantsError) {
      return NextResponse.json({ error: "Could not verify cart items" }, { status: 500 });
    }

    const variantById = new Map((variants ?? []).map((v) => [v.id, v]));

    let subtotal = 0;
    const orderItemsToInsert: { variant_id: string; quantity: number; price_at_purchase: number }[] = [];

    for (const item of body.items) {
      const variant = variantById.get(item.variantId);
      if (!variant || !variant.products || variant.products.status !== "active") {
        return NextResponse.json({ error: "One or more items are no longer available" }, { status: 409 });
      }
      if (item.quantity < 1 || variant.stock_count < item.quantity) {
        return NextResponse.json({ error: "One or more items are out of stock" }, { status: 409 });
      }

      const unitPrice = variant.price_override ?? variant.products.base_price;
      subtotal += unitPrice * item.quantity;
      orderItemsToInsert.push({
        variant_id: item.variantId,
        quantity: item.quantity,
        price_at_purchase: unitPrice,
      });
    }

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        delivery_name: body.delivery.name,
        delivery_phone: body.delivery.phone,
        delivery_address: body.delivery.address,
        delivery_notes: body.delivery.notes ?? null,
        terms_accepted: true,
        subtotal,
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Could not create order" }, { status: 500 });
    }

    const { error: itemsError } = await admin
      .from("order_items")
      .insert(orderItemsToInsert.map((item) => ({ ...item, order_id: order.id })));

    if (itemsError) {
      await admin.from("orders").update({ status: "payment_failed" }).eq("id", order.id);
      return NextResponse.json({ error: "Could not create order items" }, { status: 500 });
    }

    const reference = `adg_${order.order_number}_${randomUUID()}`;

    const { error: paymentError } = await admin.from("payments").insert({
      order_id: order.id,
      paystack_reference: reference,
      amount: subtotal,
    });

    if (paymentError) {
      await admin.from("orders").update({ status: "payment_failed" }).eq("id", order.id);
      return NextResponse.json({ error: "Could not initialize payment" }, { status: 500 });
    }

    try {
      const { authorizationUrl } = await initializeTransaction({
        email: body.email,
        amountNaira: subtotal,
        reference,
        callbackUrl: `${request.nextUrl.origin}/order/${reference}`,
        metadata: { order_number: order.order_number },
      });

      return NextResponse.json({ authorizationUrl });
    } catch (err) {
      console.error("Paystack initialize failed:", err);
      await admin.from("payments").update({ status: "failed" }).eq("order_id", order.id);
      await admin.from("orders").update({ status: "payment_failed" }).eq("id", order.id);
      return NextResponse.json({ error: "Could not reach the payment provider" }, { status: 502 });
    }
  } catch (err) {
    // Catches anything unexpected (e.g. Supabase admin client misconfigured)
    // so a checkout attempt always gets a clean error response instead of an
    // unhandled 500 — this is the difference between the storefront staying
    // usable and every checkout attempt hitting a raw crash page.
    console.error("Checkout failed unexpectedly:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
