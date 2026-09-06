import { createAdminClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/supabase/types";

// Orders whose payment genuinely succeeded — includes stock_conflict because
// the money was captured even though fulfillment has a conflict to resolve
// manually (see the confirm_order_payment RPC in the Phase 3 migration).
const PAID_STATUSES: OrderStatus[] = ["confirmed", "out_for_delivery", "delivered", "stock_conflict"];

interface OrderItemForStats {
  variant_id: string;
  quantity: number;
  price_at_purchase: number;
}

interface VariantForStats {
  id: string;
  product_id: string;
}

interface ProductForStats {
  id: string;
  name: string;
  cost_price: number | null;
}

export interface DashboardStats {
  revenue: number;
  profit: number;
  orderCount: number;
  lowStockCount: number;
  topProducts: { productId: string; name: string; revenue: number; unitsSold: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const admin = createAdminClient();

  const [orderItemsResult, orderCountResult, lowStockResult] = await Promise.all([
    // Two simpler queries joined in application code rather than one 3-level
    // embed (order_items -> product_variants -> products) — multi-level
    // embeds are fragile with our hand-written Database types even with
    // Relationships declared; see src/lib/store/cart-sync.ts for the same
    // pattern and the reasoning.
    admin
      .from("order_items")
      .select("variant_id, quantity, price_at_purchase, orders!inner(status)")
      .in("orders.status", PAID_STATUSES),
    admin.from("orders").select("id", { count: "exact", head: true }),
    admin.from("product_variants").select("id, stock_count, low_stock_threshold"),
  ]);

  if (orderItemsResult.error) throw orderItemsResult.error;
  if (orderCountResult.error) throw orderCountResult.error;
  if (lowStockResult.error) throw lowStockResult.error;

  const orderItems: OrderItemForStats[] = orderItemsResult.data ?? [];
  const lowStockCount = (lowStockResult.data ?? []).filter(
    (v) => v.stock_count <= v.low_stock_threshold,
  ).length;

  if (orderItems.length === 0) {
    return { revenue: 0, profit: 0, orderCount: orderCountResult.count ?? 0, lowStockCount, topProducts: [] };
  }

  const variantIds = [...new Set(orderItems.map((i) => i.variant_id))];
  const { data: variants, error: variantsError } = await admin
    .from("product_variants")
    .select("id, product_id")
    .in("id", variantIds);
  if (variantsError) throw variantsError;

  const productIds = [...new Set((variants ?? []).map((v: VariantForStats) => v.product_id))];
  const { data: products, error: productsError } = await admin
    .from("products")
    .select("id, name, cost_price")
    .in("id", productIds);
  if (productsError) throw productsError;

  const productByVariantId = new Map<string, ProductForStats>();
  for (const variant of (variants ?? []) as VariantForStats[]) {
    const product = (products ?? []).find((p) => p.id === variant.product_id) as
      | ProductForStats
      | undefined;
    if (product) productByVariantId.set(variant.id, product);
  }

  let revenue = 0;
  let profit = 0;
  const revenueByProduct = new Map<string, { name: string; revenue: number; unitsSold: number }>();

  for (const item of orderItems) {
    const product = productByVariantId.get(item.variant_id);
    if (!product) continue;

    const lineRevenue = item.price_at_purchase * item.quantity;
    const lineCost = (product.cost_price ?? 0) * item.quantity;
    revenue += lineRevenue;
    profit += lineRevenue - lineCost;

    const existing = revenueByProduct.get(product.id);
    if (existing) {
      existing.revenue += lineRevenue;
      existing.unitsSold += item.quantity;
    } else {
      revenueByProduct.set(product.id, { name: product.name, revenue: lineRevenue, unitsSold: item.quantity });
    }
  }

  const topProducts = [...revenueByProduct.entries()]
    .map(([productId, v]) => ({ productId, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return { revenue, profit, orderCount: orderCountResult.count ?? 0, lowStockCount, topProducts };
}
