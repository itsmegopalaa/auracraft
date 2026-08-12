create policy "Admins can view orders"
on public.orders
for select
to authenticated
using (
  public.is_admin()
);
