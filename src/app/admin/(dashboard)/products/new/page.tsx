import { createAdminClient } from "@/lib/supabase/server";
import { HairlineDivider } from "@/components/hairline-divider";
import { ProductForm } from "../product-form";

export const metadata = { title: "Add Product | Admin | ADEOLA Global Ltd" };

export default async function NewProductPage() {
  const admin = createAdminClient();
  const { data: categories, error } = await admin
    .from("categories")
    .select("id, name")
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (
    <div>
      <h1 className="font-display text-display-l text-deep-plum">Add Product</h1>
      <HairlineDivider className="mt-4 max-w-40" />
      <div className="mt-8 max-w-4xl">
        <ProductForm categories={categories ?? []} />
      </div>
    </div>
  );
}
