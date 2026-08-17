import { Suspense } from "react";
import { SearchX } from "lucide-react";
import { getProducts, getCategories, type GetProductsParams } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { ShopFilters } from "./shop-filters";

export const metadata = { title: "Shop | ADEOLA Global Ltd" };

interface ShopPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    min?: string;
    max?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  const query: GetProductsParams = {
    category: params.category,
    search: params.q,
    sort: (params.sort as GetProductsParams["sort"]) ?? "featured",
    minPrice: params.min ? Number(params.min) : undefined,
    maxPrice: params.max ? Number(params.max) : undefined,
  };

  const [products, categories] = await Promise.all([getProducts(query), getCategories()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-display-l text-deep-plum">
          {params.q ? `Results for "${params.q}"` : "Shop"}
        </h1>
        <p className="text-body-s text-muted-foreground">
          {products.length} {products.length === 1 ? "product" : "products"}
        </p>
      </div>

      <Suspense fallback={null}>
        <div className="mt-6">
          <ShopFilters categories={categories} />
        </div>
      </Suspense>

      {products.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No products found."
          body="Try a different search or clear your filters."
          action={{ label: "View all products", href: "/shop" }}
        />
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
