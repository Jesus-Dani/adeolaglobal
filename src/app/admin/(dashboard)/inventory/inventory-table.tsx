"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface VariantRow {
  id: string;
  sku: string;
  productName: string;
  productId: string;
  variantLabel: string;
  stockCount: number;
  lowStockThreshold: number;
}

export function InventoryTable({ variants }: { variants: VariantRow[] }) {
  const [rows, setRows] = useState(variants);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(row: VariantRow) {
    setEditingId(row.id);
    setEditValue(String(row.stockCount));
    setError(null);
  }

  async function saveEdit(id: string) {
    const stockCount = Number(editValue);
    if (!Number.isInteger(stockCount) || stockCount < 0) {
      setError("Stock count must be a non-negative whole number.");
      return;
    }

    setSaving(true);
    const response = await fetch(`/api/admin/variants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockCount }),
    });
    const body = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(body.error);
      return;
    }
    setRows(rows.map((r) => (r.id === id ? { ...r, stockCount: body.variant.stock_count } : r)));
    setEditingId(null);
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
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Variant</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Threshold</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const low = row.stockCount <= row.lowStockThreshold;
              return (
                <tr
                  key={row.id}
                  className={cn("border-b border-border last:border-0", low && "bg-destructive/5")}
                >
                  <td className="px-4 py-3 text-charcoal">
                    <Link href={`/admin/products/${row.productId}/edit`} className="hover:text-plum">
                      {row.productName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{row.variantLabel}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.sku}</td>
                  <td className="px-4 py-3">
                    {editingId === row.id ? (
                      <input
                        type="number"
                        min={0}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-20 rounded border border-border px-2 py-1 text-body-m tabular-nums"
                        autoFocus
                      />
                    ) : (
                      <span className={cn("tabular-nums", low ? "font-medium text-destructive" : "text-charcoal")}>
                        {row.stockCount}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{row.lowStockThreshold}</td>
                  <td className="px-4 py-3">
                    {editingId === row.id ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => saveEdit(row.id)}
                          className="text-body-s text-plum hover:text-deep-plum"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-body-s text-muted-foreground hover:text-charcoal"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEdit(row)}
                        className="text-body-s text-muted-foreground hover:text-plum"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
