-- Public Storage bucket for admin-uploaded product images. All writes go
-- through the admin-gated server route (POST /api/admin/upload) using the
-- service-role client, which bypasses Storage RLS entirely — so no storage
-- policies are needed for uploads. `public: true` makes objects readable via
-- their public URL directly, which is what the storefront needs (product
-- photos must be visible to anonymous visitors) without any RLS at all for
-- reads either.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
