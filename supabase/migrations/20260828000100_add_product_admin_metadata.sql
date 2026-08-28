alter table public.products
  add column if not exists theme text,
  add column if not exists badge text,
  add column if not exists featured boolean not null default false;

alter table public.products
  add constraint products_badge_check
  check (
    badge is null
    or badge in ('best_seller', 'new', 'limited', 'featured')
  );

create index if not exists products_featured_idx
  on public.products (featured)
  where featured = true;
