alter table public.orders
  add column if not exists refund_status text,
  add column if not exists refund_id text,
  add column if not exists refund_amount integer,
  add column if not exists refund_processed_at timestamptz;

alter table public.orders
  add constraint orders_refund_status_check
  check (
    refund_status is null
    or refund_status in (
      'pending',
      'processed',
      'failed',
      'partial'
    )
  );

create unique index if not exists orders_refund_id_key
  on public.orders (refund_id)
  where refund_id is not null;
