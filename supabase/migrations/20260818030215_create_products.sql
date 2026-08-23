create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price integer not null check (price >= 0),
  description text,
  category text,
  image text,
  stock integer not null default 0 check (stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Anyone can view active products"
on public.products
for select
to anon, authenticated
using (active = true);

create index if not exists products_active_idx
on public.products (active);

create index if not exists products_category_idx
on public.products (category);
