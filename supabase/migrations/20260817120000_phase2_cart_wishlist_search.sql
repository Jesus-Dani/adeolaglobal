-- Phase 2 (Storefront Core) schema additions: carts/cart_items, wishlists,
-- and full-text search on products. Follows the same RLS/is_admin() pattern
-- established in 20260816220000_phase1_core_schema.sql.

-- ---------------------------------------------------------------------------
-- carts / cart_items
-- ---------------------------------------------------------------------------

-- One cart per user, id = user's own id (never a separate uuid) — guests
-- never get a DB row at all; their cart lives in localStorage only and is
-- merged in on login (src/lib/store/cart.ts).
create table public.carts (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Every new user gets an empty cart automatically, so app code never has to
-- branch on "does a cart exist yet" — extends the Phase 1 handle_new_user().
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data ->> 'name');

  insert into public.carts (id)
  values (new.id);

  return new;
end;
$$;

alter table public.carts enable row level security;

create policy "Users manage their own cart"
  on public.carts for all
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid());

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, variant_id)
);

create index cart_items_cart_id_idx on public.cart_items (cart_id);

create trigger cart_items_set_updated_at
  before update on public.cart_items
  for each row execute function public.set_updated_at();

alter table public.cart_items enable row level security;

create policy "Users manage items in their own cart"
  on public.cart_items for all
  using (
    public.is_admin()
    or exists (select 1 from public.carts where carts.id = cart_items.cart_id and carts.id = auth.uid())
  )
  with check (
    exists (select 1 from public.carts where carts.id = cart_items.cart_id and carts.id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- wishlists
-- ---------------------------------------------------------------------------

create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index wishlists_user_id_idx on public.wishlists (user_id);

alter table public.wishlists enable row level security;

create policy "Users manage their own wishlist"
  on public.wishlists for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Full-text search on products
-- ---------------------------------------------------------------------------

alter table public.products
  add column fts tsvector
  generated always as (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
  ) stored;

create index products_fts_idx on public.products using gin (fts);

-- The Phase-1 cost_price fix revoked table-wide SELECT and granted an
-- explicit column list — fts needs to be added to that list so search works
-- for anonymous storefront browsing too.
grant select (fts) on public.products to anon, authenticated;
