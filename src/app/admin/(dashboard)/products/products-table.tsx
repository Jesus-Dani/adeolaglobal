"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { formatNaira } from "@/lib/currency";
import type { ProductStatus } from "@/lib/supabase/types";

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  status: ProductStatus;
  isBestseller: boolean;
  isNew: boolean;
  categoryName: string;
  totalStock: number;
}

export function ProductsTable({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    setError(null);
    setDeletingId(id);

    const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (!response.ok) {
      const body = await response.json();
      setError(body.error);
      return;
    }
    router.refresh();
  }

  if (products.length === 0) {
    return <p className="text-body-m text-muted-foreground">No products yet.</p>;
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-body-s text-destructive">
          {error}
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full text-left text-body-m">
          <thead className="border-b border-border text-body-s text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-charcoal">
                  {product.name}
                  {product.isBestseller && (
                    <span className="ml-2 rounded-md bg-gold/15 px-1.5 py-0.5 text-body-s text-deep-plum">
                      Bestseller
                    </span>
                  )}
                  {product.isNew && (
                    <span className="ml-2 rounded-md bg-soft-lilac px-1.5 py-0.5 text-body-s text-deep-plum">
                      New
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{product.categoryName}</td>
                <td className="px-4 py-3 tabular-nums text-charcoal">{formatNaira(product.basePrice)}</td>
                <td className="px-4 py-3 tabular-nums text-charcoal">{product.totalStock}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      product.status === "active"
                        ? "rounded-md bg-plum/10 px-2 py-0.5 text-body-s text-plum"
                        : "rounded-md bg-muted px-2 py-0.5 text-body-s text-muted-foreground"
                    }
                  >
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      aria-label="Edit"
                      className="text-muted-foreground hover:text-plum"
                    >
                      <Pencil className="size-4" strokeWidth={1.5} />
                    </Link>
                    <button
                      type="button"
                      aria-label="Delete"
                      disabled={deletingId === product.id}
                      onClick={() => handleDelete(product.id, product.name)}
                      className="text-muted-foreground hover:text-destructive disabled:opacity-40"
                    >
                      <Trash2 className="size-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
