import { describe, expect, it } from "vitest";
import { parseProductsCsv } from "./csv-import";

describe("parseProductsCsv", () => {
  it("groups multiple variant rows under one product", () => {
    const csv = `product_slug,product_name,category_slug,base_price,sku,size,stock_count
tote-bag,Tote Bag,crochet-accessories,15000,SKU-S,Small,5
tote-bag,,,,SKU-L,Large,3`;

    const { groups, errors } = parseProductsCsv(csv);
    expect(errors).toEqual([]);
    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe("Tote Bag");
    expect(groups[0].variants).toHaveLength(2);
    expect(groups[0].variants.map((v) => v.sku)).toEqual(["SKU-S", "SKU-L"]);
  });

  it("parses booleans, optional price override, and images list", () => {
    const csv = `product_slug,product_name,category_slug,base_price,is_bestseller,is_new,images,sku,price_override,stock_count
oil,Hair Oil,hair-care,8500,true,false,http://a.jpg;http://b.jpg,SKU-1,9000,10`;

    const { groups, errors } = parseProductsCsv(csv);
    expect(errors).toEqual([]);
    expect(groups[0].isBestseller).toBe(true);
    expect(groups[0].isNew).toBe(false);
    expect(groups[0].images).toEqual(["http://a.jpg", "http://b.jpg"]);
    expect(groups[0].variants[0].priceOverride).toBe(9000);
  });

  it("defaults status to active and low_stock_threshold to 5 when omitted", () => {
    const csv = `product_slug,product_name,category_slug,base_price,sku,stock_count
serum,Serum,skincare,7000,SKU-1,20`;

    const { groups } = parseProductsCsv(csv);
    expect(groups[0].status).toBe("active");
    expect(groups[0].variants[0].lowStockThreshold).toBe(5);
  });

  it("rejects a row missing sku", () => {
    const csv = `product_slug,product_name,category_slug,base_price,sku,stock_count
serum,Serum,skincare,7000,,20`;

    const { groups, errors } = parseProductsCsv(csv);
    expect(groups).toEqual([]);
    expect(errors[0]).toMatch(/missing sku/);
  });

  it("rejects a new product's first row missing required fields", () => {
    const csv = `product_slug,sku,stock_count
serum,SKU-1,20`;

    const { errors } = parseProductsCsv(csv);
    expect(errors[0]).toMatch(/needs product_name, category_slug, and base_price/);
  });

  it("rejects a non-numeric base_price", () => {
    const csv = `product_slug,product_name,category_slug,base_price,sku,stock_count
serum,Serum,skincare,not-a-number,SKU-1,20`;

    const { errors } = parseProductsCsv(csv);
    expect(errors[0]).toMatch(/is not a number/);
  });

  it("flags a missing required column", () => {
    const csv = `product_name,category_slug,base_price,sku,stock_count
Serum,skincare,7000,SKU-1,20`;

    const { errors } = parseProductsCsv(csv);
    expect(errors).toContain("Missing required column: product_slug");
  });
});
