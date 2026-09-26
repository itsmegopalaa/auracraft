-- ============================================================
-- MineNote catalog/product production storage
-- ============================================================
-- Dedicated private bucket for catalog production artwork.
-- Customer custom-cover storage remains completely separate.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit
)
values (
  'minenote-product-production',
  'minenote-product-production',
  false,
  20971520
)
on conflict (id) do nothing;

-- ============================================================
-- Admin/service-role access
-- ============================================================
-- Product production assets are managed by authenticated
-- admin/server workflows. Public access is intentionally disabled.

drop policy if exists "MineNote admins can read product production assets"
  on storage.objects;

create policy "MineNote admins can read product production assets"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'minenote-product-production'
    and public.is_admin()
  );

drop policy if exists "MineNote admins can upload product production assets"
  on storage.objects;

create policy "MineNote admins can upload product production assets"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'minenote-product-production'
    and public.is_admin()
  );

drop policy if exists "MineNote admins can update product production assets"
  on storage.objects;

create policy "MineNote admins can update product production assets"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'minenote-product-production'
    and public.is_admin()
  )
  with check (
    bucket_id = 'minenote-product-production'
    and public.is_admin()
  );

drop policy if exists "MineNote admins can delete product production assets"
  on storage.objects;

create policy "MineNote admins can delete product production assets"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'minenote-product-production'
    and public.is_admin()
  );

-- ============================================================
-- Canonical path convention
-- ============================================================
-- template/<template-key>/<version>/<side>
--
-- Product-composed assets will later use:
-- product/<product-id>/<template-version>/<side>
--
-- This migration only establishes the storage layer.
-- No artwork is inserted here.
