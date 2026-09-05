-- Customers may create original and preview assets only.
-- Production assets must be created by trusted server/admin processes.

drop policy if exists "Customers can insert own custom cover assets"
on public.custom_cover_assets;

create policy "Customers can insert own custom cover assets"
on public.custom_cover_assets
for insert
to authenticated
with check (
  kind in ('original', 'preview')
  and exists (
    select 1
    from public.custom_cover_customizations c
    where c.id = customization_id
      and c.customer_id = auth.uid()
      and c.status = 'draft'
  )
);
