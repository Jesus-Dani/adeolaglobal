import { createAdminClient } from "@/lib/supabase/server";
import { HairlineDivider } from "@/components/hairline-divider";
import { InventoryTable } from "./inventory-table";

export const metadata = { title: "Inventory | Admin | ADEOLA Global Ltd" };

export default async function AdminInventoryPage() {
  const admin = createAdminClient();
  const { data: variants, error } = await admin
    .from("product_variants")
    .select(
      "id, sku, size, colour, material, style, stock_count, low_stock_threshold, products(id, name)",
    )
    .order("stock_count", { ascending: true });

  if (error) throw error;

  const rows = (variants ?? []).map((v) => ({
    id: v.id,
    sku: v.sku,
    productName: v.products?.name ?? "-",
    productId: v.products?.id ?? "",
    variantLabel: [v.size, v.colour, v.material, v.style].filter(Boolean).join(" / ") || "-",
    stockCount: v.stock_count,
    lowStockThreshold: v.low_stock_threshold,
  }));

  return (
    <div>
      <h1 className="font-display text-display-l text-deep-plum">Inventory</h1>
      <HairlineDivider className="mt-4 max-w-40" />
      <p className="mt-4 text-body-s text-muted-foreground">
        Every variant across all products, sorted by lowest stock first. Rows at or below their
        threshold are flagged. Edit stock counts inline.
      </p>

      <div className="mt-6">
        <InventoryTable variants={rows} />
      </div>
    </div>
  );
}
