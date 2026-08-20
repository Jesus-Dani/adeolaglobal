-- Phase 3 (Payments & Orders) schema: orders, order_items, payments, and the
-- atomic stock-decrement function the Paystack webhook calls. Follows the
-- same RLS/is_admin() pattern established in earlier migrations.
--
-- Design notes (see the Phase 3 plan for the full rationale):
-- - orders/order_items/payments get NO public insert/update policies at all.
--   Checkout and webhook processing both go through server routes using the
--   admin (service-role) client, which independently re-validates prices/
--   stock from the DB. RLS here only grants customers read access to their
--   own orders.
-- - One payment attempt per order (payments.order_id is unique). A failed
--   payment means starting a new checkout, not retrying the same order.
-- - "Abandoned" payments are derived at query time (a `pending` payment past
--   some age), not a stored status — no background job needed for this.

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------

create sequence public.order_number_seq;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique
    default ('ADG-' || lpad(nextval('public.order_number_seq')::text, 4, '0')),
  user_id uuid references auth.users (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'out_for_delivery', 'delivered', 'payment_failed', 'stock_conflict')),
  delivery_name text not null,
  delivery_phone text not null,
  delivery_address text not null,
  delivery_notes text,
  terms_accepted boolean not null check (terms_accepted = true),
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.orders enable row level security;

create policy "Users read their own orders"
  on public.orders for select
  using (user_id = auth.uid() or public.is_admin());

create policy "Admins update orders"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------------

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id),
  quantity integer not null check (quantity > 0),
  -- Server-computed at checkout time, never client-supplied — this is what
  -- protects against a tampered/stale price reaching an actual charge.
  price_at_purchase numeric(12, 2) not null check (price_at_purchase >= 0),
  created_at timestamptz not null default now()
);

create index order_items_order_id_idx on public.order_items (order_id);

alter table public.order_items enable row level security;

create policy "Users read items on their own orders"
  on public.order_items for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders
      where orders.id = order_items.order_id and orders.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  paystack_reference text not null unique,
  status text not null default 'pending' check (status in ('pending', 'success', 'failed')),
  channel text,
  amount numeric(12, 2) not null check (amount >= 0),
  webhook_verified_at timestamptz,
  created_at timestamptz not null default now()
);

create index payments_order_id_idx on public.payments (order_id);
create index payments_reference_idx on public.payments (paystack_reference);

alter table public.payments enable row level security;

create policy "Users read payments on their own orders"
  on public.payments for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders
      where orders.id = payments.order_id and orders.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Atomic, idempotent order confirmation — called only by the webhook route
-- via the admin client (SECURITY DEFINER so it can bypass RLS deliberately,
-- not accidentally: nothing else has a path to call this).
-- ---------------------------------------------------------------------------

create or replace function public.confirm_order_payment(
  p_paystack_reference text,
  p_channel text
)
returns text -- 'confirmed' | 'stock_conflict' | 'already_processed'
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment record;
  v_item record;
  v_insufficient boolean := false;
begin
  -- Locks the payment row so concurrent webhook deliveries for the same
  -- reference (Paystack retries) serialize instead of racing.
  select * into v_payment
  from public.payments
  where paystack_reference = p_paystack_reference
  for update;

  if not found then
    raise exception 'No payment found for reference %', p_paystack_reference;
  end if;

  if v_payment.status = 'success' then
    return 'already_processed';
  end if;

  -- Lock every variant this order touches and check sufficiency for ALL of
  -- them before decrementing anything — a failure partway through must never
  -- leave a partial decrement.
  for v_item in
    select oi.variant_id, oi.quantity, pv.stock_count
    from public.order_items oi
    join public.product_variants pv on pv.id = oi.variant_id
    where oi.order_id = v_payment.order_id
    for update of pv
  loop
    if v_item.stock_count < v_item.quantity then
      v_insufficient := true;
    end if;
  end loop;

  if v_insufficient then
    -- The payment genuinely succeeded (Paystack already captured the money)
    -- — it's fulfillment that has a conflict, flagged for manual resolution
    -- rather than silently overselling or reversing the charge.
    update public.payments
    set status = 'success', channel = p_channel, webhook_verified_at = now()
    where id = v_payment.id;

    update public.orders set status = 'stock_conflict' where id = v_payment.order_id;
    return 'stock_conflict';
  end if;

  update public.product_variants pv
  set stock_count = pv.stock_count - oi.quantity
  from public.order_items oi
  where oi.order_id = v_payment.order_id and oi.variant_id = pv.id;

  update public.payments
  set status = 'success', channel = p_channel, webhook_verified_at = now()
  where id = v_payment.id;

  update public.orders set status = 'confirmed' where id = v_payment.order_id;

  return 'confirmed';
end;
$$;
