import { createAdminClient } from "@/lib/supabase/server";
import { CategoriesManager } from "./categories-manager";

export const metadata = { title: "Categories | Admin | ADEOLA Global Ltd" };

export default async function AdminCategoriesPage() {
  const admin = createAdminClient();
  const { data: categories, error } = await admin
    .from("categories")
    .select("id, name, slug, sort_order")
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (
    <div>
      <h1 className="font-display text-display-l text-deep-plum">Categories</h1>
      <div className="mt-6">
        <CategoriesManager initialCategories={categories ?? []} />
      </div>
    </div>
  );
}
