import type { ProductWithVariants } from "@/lib/product-helpers";

export const VARIANT_ATTRIBUTES = ["size", "colour", "material", "style"] as const;
export type VariantAttribute = (typeof VARIANT_ATTRIBUTES)[number];

type Variant = ProductWithVariants["product_variants"][number];
export type VariantSelection = Partial<Record<VariantAttribute, string>>;

/** Which attributes are actually used by this product's variants (skip attributes that are always null). */
export function getActiveAttributes(variants: Variant[]): VariantAttribute[] {
  return VARIANT_ATTRIBUTES.filter((attr) => variants.some((v) => v[attr] != null));
}

/** Distinct values for one attribute, in first-seen order. */
export function getAttributeValues(variants: Variant[], attribute: VariantAttribute): string[] {
  const seen = new Set<string>();
  for (const v of variants) {
    const value = v[attribute];
    if (value != null) seen.add(value);
  }
  return [...seen];
}

/** The variant matching every currently-selected attribute, if any. */
export function resolveVariant(variants: Variant[], selection: VariantSelection): Variant | undefined {
  const attributes = getActiveAttributes(variants);
  return variants.find((v) => attributes.every((attr) => v[attr] === selection[attr]));
}

/** A default selection using the first variant's values — used when a product has exactly one variant. */
export function defaultSelection(variants: Variant[]): VariantSelection {
  const first = variants[0];
  if (!first) return {};
  const selection: VariantSelection = {};
  for (const attr of getActiveAttributes(variants)) {
    const value = first[attr];
    if (value != null) selection[attr] = value;
  }
  return selection;
}
