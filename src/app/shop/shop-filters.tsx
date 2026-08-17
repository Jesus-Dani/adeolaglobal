"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Category } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
] as const;

export function ShopFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("min") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/shop?${params.toString()}`);
  }

  function applyPriceRange(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("min", minPrice);
    else params.delete("min");
    if (maxPrice) params.set("max", maxPrice);
    else params.delete("max");
    router.push(`/shop?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-4 border-b border-border pb-4">
      <label className="flex flex-col gap-1">
        <span className="text-body-s text-muted-foreground">Category</span>
        <select
          className="h-9 rounded-lg border border-border bg-white px-2 text-body-m"
          value={searchParams.get("category") ?? ""}
          onChange={(e) => updateParam("category", e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-body-s text-muted-foreground">Sort</span>
        <select
          className="h-9 rounded-lg border border-border bg-white px-2 text-body-m"
          value={searchParams.get("sort") ?? "featured"}
          onChange={(e) => updateParam("sort", e.target.value)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <form className="flex flex-col gap-1" onSubmit={applyPriceRange}>
        <span className="text-body-s text-muted-foreground">Price (₦)</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-9 w-24 rounded-lg border border-border bg-white px-2 text-body-m"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-9 w-24 rounded-lg border border-border bg-white px-2 text-body-m"
          />
          <Button type="submit" variant="outline" size="sm">
            Apply
          </Button>
        </div>
      </form>
    </div>
  );
}
