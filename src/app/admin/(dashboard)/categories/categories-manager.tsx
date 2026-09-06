"use client";

import { useState } from "react";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function CategoriesManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [creating, setCreating] = useState(false);

  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);

    const response = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        slug: newSlug || slugify(newName),
        sortOrder: categories.length,
      }),
    });

    const body = await response.json();
    setCreating(false);
    if (!response.ok) {
      setError(body.error);
      return;
    }
    setCategories([...categories, body.category]);
    setNewName("");
    setNewSlug("");
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditName(category.name);
    setEditSlug(category.slug);
  }

  async function saveEdit(id: string) {
    setError(null);
    const response = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, slug: editSlug }),
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error);
      return;
    }
    setCategories(categories.map((c) => (c.id === id ? body.category : c)));
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    setError(null);
    const response = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error);
      return;
    }
    setCategories(categories.filter((c) => c.id !== id));
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-body-s text-destructive">
          {error}
        </p>
      )}

      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-white p-4">
        <label className="flex flex-col gap-1">
          <span className="text-body-s font-medium text-charcoal">Name</span>
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-body-s font-medium text-charcoal">Slug (optional)</span>
          <Input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder={slugify(newName)} />
        </label>
        <Button type="submit" disabled={creating} className="uppercase text-label tracking-wide">
          {creating ? "Adding..." : "Add Category"}
        </Button>
      </form>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full text-left text-body-m">
          <thead className="border-b border-border text-body-s text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-border last:border-0">
                {editingId === category.id ? (
                  <>
                    <td className="px-4 py-2">
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    </td>
                    <td className="px-4 py-2">
                      <Input value={editSlug} onChange={(e) => setEditSlug(e.target.value)} />
                    </td>
                    <td className="px-4 py-2 tabular-nums text-charcoal">{category.sort_order}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          aria-label="Save"
                          onClick={() => saveEdit(category.id)}
                          className="text-plum hover:text-deep-plum"
                        >
                          <Check className="size-4" strokeWidth={1.5} />
                        </button>
                        <button
                          type="button"
                          aria-label="Cancel"
                          onClick={() => setEditingId(null)}
                          className="text-muted-foreground hover:text-charcoal"
                        >
                          <X className="size-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-charcoal">{category.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{category.slug}</td>
                    <td className="px-4 py-3 tabular-nums text-charcoal">{category.sort_order}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          aria-label="Edit"
                          onClick={() => startEdit(category)}
                          className="text-muted-foreground hover:text-plum"
                        >
                          <Pencil className="size-4" strokeWidth={1.5} />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete"
                          onClick={() => handleDelete(category.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
