/*
  MineNote Custom Cover — Order linkage

  Keeps the existing, tested inventory RPC untouched.

  Flow:
    1. Validate approved customization.
    2. Create normal order + inventory atomically through
       create_order_with_inventory().
    3. Attach custom_cover_id + immutable snapshot.
    4. Move customization to admin_review.

  The whole wrapper runs inside the same PostgreSQL
  transaction.
*/

create or replace function public.create_order_with_custom_cover(
  p_customer_id uuid,
  p_order_id text,
  p_name text,
  p_phone text,
  p_email text,
  p_address text,
  p_city text,
  p_state text,
  p_pin text,
  p_payment_method text,
  p_payment_status text,
  p_order_status text,
  p_items jsonb,
  p_total integer,
  p_razorpay_order_id text,
  p_razorpay_payment_id text,
  p_delivery text,
  p_paid_at timestamptz,
  p_custom_cover_id uuid,
  p_custom_cover_snapshot jsonb
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customization public.custom_cover_customizations%rowtype;
  v_order public.orders;
begin
  if p_custom_cover_id is null then
    raise exception 'Custom cover ID is required.';
  end if;

  select *
    into v_customization
  from public.custom_cover_customizations
  where id = p_custom_cover_id
  for update;

  if not found then
    raise exception 'Custom cover not found.';
  end if;

  if v_customization.customer_id is distinct from p_customer_id then
    raise exception 'Custom cover does not belong to this customer.';
  end if;

  if v_customization.status <> 'customer_approved' then
    raise exception 'Custom cover is not approved for ordering.';
  end if;

  /*
   * Current first-version commerce model supports one custom
   * cover per order because orders.custom_cover_id is singular.
   *
   * The application also enforces this before reaching here.
   */

  select *
    into v_order
  from public.create_order_with_inventory(
    p_customer_id,
    p_order_id,
    p_name,
    p_phone,
    p_email,
    p_address,
    p_city,
    p_state,
    p_pin,
    p_payment_method,
    p_payment_status,
    p_order_status,
    p_items,
    p_total,
    p_razorpay_order_id,
    p_razorpay_payment_id,
    p_delivery,
    p_paid_at
  );

  update public.orders
     set custom_cover_id = p_custom_cover_id,
         custom_cover_snapshot = p_custom_cover_snapshot
   where id = v_order.id
   returning * into v_order;

  update public.custom_cover_customizations
     set status = 'admin_review',
         updated_at = now()
   where id = p_custom_cover_id
     and status = 'customer_approved';

  if not found then
    raise exception 'Unable to move custom cover to admin review.';
  end if;

  return v_order;
end;
$$;

revoke all
  on function public.create_order_with_custom_cover(
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
    timestamptz,
    uuid,
    jsonb
  )
from public;

revoke all
  on function public.create_order_with_custom_cover(
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
    timestamptz,
    uuid,
    jsonb
  )
from anon;

revoke all
  on function public.create_order_with_custom_cover(
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
    timestamptz,
    uuid,
    jsonb
  )
from authenticated;

grant execute
  on function public.create_order_with_custom_cover(
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
    timestamptz,
    uuid,
    jsonb
  )
to service_role;
