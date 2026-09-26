-- MineNote catalog products: immutable-ready 4-side production foundation.
-- This migration does NOT modify historical orders.

alter table public.products
  add column if not exists production_assets jsonb not null default '[]'::jsonb;

alter table public.products
  add column if not exists production_template_version text
    not null default 'minenote-v1';

comment on column public.products.production_assets is
  'Catalog production assets for the four physical notebook sides: front, insideFront, insideBack, back.';

comment on column public.products.production_template_version is
  'Permanent MineNote production template version used when composing catalog artwork.';
