/*
 * MineNote — Public canonical product pricing access
 *
 * RLS remains the source of row-level protection.
 * anon/authenticated users need table-level SELECT privilege
 * before the existing "active products only" RLS policy can apply.
 */

grant select on table public.product_page_prices to anon, authenticated;
