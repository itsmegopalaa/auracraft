create table if not exists public.custom_cover_customizations (
  id uuid primary key default gen_random_uuid(),

  customer_id uuid references auth.users(id) on delete set null,
  product_id integer not null,

  template_id text,
  creation_method text not null
    check (creation_method in ('ai', 'upload', 'template')),

  status text not null default 'draft'
    check (
      status in (
        'draft',
        'customer_approved',
        'admin_review',
        'approved_for_print',
        'rejected',
        'archived'
      )
    ),

  version integer not null default 1,

  customer_name text,
  customer_text text,

  design jsonb not null default '{}'::jsonb,
  print_spec jsonb not null default '{}'::jsonb,

  preview_front_url text,
  preview_back_url text,

  production_front_url text,
  production_back_url text,

  customer_approved_at timestamptz,
  admin_approved_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists custom_cover_customizations_customer_id_idx
  on public.custom_cover_customizations(customer_id);

create index if not exists custom_cover_customizations_product_id_idx
  on public.custom_cover_customizations(product_id);

create index if not exists custom_cover_customizations_status_idx
  on public.custom_cover_customizations(status);

create index if not exists custom_cover_customizations_created_at_idx
  on public.custom_cover_customizations(created_at desc);

alter table public.custom_cover_customizations enable row level security;

drop policy if exists "Customers can view own customizations"
  on public.custom_cover_customizations;

create policy "Customers can view own customizations"
  on public.custom_cover_customizations
  for select
  to authenticated
  using (customer_id = auth.uid());

drop policy if exists "Customers can create own customizations"
  on public.custom_cover_customizations;

create policy "Customers can create own customizations"
  on public.custom_cover_customizations
  for insert
  to authenticated
  with check (customer_id = auth.uid());

drop policy if exists "Customers can update own draft customizations"
  on public.custom_cover_customizations;

create policy "Customers can update own draft customizations"
  on public.custom_cover_customizations
  for update
  to authenticated
  using (
    customer_id = auth.uid()
    and status = 'draft'
  )
  with check (
    customer_id = auth.uid()
    and status = 'draft'
  );

grant select, insert, update
  on public.custom_cover_customizations
  to authenticated;

grant all
  on public.custom_cover_customizations
  to service_role;
