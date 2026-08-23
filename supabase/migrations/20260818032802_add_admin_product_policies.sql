create policy "Admins can view all products"
on public.products
for select
to authenticated
using (public.is_admin());

create policy "Admins can insert products"
on public.products
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update products"
on public.products
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
