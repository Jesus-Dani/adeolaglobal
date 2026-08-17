-- Phase 1 (Foundation) core data model: profiles, categories, products,
-- product_variants. Cart/wishlist/orders/payments/reviews/analytics tables
-- are deliberately deferred to the phases that build the features using them
-- (Phase 2, 3, 5) — see docs/PRD.md ss5 and the Phase 1 plan.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles (extends auth.users — TRD.md s4)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new Supabase Auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data ->> 'name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- SECURITY DEFINER so it can read profiles.role without recursing into the
-- RLS policies defined on the profiles table below. Defined only now that
-- profiles exists, since `language sql` function bodies are parse-analyzed
-- against the catalog at creation time.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "Users can update their own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Categories are publicly readable"
  on public.categories for select
  using (true);

create policy "Admins manage categories"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id),
  name text not null,
  slug text not null unique,
  description text,
  base_price numeric(12, 2) not null check (base_price >= 0),
  -- Admin-only (see column-privilege revoke below) — used for the profit
  -- dashboard in Phase 4 (PRD.md s3.2). Never exposed to storefront queries.
  cost_price numeric(12, 2) check (cost_price >= 0),
  images text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  is_bestseller boolean not null default false,
  is_new boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_id_idx on public.products (category_id);
create index products_status_idx on public.products (status);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

alter table public.products enable row level security;

create policy "Active products are publicly readable"
  on public.products for select
  using (status = 'active' or public.is_admin());

create policy "Admins manage products"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

-- Defense in depth: even if a client queries with `select *`, cost_price
-- cannot leak to the storefront — the query will fail outright unless the
-- caller explicitly avoids that column. Admin operations use the secret-key
-- client (src/lib/supabase/server.ts createAdminClient), which is unaffected
-- by these grants.
revoke select (cost_price) on public.products from anon, authenticated;

-- ---------------------------------------------------------------------------
-- product_variants
-- ---------------------------------------------------------------------------

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  size text,
  colour text,
  material text,
  style text,
  sku text not null unique,
  price_override numeric(12, 2) check (price_override >= 0),
  stock_count integer not null default 0 check (stock_count >= 0),
  low_stock_threshold integer not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index product_variants_product_id_idx on public.product_variants (product_id);

create trigger product_variants_set_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

alter table public.product_variants enable row level security;

create policy "Variants of visible products are publicly readable"
  on public.product_variants for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.products
      where products.id = product_variants.product_id
        and products.status = 'active'
    )
  );

create policy "Admins manage product variants"
  on public.product_variants for all
  using (public.is_admin())
  with check (public.is_admin());
