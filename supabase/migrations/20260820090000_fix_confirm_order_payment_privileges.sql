-- Fixes a real vulnerability found by direct verification against the live
-- project: Postgres grants EXECUTE on newly-created functions to PUBLIC by
-- default, so anon (and authenticated) could call confirm_order_payment
-- directly. Since the Paystack reference is known client-side by design
-- (it's needed to redirect the browser to Paystack's checkout), anyone could
-- have called this RPC with a real reference to mark their own unpaid order
-- as confirmed and decrement stock without ever paying. This function must
-- only be reachable via the admin (service-role) client from the webhook
-- route.

revoke execute on function public.confirm_order_payment(text, text) from public;
revoke execute on function public.confirm_order_payment(text, text) from anon, authenticated;
grant execute on function public.confirm_order_payment(text, text) to service_role;
