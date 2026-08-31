/*
 * Harden order creation RPC execution privileges.
 *
 * Keep the existing function signature and defaults unchanged.
 */

revoke execute
on function public.create_order_with_inventory(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb,
  integer,
  text,
  text,
  text,
  timestamptz
)
from public;

revoke execute
on function public.create_order_with_inventory(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb,
  integer,
  text,
  text,
  text,
  timestamptz
)
from anon;

revoke execute
on function public.create_order_with_inventory(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb,
  integer,
  text,
  text,
  text,
  timestamptz
)
from authenticated;

grant execute
on function public.create_order_with_inventory(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb,
  integer,
  text,
  text,
  text,
  timestamptz
)
to service_role;
