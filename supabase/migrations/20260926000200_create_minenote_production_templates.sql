-- MineNote permanent production templates.
-- Templates are versioned and locked so historical production
-- composition never depends on a mutable live template.

create table if not exists public.minenote_production_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null,
  version text not null,
  name text not null,
  description text,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'retired')),
  locked boolean not null default false,
  required_elements jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint minenote_production_templates_key_version_unique
    unique (template_key, version)
);

create table if not exists public.minenote_production_template_assets (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null
    references public.minenote_production_templates(id)
    on delete cascade,
  side text not null
    check (side in ('front', 'insideFront', 'insideBack', 'back')),
  storage_path text not null,
  width integer,
  height integer,
  mime_type text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),

  constraint minenote_template_asset_side_unique
    unique (template_id, side)
);

create index if not exists idx_minenote_templates_status
  on public.minenote_production_templates(status);

create index if not exists idx_minenote_template_assets_template
  on public.minenote_production_template_assets(template_id);

comment on table public.minenote_production_templates is
  'Versioned permanent MineNote production templates. Locked templates must never be edited in place.';

comment on table public.minenote_production_template_assets is
  'Four physical production surfaces belonging to a specific immutable MineNote template version.';

comment on column public.minenote_production_templates.required_elements is
  'Mandatory branding/legal/product-information elements that must survive final composition.';
