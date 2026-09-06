import Papa from "papaparse";

export interface ProductImportRow {
  product_slug: string;
  product_name?: string;
  description?: string;
  category_slug?: string;
  base_price?: string;
  cost_price?: string;
  status?: string;
  is_bestseller?: string;
  is_new?: string;
  images?: string;
  size?: string;
  colour?: string;
  material?: string;
  style?: string;
  sku: string;
  price_override?: string;
  stock_count?: string;
  low_stock_threshold?: string;
}

export interface ProductImportGroup {
  slug: string;
  name: string;
  description: string | null;
  categorySlug: string;
  basePrice: number;
  costPrice: number | null;
  status: "draft" | "active" | "archived";
  isBestseller: boolean;
  isNew: boolean;
  images: string[];
  variants: {
    size: string | null;
    colour: string | null;
    material: string | null;
    style: string | null;
    sku: string;
    priceOverride: number | null;
    stockCount: number;
    lowStockThreshold: number;
  }[];
}

const REQUIRED_HEADERS = ["product_slug", "sku"];
const TRUE_VALUES = new Set(["true", "1", "yes"]);

export function parseProductsCsv(csvText: string): { groups: ProductImportGroup[]; errors: string[] } {
  const errors: string[] = [];
  const { data, errors: parseErrors } = Papa.parse<ProductImportRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  for (const err of parseErrors) errors.push(`Row ${err.row}: ${err.message}`);

  if (data.length > 0) {
    const headers = Object.keys(data[0] as object);
    for (const required of REQUIRED_HEADERS) {
      if (!headers.includes(required)) errors.push(`Missing required column: ${required}`);
    }
  }
  if (errors.length > 0) return { groups: [], errors };

  const groupsBySlug = new Map<string, ProductImportGroup>();

  data.forEach((row, index) => {
    const rowNum = index + 2; // header is row 1
    const slug = row.product_slug?.trim();
    const sku = row.sku?.trim();

    if (!slug) {
      errors.push(`Row ${rowNum}: missing product_slug`);
      return;
    }
    if (!sku) {
      errors.push(`Row ${rowNum}: missing sku`);
      return;
    }

    let group = groupsBySlug.get(slug);
    if (!group) {
      if (!row.product_name || !row.category_slug || !row.base_price) {
        errors.push(
          `Row ${rowNum}: first row for a new product ("${slug}") needs product_name, category_slug, and base_price`,
        );
        return;
      }
      const basePrice = Number(row.base_price);
      if (Number.isNaN(basePrice)) {
        errors.push(`Row ${rowNum}: base_price "${row.base_price}" is not a number`);
        return;
      }

      group = {
        slug,
        name: row.product_name.trim(),
        description: row.description?.trim() || null,
        categorySlug: row.category_slug.trim(),
        basePrice,
        costPrice: row.cost_price ? Number(row.cost_price) : null,
        status: (row.status?.trim().toLowerCase() as ProductImportGroup["status"]) || "active",
        isBestseller: TRUE_VALUES.has(row.is_bestseller?.trim().toLowerCase() ?? ""),
        isNew: TRUE_VALUES.has(row.is_new?.trim().toLowerCase() ?? ""),
        images: row.images ? row.images.split(";").map((s) => s.trim()).filter(Boolean) : [],
        variants: [],
      };
      groupsBySlug.set(slug, group);
    }

    const stockCount = Number(row.stock_count ?? 0);
    if (Number.isNaN(stockCount)) {
      errors.push(`Row ${rowNum}: stock_count "${row.stock_count}" is not a number`);
      return;
    }

    group.variants.push({
      size: row.size?.trim() || null,
      colour: row.colour?.trim() || null,
      material: row.material?.trim() || null,
      style: row.style?.trim() || null,
      sku,
      priceOverride: row.price_override ? Number(row.price_override) : null,
      stockCount,
      lowStockThreshold: row.low_stock_threshold ? Number(row.low_stock_threshold) : 5,
    });
  });

  return { groups: [...groupsBySlug.values()], errors };
}
