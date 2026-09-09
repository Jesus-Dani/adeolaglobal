"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductStatus } from "@/lib/supabase/types";
import type { ProductInput, ProductVariantInput } from "@/lib/admin/products";

interface Category {
  id: string;
  name: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function emptyVariant(): ProductVariantInput {
  return { sku: "", stockCount: 0, lowStockThreshold: 5 };
}

export function ProductForm({
  categories,
  productId,
  initial,
}: {
  categories: Category[];
  /** Present only when editing an existing product. */
  productId?: string;
  initial?: ProductInput;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [basePrice, setBasePrice] = useState(initial?.basePrice?.toString() ?? "");
  const [costPrice, setCostPrice] = useState(initial?.costPrice?.toString() ?? "");
  const [status, setStatus] = useState<ProductStatus>(initial?.status ?? "draft");
  const [isBestseller, setIsBestseller] = useState(initial?.isBestseller ?? false);
  const [isNew, setIsNew] = useState(initial?.isNew ?? false);
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [variants, setVariants] = useState<ProductVariantInput[]>(
    initial?.variants?.length ? initial.variants : [emptyVariant()],
  );

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const body = await response.json();
    setUploading(false);

    if (!response.ok) {
      setError(body.error);
      return;
    }
    setImages((prev) => [...prev, body.url]);
  }

  function updateVariant(index: number, patch: Partial<ProductVariantInput>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (variants.some((v) => !v.sku)) {
      setError("Every variant needs a SKU.");
      return;
    }

    setSaving(true);
    const payload: ProductInput = {
      name,
      slug: slug || slugify(name),
      description: description || null,
      categoryId,
      basePrice: Number(basePrice),
      costPrice: costPrice ? Number(costPrice) : null,
      status,
      isBestseller,
      isNew,
      images,
      variants,
    };

    const response = await fetch(productId ? `/api/admin/products/${productId}` : "/api/admin/products", {
      method: productId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(body.error);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-body-s text-destructive">
          {error}
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-body-s font-medium text-charcoal">Name</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-body-s font-medium text-charcoal">Slug</span>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={slugify(name)} />
        </label>
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-body-s font-medium text-charcoal">Description</span>
          <textarea
            value={description ?? ""}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-body-s font-medium text-charcoal">Category</span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="h-9 rounded-lg border border-border bg-white px-2 text-body-m"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-body-s font-medium text-charcoal">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatus)}
            className="h-9 rounded-lg border border-border bg-white px-2 text-body-m"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-body-s font-medium text-charcoal">Base price (₦)</span>
          <Input type="number" min={0} step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-body-s font-medium text-charcoal">Cost price (₦), admin only</span>
          <Input type="number" min={0} step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
        </label>
        <div className="flex items-center gap-6 sm:col-span-2">
          <label className="flex items-center gap-2 text-body-s text-charcoal">
            <input type="checkbox" checked={isBestseller} onChange={(e) => setIsBestseller(e.target.checked)} className="size-4 rounded border-border accent-plum" />
            Bestseller
          </label>
          <label className="flex items-center gap-2 text-body-s text-charcoal">
            <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} className="size-4 rounded border-border accent-plum" />
            New
          </label>
        </div>
      </section>

      <section>
        <h2 className="text-body-l font-medium text-deep-plum">Images</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {images.map((url) => (
            <div key={url} className="relative size-24 overflow-hidden rounded-lg border border-border">
              <Image src={url} alt="" fill sizes="96px" className="object-cover" />
              <button
                type="button"
                aria-label="Remove image"
                onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
                className="absolute top-1 right-1 flex size-5 items-center justify-center bg-white/90"
              >
                <X className="size-3" strokeWidth={1.5} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex size-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground hover:border-plum hover:text-plum disabled:opacity-40"
          >
            <Upload className="size-5" strokeWidth={1.5} />
            <span className="text-body-s">{uploading ? "Uploading..." : "Upload"}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = "";
            }}
          />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-body-l font-medium text-deep-plum">Variants</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setVariants((prev) => [...prev, emptyVariant()])}
          >
            <Plus className="size-4" strokeWidth={1.5} />
            Add Variant
          </Button>
        </div>

        <div className="mt-3 flex flex-col gap-3">
          {variants.map((variant, index) => (
            <div key={index} className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-white p-3 sm:grid-cols-4 lg:grid-cols-8">
              <Input placeholder="Size" value={variant.size ?? ""} onChange={(e) => updateVariant(index, { size: e.target.value })} />
              <Input placeholder="Colour" value={variant.colour ?? ""} onChange={(e) => updateVariant(index, { colour: e.target.value })} />
              <Input placeholder="Material" value={variant.material ?? ""} onChange={(e) => updateVariant(index, { material: e.target.value })} />
              <Input placeholder="Style" value={variant.style ?? ""} onChange={(e) => updateVariant(index, { style: e.target.value })} />
              <Input placeholder="SKU" value={variant.sku} onChange={(e) => updateVariant(index, { sku: e.target.value })} required />
              <Input
                type="number"
                placeholder="Price override"
                value={variant.priceOverride ?? ""}
                onChange={(e) => updateVariant(index, { priceOverride: e.target.value ? Number(e.target.value) : null })}
              />
              <Input
                type="number"
                placeholder="Stock"
                min={0}
                value={variant.stockCount}
                onChange={(e) => updateVariant(index, { stockCount: Number(e.target.value) })}
                required
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Low stock at"
                  min={0}
                  value={variant.lowStockThreshold ?? 5}
                  onChange={(e) => updateVariant(index, { lowStockThreshold: Number(e.target.value) })}
                />
                {variants.length > 1 && (
                  <button
                    type="button"
                    aria-label="Remove variant"
                    onClick={() => setVariants((prev) => prev.filter((_, i) => i !== index))}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Button type="submit" size="lg" disabled={saving} className="uppercase text-label tracking-wide">
        {saving ? "Saving..." : productId ? "Save Changes" : "Create Product"}
      </Button>
    </form>
  );
}
