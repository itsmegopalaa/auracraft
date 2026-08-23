alter table public.products
  add column if not exists rating numeric(2,1),
  add column if not exists bestseller boolean not null default false,
  add column if not exists featured boolean not null default false,
  add column if not exists new_arrival boolean not null default false,
  add column if not exists pages integer,
  add column if not exists paper text,
  add column if not exists size text;

alter table public.products
  drop constraint if exists products_rating_check;

alter table public.products
  add constraint products_rating_check
  check (rating is null or (rating >= 0 and rating <= 5));

alter table public.products
  drop constraint if exists products_pages_check;

alter table public.products
  add constraint products_pages_check
  check (pages is null or pages > 0);

update public.products
set
  rating = case name
    when '🌸 Sakura Anime' then 4.9
    when '☠️ Shadow Swordsman' then 4.8
    when '🌌 Galaxy Hero' then 5.0
    when '🏔️ Mountain' then 4.7
    else rating
  end,
  bestseller = case name
    when '🌸 Sakura Anime' then true
    when '🌌 Galaxy Hero' then true
    else false
  end,
  featured = case name
    when '🌸 Sakura Anime' then true
    when '☠️ Shadow Swordsman' then true
    when '🌌 Galaxy Hero' then true
    else false
  end,
  new_arrival = case name
    when '🌸 Sakura Anime' then true
    when '☠️ Shadow Swordsman' then true
    else false
  end,
  pages = 200,
  paper = 'Premium 80 GSM',
  size = 'A4';
