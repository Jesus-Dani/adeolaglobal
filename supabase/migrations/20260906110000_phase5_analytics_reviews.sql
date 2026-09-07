-- Phase 5 (Analytics & Reviews) schema: a custom event-tracking pipeline and
-- verified-purchase product reviews. Follows the same RLS/is_admin() pattern
-- established in earlier migrations.
--
-- Design notes (see the Phase 5 plan for full rationale):
-- - analytics_events logs authenticated users only (no guest/anon tracking),
--   per the TRD's analytics scope. Inserts go through the RLS-respecting
--   client (not the service-role admin client), so `user_id = auth.uid()`
--   is a real, meaningful check rather than a formality.
-- - reviews enforces "verified purchase" at the database level via the
--   insert policy's WITH CHECK, not just in application code — the same
--   defense-in-depth posture as the Phase 3 RPC privilege lockdown.

-- ---------------------------------------------------------------------------
-- analytics_events
-- ---------------------------------------------------------------------------

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null
    check (event_type in ('product_view', 'search', 'add_to_cart', 'checkout_start', 'purchase')),
  product_id uuid references public.products (id) on delete set null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index analytics_events_user_id_idx on public.analytics_events (user_id);
create index analytics_events_event_type_idx on public.analytics_events (event_type);
create index analytics_events_product_id_idx on public.analytics_events (product_id);
create index analytics_events_created_at_idx on public.analytics_events (created_at);

alter table public.analytics_events enable row level security;

create policy "Users log their own events"
  on public.analytics_events for insert
  with check (user_id = auth.uid());

create policy "Admins read all events"
  on public.analytics_events for select
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  body text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, user_id)
);

create index reviews_product_id_idx on public.reviews (product_id);
create index reviews_user_id_idx on public.reviews (user_id);
create index reviews_status_idx on public.reviews (status);

create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

alter table public.reviews enable row level security;

create policy "Approved reviews are publicly readable"
  on public.reviews for select
  using (status = 'approved' or user_id = auth.uid() or public.is_admin());

create policy "Verified purchasers can review"
  on public.reviews for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.orders o
      join public.order_items oi on oi.order_id = o.id
      join public.product_variants pv on pv.id = oi.variant_id
      where o.user_id = auth.uid()
        and o.status = 'delivered'
        and pv.product_id = reviews.product_id
    )
  );

create policy "Admins moderate reviews"
  on public.reviews for update
  using (public.is_admin())
  with check (public.is_admin());
