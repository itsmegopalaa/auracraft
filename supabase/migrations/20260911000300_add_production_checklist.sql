alter table public.shipments
  add column if not exists product_printed boolean not null default false,
  add column if not exists cover_verified boolean not null default false,
  add column if not exists notebook_assembled boolean not null default false,
  add column if not exists quality_checked boolean not null default false,
  add column if not exists packed boolean not null default false,
  add column if not exists handed_over boolean not null default false,
  add column if not exists checklist_updated_at timestamptz;

create index if not exists shipments_ready_for_pickup_idx
  on public.shipments(status)
  where status = 'ready_for_pickup';
