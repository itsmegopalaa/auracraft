-- Production is order-centric.
-- Shipment must be created only after production is completed.

create table if not exists public.production_batch_orders (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.production_batches(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  added_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (batch_id, order_id)
);

create unique index if not exists production_batch_orders_active_order_idx
  on public.production_batch_orders(order_id)
  where completed_at is null;

create index if not exists production_batch_orders_batch_idx
  on public.production_batch_orders(batch_id);

create index if not exists production_batch_orders_order_idx
  on public.production_batch_orders(order_id);

alter table public.production_batch_orders enable row level security;

drop policy if exists "Admins can manage production batch orders"
  on public.production_batch_orders;

create policy "Admins can manage production batch orders"
  on public.production_batch_orders
  for all
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update, delete
  on public.production_batch_orders
  to authenticated;
