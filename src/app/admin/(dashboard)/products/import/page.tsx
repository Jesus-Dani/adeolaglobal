import { HairlineDivider } from "@/components/hairline-divider";
import { ImportForm } from "./import-form";

export const metadata = { title: "Import Products | Admin | ADEOLA Global Ltd" };

const SAMPLE_CSV = `product_slug,product_name,description,category_slug,base_price,cost_price,status,is_bestseller,is_new,images,size,colour,material,style,sku,price_override,stock_count,low_stock_threshold
rosemary-oil,Rosemary Hair Oil,A rosemary-infused oil,hair-care,8500,3000,active,true,false,,100ml,,,,,ADG-RHO-100,,25,5
tote-bag,Handmade Tote,Woven with care,crochet-accessories,15000,6000,active,,true,,,,,,ADG-TB-LIL,,10,5
tote-bag,,,,,,,,,,,,,,ADG-TB-TAN,,8,5`;

export default function ImportProductsPage() {
  return (
    <div>
      <h1 className="font-display text-display-l text-deep-plum">Import Products</h1>
      <HairlineDivider className="mt-4 max-w-40" />

      <div className="mt-6 max-w-3xl rounded-xl border border-border bg-white p-4 text-body-s text-muted-foreground">
        <p>
          One row per variant, grouped by <code className="text-charcoal">product_slug</code>. Only the
          first row for a new product needs <code className="text-charcoal">product_name</code>,{" "}
          <code className="text-charcoal">category_slug</code>, and{" "}
          <code className="text-charcoal">base_price</code> — repeat the slug on following rows to add more
          variants to the same product.
        </p>
        <p className="mt-2">
          <strong className="text-charcoal">Re-importing a product replaces its variant set</strong> —
          matched by SKU, so re-uploading to update stock is safe, but leaving a variant&apos;s row out of
          the CSV deletes it.
        </p>
        <details className="mt-3">
          <summary className="cursor-pointer text-plum">Show sample CSV</summary>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-soft-lilac p-3 text-body-s">{SAMPLE_CSV}</pre>
        </details>
      </div>

      <div className="mt-6 max-w-3xl">
        <ImportForm />
      </div>
    </div>
  );
}
