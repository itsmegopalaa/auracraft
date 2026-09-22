/*
 * MineNote — Product page pricing
 *
 * Canonical catalog pricing by notebook page count.
 * Existing products.price remains as the legacy/default price.
 */

create table if not exists public.product_page_prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  pages integer not null check (pages in (100, 150, 200)),
  price integer not null check (price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint product_page_prices_product_pages_unique
    unique (product_id, pages)
);

create index if not exists product_page_prices_product_id_idx
  on public.product_page_prices(product_id);

alter table public.product_page_prices enable row level security;

drop policy if exists "Active product page prices are publicly readable"
  on public.product_page_prices;

create policy "Active product page prices are publicly readable"
  on public.product_page_prices
  for select
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_page_prices.product_id
        and p.active = true
    )
  );

insert into public.product_page_prices (product_id, pages, price)
select
  p.id,
  page.pages,
  page.price
from public.products p
cross join (
  values
    (100, 849),
    (150, 1049),
    (200, 1249)
) as page(pages, price)
where p.active = true
on conflict (product_id, pages)
do update set
  price = excluded.price,
  updated_at = now();
