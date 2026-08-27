create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),

  product_id uuid not null
    references public.products(id)
    on delete cascade,

  customer_id uuid not null
    references auth.users(id)
    on delete cascade,

  order_id text not null
    references public.orders(order_id)
    on delete cascade,

  rating integer not null
    check (rating >= 1 and rating <= 5),

  review_text text not null
    check (char_length(trim(review_text)) >= 3),

  verified_buyer boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint product_reviews_one_per_order_product
    unique (order_id, product_id)
);

create index if not exists product_reviews_product_id_idx
  on public.product_reviews(product_id);

create index if not exists product_reviews_customer_id_idx
  on public.product_reviews(customer_id);

alter table public.product_reviews enable row level security;

create policy "Anyone can view product reviews"
on public.product_reviews
for select
to anon, authenticated
using (true);

create policy "Customers can create their own verified reviews"
on public.product_reviews
for insert
to authenticated
with check (
  customer_id = auth.uid()
  and verified_buyer = true
);

create policy "Customers can update their own reviews"
on public.product_reviews
for update
to authenticated
using (customer_id = auth.uid())
with check (customer_id = auth.uid());

create policy "Customers can delete their own reviews"
on public.product_reviews
for delete
to authenticated
using (customer_id = auth.uid());

grant select on public.product_reviews to anon, authenticated;
grant insert, update, delete on public.product_reviews to authenticated;
