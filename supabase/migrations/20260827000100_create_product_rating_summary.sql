create or replace function public.get_product_rating_summary(
  p_product_id uuid
)
returns table (
  product_id uuid,
  catalog_rating numeric,
  review_count integer,
  average_review_rating numeric,
  effective_rating numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    p.id as product_id,
    p.rating as catalog_rating,
    count(r.id)::integer as review_count,
    round(avg(r.rating), 2) as average_review_rating,
    coalesce(round(avg(r.rating), 2), p.rating) as effective_rating
  from public.products p
  left join public.product_reviews r
    on r.product_id = p.id
  where p.id = p_product_id
  group by p.id, p.rating;
$$;

grant execute on function public.get_product_rating_summary(uuid)
to anon, authenticated;
