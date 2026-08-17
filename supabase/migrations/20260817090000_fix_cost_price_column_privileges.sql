-- Fixes a real gap found by direct verification against the live project:
-- Supabase auto-grants table-wide SELECT on new tables to anon/authenticated
-- (default privileges). A column-level REVOKE on top of a table-wide GRANT
-- does not actually restrict access in Postgres — the broader grant still
-- wins. The only correct fix is to revoke the table-wide grant and re-grant
-- SELECT on the explicit safe column list instead.

revoke select on public.products from anon, authenticated;

grant select (
  id, category_id, name, slug, description, base_price, images, status,
  is_bestseller, is_new, created_at, updated_at
) on public.products to anon, authenticated;
