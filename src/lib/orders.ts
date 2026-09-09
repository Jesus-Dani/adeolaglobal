import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, OrderStatus } from "@/lib/supabase/types";

export interface MyOrderRow {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  createdAt: string;
}

export async function getMyOrders(supabase: SupabaseClient<Database>, userId: string): Promise<MyOrderRow[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, status, subtotal, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    status: o.status,
    subtotal: o.subtotal,
    createdAt: o.created_at,
  }));
}

export interface MyOrderDetail {
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
    quantity: number;
    priceAtPurchase: number;
  }[];
}

const ORDER_COLUMNS =
  "id, order_number, status, delivery_name, delivery_phone, delivery_address, delivery_notes, subtotal, created_at";

export async function getMyOrderDetail(
  supabase: SupabaseClient<Database>,
  userId: string,
  orderId: string,
): Promise<MyOrderDetail | null> {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();
  if (orderError) throw orderError;
  if (!order) return null;

  return buildOrderDetail(supabase, order);
}

/**
 * Looks up an order by its Paystack payment reference — used by the order
 * confirmation page, which only has the reference (from the checkout
 * redirect URL), not the order id. Scoped to userId same as
 * getMyOrderDetail: RLS already restricts payments/orders reads to their
 * owner, but the explicit filter keeps that intent visible here too.
 */
export async function getOrderByReference(
  supabase: SupabaseClient<Database>,
  userId: string,
  reference: string,
): Promise<MyOrderDetail | null> {
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("order_id")
    .eq("paystack_reference", reference)
    .maybeSingle();
  if (paymentError) throw paymentError;
  if (!payment) return null;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("id", payment.order_id)
    .eq("user_id", userId)
    .maybeSingle();
  if (orderError) throw orderError;
  if (!order) return null;

  return buildOrderDetail(supabase, order);
}

async function buildOrderDetail(
  supabase: SupabaseClient<Database>,
  order: {
    id: string;
    order_number: string;
    status: OrderStatus;
    delivery_name: string;
    delivery_phone: string;
    delivery_address: string;
    delivery_notes: string | null;
    subtotal: number;
    created_at: string;
  },
): Promise<MyOrderDetail> {
  const orderId = order.id;
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("id, variant_id, quantity, price_at_purchase")
    .eq("order_id", orderId);
  if (itemsError) throw itemsError;

  const variantIds = [...new Set((items ?? []).map((i) => i.variant_id))];
  const { data: variants, error: variantsError } =
    variantIds.length > 0
      ? await supabase
          .from("product_variants")
          .select("id, size, colour, material, style, product_id")
          .in("id", variantIds)
      : { data: [], error: null };
  if (variantsError) throw variantsError;

  const productIds = [...new Set((variants ?? []).map((v) => v.product_id))];
  const { data: products, error: productsError } =
    productIds.length > 0 ? await supabase.from("products").select("id, name").in("id", productIds) : { data: [], error: null };
  if (productsError) throw productsError;

  const variantById = new Map((variants ?? []).map((v) => [v.id, v]));
  const productById = new Map((products ?? []).map((p) => [p.id, p]));

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
        quantity: item.quantity,
        priceAtPurchase: item.price_at_purchase,
      };
    }),
  };
}
