-- Removes Paystack from the checkout flow in favour of manual bank
-- transfer: the customer places the order, transfers to the business's
-- account directly, and an admin confirms the order by hand once they see
-- the transfer land. This migration adds the one piece of logic that move
-- needs and previously lived only in the Paystack webhook path: atomic,
-- race-safe stock decrement at confirmation time.
--
-- The `payments` table and `confirm_order_payment()` (Paystack-specific)
-- are left in place rather than dropped — they're simply unused by the
-- app going forward. Dropping them is a separate, deliberate call the
-- business can make later; this migration only adds new behaviour.

-- ---------------------------------------------------------------------------
-- Atomic, idempotent manual order confirmation — called only by the admin
-- order-status route via the admin client (SECURITY DEFINER so it can
-- bypass RLS deliberately, not accidentally: nothing else has a path to
-- call this). Mirrors confirm_order_payment's locking/stock-check logic,
-- keyed by order id instead of a payment reference since there's no
-- payment gateway reference anymore.
-- ---------------------------------------------------------------------------

create or replace function public.confirm_order_manually(
  p_order_id uuid
)
returns text -- 'confirmed' | 'stock_conflict' | 'already_processed'
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_item record;
  v_insufficient boolean := false;
begin
  -- Locks the order row so concurrent confirmation attempts for the same
  -- order serialize instead of racing.
  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'No order found for id %', p_order_id;
  end if;

  if v_order.status <> 'pending' then
    return 'already_processed';
  end if;

  -- Lock every variant this order touches and check sufficiency for ALL of
  -- them before decrementing anything — a failure partway through must
  -- never leave a partial decrement.
  for v_item in
    select oi.variant_id, oi.quantity, pv.stock_count
    from public.order_items oi
    join public.product_variants pv on pv.id = oi.variant_id
    where oi.order_id = p_order_id
    for update of pv
  loop
    if v_item.stock_count < v_item.quantity then
      v_insufficient := true;
    end if;
  end loop;

  if v_insufficient then
    update public.orders set status = 'stock_conflict' where id = p_order_id;
    return 'stock_conflict';
  end if;

  update public.product_variants pv
  set stock_count = pv.stock_count - oi.quantity
  from public.order_items oi
  where oi.order_id = p_order_id and oi.variant_id = pv.id;

  update public.orders set status = 'confirmed' where id = p_order_id;

  return 'confirmed';
end;
$$;

-- Same privilege lockdown reasoning as confirm_order_payment (see
-- 20260820090000_fix_confirm_order_payment_privileges.sql): Postgres grants
-- EXECUTE on new functions to PUBLIC by default, which would let any
-- authenticated or anonymous client call this directly and confirm/decrement
-- stock for an order without admin involvement at all.
revoke execute on function public.confirm_order_manually(uuid) from public;
revoke execute on function public.confirm_order_manually(uuid) from anon, authenticated;
grant execute on function public.confirm_order_manually(uuid) to service_role;
