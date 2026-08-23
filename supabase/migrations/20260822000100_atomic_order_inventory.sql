create or replace function public.create_order_with_inventory(
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
  p_razorpay_order_id text default null,
  p_razorpay_payment_id text default null,
  p_delivery text default '3-5 Working Days',
  p_paid_at timestamptz default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_order public.orders;
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_stock integer;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'You must be signed in to place an order.';
  end if;

  if p_payment_method not in ('COD', 'Razorpay') then
    raise exception 'Invalid payment method.';
  end if;

  if jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'Order items are required.';
  end if;

  /*
   * Lock every product row before changing inventory.
   * This prevents two simultaneous checkouts from consuming
   * the same stock.
   */
  for v_item in
    select value
    from jsonb_array_elements(p_items)
    order by value->>'id'
  loop
    v_product_id := (v_item->>'id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;

    if v_quantity is null or v_quantity < 1 then
      raise exception 'Invalid product quantity.';
    end if;

    select stock
      into v_stock
      from public.products
     where id = v_product_id
       and active = true
     for update;

    if not found then
      raise exception 'One or more products are invalid or unavailable.';
    end if;

    if v_quantity > v_stock then
      raise exception 'Insufficient stock for product %.', v_product_id;
    end if;
  end loop;

  /*
   * Deduct inventory while the product rows are locked.
   */
  for v_item in
    select value
    from jsonb_array_elements(p_items)
    order by value->>'id'
  loop
    v_product_id := (v_item->>'id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;

    update public.products
       set stock = stock - v_quantity,
           updated_at = now()
     where id = v_product_id;
  end loop;

  /*
   * Insert the order in the SAME transaction.
   * If this insert fails, PostgreSQL rolls back the stock deduction too.
   */
  insert into public.orders (
    customer_id,
    order_id,
    name,
    phone,
    email,
    address,
    city,
    state,
    pin,
    payment_method,
    payment_status,
    order_status,
    items,
    total,
    razorpay_order_id,
    razorpay_payment_id,
    delivery,
    paid_at
  )
  values (
    v_user_id,
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
  )
  returning * into v_order;

  return v_order;
end;
$$;

revoke all on function public.create_order_with_inventory(
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
) from public;

grant execute on function public.create_order_with_inventory(
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
) to authenticated;
