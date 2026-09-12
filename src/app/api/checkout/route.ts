import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

interface CheckoutRequestBody {
  items: { variantId: string; quantity: number }[];
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
  if (!body.delivery?.name || !body.delivery?.phone || !body.delivery?.address) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "You must be signed in to check out." }, { status: 401 });
    }

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

    // No payment gateway step: the order lands as "pending" (awaiting bank
    // transfer + admin confirmation) — see confirm_order_manually(), which
    // is what actually decrements stock once an admin confirms the order.
    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        user_id: user.id,
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
      await admin.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: "Could not create order items" }, { status: 500 });
    }

    return NextResponse.json({ orderId: order.id, orderNumber: order.order_number });
  } catch (err) {
    // Catches anything unexpected (e.g. Supabase admin client misconfigured)
    // so a checkout attempt always gets a clean error response instead of an
    // unhandled 500 — this is the difference between the storefront staying
    // usable and every checkout attempt hitting a raw crash page.
    console.error("Checkout failed unexpectedly:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
