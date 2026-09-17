/*
  MineNote Custom Cover — Production Asset Hardening

  Guarantees one production asset per customization + physical side
  while keeping the constraint compatible with Supabase/PostgREST upsert.
*/

alter table public.custom_cover_assets
  add column if not exists production_key text
  generated always as (
    case
      when kind = 'production' then side
      else null
    end
  ) stored;

create unique index if not exists
  custom_cover_assets_production_unique_key_idx
on public.custom_cover_assets (
  customization_id,
  production_key
);
