-- Adds a per-product sale price so the admin can run discounts: when set
-- and lower than base_price, the storefront shows base_price struck
-- through next to sale_price. A variant with its own price_override is
-- left alone (that price was set deliberately for that variant, not part
-- of a general sale) — see getVariantPrice() in product-helpers.ts, the
-- one place this precedence is decided, used by every consumer
-- (storefront display, add-to-cart, and checkout's server-side repricing)
-- so they can never disagree with each other.

alter table public.products
  add column sale_price numeric(12, 2) check (sale_price is null or sale_price >= 0);

alter table public.products
  add constraint products_sale_price_below_base check (sale_price is null or sale_price < base_price);

-- sale_price is public (customers need to see it), unlike cost_price —
-- same explicit-column-grant pattern as
-- 20260817090000_fix_cost_price_column_privileges.sql, since a table-wide
-- GRANT would override any column-level REVOKE and a bare ADD COLUMN
-- doesn't extend the existing explicit grant on its own.
revoke select on public.products from anon, authenticated;

grant select (
  id, category_id, name, slug, description, base_price, sale_price, images,
  status, is_bestseller, is_new, created_at, updated_at, fts
) on public.products to anon, authenticated;
