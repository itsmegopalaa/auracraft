create table if not exists public.payment_intents (
  id uuid primary key default gen_random_uuid(),

  razorpay_order_id text not null unique,
  mine_note_order_id text not null unique,

  customer_id uuid not null references auth.users(id) on delete restrict,

  status text not null default 'created'
    check (status in (
      'created',
      'paid',
      'finalized',
      'failed',
      'cancelled'
    )),

  payment_status text not null default 'pending'
    check (payment_status in (
      'pending',
      'paid',
      'failed'
    )),

  amount integer not null check (amount >= 100),
  currency text not null default 'INR',

  name text not null,
  phone text not null,
  email text not null,
  address text not null,
  city text not null,
  state text not null,
  pin text not null,

  payment_method text not null default 'Razorpay',

  items jsonb not null,
  total integer not null,

  custom_cover_id uuid null,
  custom_cover_snapshot jsonb null,

  delivery text not null default '3-5 Working Days',

  razorpay_payment_id text null,

  paid_at timestamptz null,
  finalized_at timestamptz null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint payment_intents_currency_check
    check (currency = 'INR'),

  constraint payment_intents_payment_method_check
    check (payment_method = 'Razorpay')
);

create index if not exists payment_intents_customer_id_idx
  on public.payment_intents(customer_id);

create index if not exists payment_intents_status_idx
  on public.payment_intents(status);

create index if not exists payment_intents_razorpay_payment_id_idx
  on public.payment_intents(razorpay_payment_id);

alter table public.payment_intents enable row level security;

revoke all on public.payment_intents from public, anon, authenticated;
grant all on public.payment_intents to service_role;

create or replace function public.set_payment_intents_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists payment_intents_updated_at
  on public.payment_intents;

create trigger payment_intents_updated_at
before update on public.payment_intents
for each row
execute function public.set_payment_intents_updated_at();
