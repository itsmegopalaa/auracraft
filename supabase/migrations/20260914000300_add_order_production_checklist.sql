-- Production belongs to the order, not the shipment.
-- Shipment is created only after production is complete.

alter table public.orders
  add column if not exists product_printed boolean not null default false,
  add column if not exists cover_verified boolean not null default false,
  add column if not exists notebook_assembled boolean not null default false,
  add column if not exists quality_checked boolean not null default false,
  add column if not exists packed boolean not null default false,
  add column if not exists production_checklist_updated_at timestamptz,
  add column if not exists production_completed_at timestamptz;

create index if not exists orders_production_ready_idx
  on public.orders(order_status, payment_status)
  where payment_status = 'paid'
    and order_status in ('confirmed', 'processing');
