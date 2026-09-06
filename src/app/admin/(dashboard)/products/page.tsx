import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ProductsTable } from "./products-table";

export const metadata = { title: "Products | Admin | ADEOLA Global Ltd" };

export default async function AdminProductsPage() {
  const admin = createAdminClient();
  const { data: products, error } = await admin
    .from("products")
    .select(
      "id, name, slug, base_price, status, is_bestseller, is_new, categories(name), product_variants(stock_count)",
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = (products ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    basePrice: p.base_price,
    status: p.status,
    isBestseller: p.is_bestseller,
    isNew: p.is_new,
    categoryName: p.categories?.name ?? "—",
    totalStock: p.product_variants.reduce((sum, v) => sum + v.stock_count, 0),
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-display-l text-deep-plum">Products</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/admin/products/import" />}
            className="uppercase text-label tracking-wide"
          >
            Import CSV
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/admin/products/new" />}
            className="uppercase text-label tracking-wide"
          >
            Add Product
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <ProductsTable products={rows} />
      </div>
    </div>
  );
}
