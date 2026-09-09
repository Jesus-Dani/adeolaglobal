import { createAdminClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/supabase/types";
import { ORDER_STATUSES } from "@/lib/admin/order-status";

export { ORDER_STATUSES };

export interface OrderListRow {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  deliveryName: string;
  subtotal: number;
  createdAt: string;
}

export async function listOrders(filters: { status?: OrderStatus; search?: string }): Promise<OrderListRow[]> {
  const admin = createAdminClient();
  let query = admin
    .from("orders")
    .select("id, order_number, status, delivery_name, subtotal, created_at")
    .order("created_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.search) query = query.ilike("order_number", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    status: o.status,
    deliveryName: o.delivery_name,
    subtotal: o.subtotal,
    createdAt: o.created_at,
  }));
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  deliveryName: string;
  deliveryPhone: string;
  deliveryAddress: string;
  deliveryNotes: string | null;
  subtotal: number;
  createdAt: string;
  items: {
    id: string;
    productName: string;
    variantLabel: string;
    sku: string;
    quantity: number;
    priceAtPurchase: number;
  }[];
  payment: {
    paystackReference: string;
    status: string;
    channel: string | null;
    amount: number;
    webhookVerifiedAt: string | null;
  } | null;
}

export async function getOrderDetail(orderId: string): Promise<OrderDetail | null> {
  const admin = createAdminClient();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select(
      "id, order_number, status, delivery_name, delivery_phone, delivery_address, delivery_notes, subtotal, created_at",
    )
    .eq("id", orderId)
    .maybeSingle();
  if (orderError) throw orderError;
  if (!order) return null;

  const { data: items, error: itemsError } = await admin
    .from("order_items")
    .select("id, variant_id, quantity, price_at_purchase")
    .eq("order_id", orderId);
  if (itemsError) throw itemsError;

  const variantIds = [...new Set((items ?? []).map((i) => i.variant_id))];
  const { data: variants, error: variantsError } =
    variantIds.length > 0
      ? await admin
          .from("product_variants")
          .select("id, sku, size, colour, material, style, product_id")
          .in("id", variantIds)
      : { data: [], error: null };
  if (variantsError) throw variantsError;

  const productIds = [...new Set((variants ?? []).map((v) => v.product_id))];
  const { data: products, error: productsError } =
    productIds.length > 0
      ? await admin.from("products").select("id, name").in("id", productIds)
      : { data: [], error: null };
  if (productsError) throw productsError;

  const variantById = new Map((variants ?? []).map((v) => [v.id, v]));
  const productById = new Map((products ?? []).map((p) => [p.id, p]));

  const { data: payment, error: paymentError } = await admin
    .from("payments")
    .select("paystack_reference, status, channel, amount, webhook_verified_at")
    .eq("order_id", orderId)
    .maybeSingle();
  if (paymentError) throw paymentError;

  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    deliveryName: order.delivery_name,
    deliveryPhone: order.delivery_phone,
    deliveryAddress: order.delivery_address,
    deliveryNotes: order.delivery_notes,
    subtotal: order.subtotal,
    createdAt: order.created_at,
    items: (items ?? []).map((item) => {
      const variant = variantById.get(item.variant_id);
      const product = variant ? productById.get(variant.product_id) : undefined;
      return {
        id: item.id,
        productName: product?.name ?? "-",
        variantLabel: variant
          ? [variant.size, variant.colour, variant.material, variant.style].filter(Boolean).join(" / ") || "-"
          : "-",
        sku: variant?.sku ?? "-",
        quantity: item.quantity,
        priceAtPurchase: item.price_at_purchase,
      };
    }),
    payment: payment
      ? {
          paystackReference: payment.paystack_reference,
          status: payment.status,
          channel: payment.channel,
          amount: payment.amount,
          webhookVerifiedAt: payment.webhook_verified_at,
        }
      : null,
  };
}
