import { describe, expect, it } from "vitest";
import {
  getActiveAttributes,
  getAttributeValues,
  resolveVariant,
  defaultSelection,
} from "./variant-selection";

type Variant = {
  id: string;
  size: string | null;
  colour: string | null;
  material: string | null;
  style: string | null;
  sku: string;
  price_override: number | null;
  stock_count: number;
};

function variant(overrides: Partial<Variant>): Variant {
  return {
    id: "v",
    size: null,
    colour: null,
    material: null,
    style: null,
    sku: "SKU",
    price_override: null,
    stock_count: 10,
    ...overrides,
  };
}

describe("single-variant product (all 3 seed products today)", () => {
  const variants = [variant({ id: "v1", size: "100ml" })];

  it("treats only size as active", () => {
    expect(getActiveAttributes(variants)).toEqual(["size"]);
  });

  it("defaultSelection auto-selects the only variant", () => {
    const selection = defaultSelection(variants);
    expect(resolveVariant(variants, selection)?.id).toBe("v1");
  });
});

describe("multi-variant product (size x colour)", () => {
  const variants = [
    variant({ id: "small-red", size: "S", colour: "Red" }),
    variant({ id: "small-blue", size: "S", colour: "Blue" }),
    variant({ id: "large-red", size: "L", colour: "Red" }),
  ];

  it("finds both size and colour as active attributes", () => {
    expect(getActiveAttributes(variants)).toEqual(["size", "colour"]);
  });

  it("lists distinct values per attribute", () => {
    expect(getAttributeValues(variants, "size")).toEqual(["S", "L"]);
    expect(getAttributeValues(variants, "colour")).toEqual(["Red", "Blue"]);
  });

  it("resolves the exact variant for a full selection", () => {
    expect(resolveVariant(variants, { size: "L", colour: "Red" })?.id).toBe("large-red");
  });

  it("returns undefined for a combination that doesn't exist", () => {
    expect(resolveVariant(variants, { size: "L", colour: "Blue" })).toBeUndefined();
  });

  it("returns undefined for a partial selection", () => {
    expect(resolveVariant(variants, { size: "S" })).toBeUndefined();
  });
});
