-- Lets a customer upload a screenshot/photo of their bank transfer receipt
-- on their order page, so an admin can verify it faster than waiting to
-- cross-reference a bank statement blind. Unlike product-images (public,
-- Phase 4), this bucket is private: a payment proof can show account
-- numbers and other transaction details, so it's never served from a
-- public URL, only ever via a short-lived signed URL generated server-side
-- for the order's owner or an admin.

alter table public.orders add column payment_proof_path text;

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;
