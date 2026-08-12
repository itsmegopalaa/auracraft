grant update on table public.orders to authenticated;

create policy "Admins can update orders"
on public.orders
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);
