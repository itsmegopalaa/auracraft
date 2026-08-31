revoke all on table public.orders from anon;
revoke all on table public.orders from authenticated;

grant select on table public.orders to authenticated;
