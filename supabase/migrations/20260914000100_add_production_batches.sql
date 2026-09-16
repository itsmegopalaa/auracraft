create table if not exists public.production_batches (
  id uuid primary key default gen_random_uuid(),

  batch_number bigint generated always as identity unique,

  status text not null default 'draft',

  notes text,

  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),

  constraint production_batches_status_check
    check (
      status in (
        'draft',
        'in_progress',
        'completed',
        'cancelled'
      )
    )
);

create table if not exists public.production_batch_shipments (
  id uuid primary key default gen_random_uuid(),

  batch_id uuid not null
    references public.production_batches(id)
    on delete cascade,

  shipment_id uuid not null
    references public.shipments(id)
    on delete cascade,

  added_at timestamptz not null default now(),
  completed_at timestamptz,

  unique (batch_id, shipment_id)
);

create index if not exists production_batches_status_idx
  on public.production_batches(status);

create index if not exists production_batches_created_at_idx
  on public.production_batches(created_at desc);

create index if not exists production_batch_shipments_batch_id_idx
  on public.production_batch_shipments(batch_id);

create index if not exists production_batch_shipments_shipment_id_idx
  on public.production_batch_shipments(shipment_id);

-- A shipment can belong to only one active production batch.
create unique index if not exists production_batch_shipments_active_shipment_idx
  on public.production_batch_shipments(shipment_id)
  where completed_at is null;

alter table public.production_batches enable row level security;
alter table public.production_batch_shipments enable row level security;

create policy "Admins can view production batches"
on public.production_batches
for select
to authenticated
using (public.is_admin());

create policy "Admins can create production batches"
on public.production_batches
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update production batches"
on public.production_batches
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete production batches"
on public.production_batches
for delete
to authenticated
using (public.is_admin());

create policy "Admins can view production batch shipments"
on public.production_batch_shipments
for select
to authenticated
using (public.is_admin());

create policy "Admins can create production batch shipments"
on public.production_batch_shipments
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update production batch shipments"
on public.production_batch_shipments
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete production batch shipments"
on public.production_batch_shipments
for delete
to authenticated
using (public.is_admin());

grant select, insert, update, delete
on public.production_batches
to authenticated;

grant select, insert, update, delete
on public.production_batch_shipments
to authenticated;
