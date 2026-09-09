-- Phase 6 (PWA & Polish) push notifications: stores Web Push subscriptions
-- for logged-in users, one row per subscribed device/browser. Follows the
-- same RLS/is_admin() pattern established in earlier migrations.
--
-- Notifications are sent server-side via the service-role client (see
-- src/lib/push/send.ts), triggered from the admin order-status update route
-- — the select-for-admin policy exists for consistency/defense-in-depth,
-- not because the sending path actually needs it (it already bypasses RLS).

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  created_at timestamptz not null default now()
);

create index push_subscriptions_user_id_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

create policy "Users manage their own push subscriptions"
  on public.push_subscriptions for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());
