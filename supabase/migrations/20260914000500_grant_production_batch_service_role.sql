grant select, insert, update, delete
  on public.production_batches
  to service_role;

grant select, insert, update, delete
  on public.production_batch_shipments
  to service_role;

grant select, insert, update, delete
  on public.production_batch_orders
  to service_role;
