-- Current public.products.id is UUID.
-- Batch 1 created custom_cover_customizations.product_id as integer.
-- Convert it to UUID before custom-cover features are used.

alter table public.custom_cover_customizations
  alter column product_id type uuid
  using product_id::text::uuid;
