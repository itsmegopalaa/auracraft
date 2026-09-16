/*
 * MineNote — Razorpay-only payments
 *
 * COD is no longer offered by the customer checkout.
 * Existing historical COD orders remain valid.
 *
 * New orders may only be created with Razorpay.
 */

CREATE OR REPLACE FUNCTION public.create_order_with_inventory(
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
  p_razorpay_order_id text default null,
  p_razorpay_payment_id text default null,
  p_delivery text default '3-5 Working Days',
  p_paid_at timestamptz default null
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders;
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_stock integer;
  v_shipping_items jsonb := '[]'::jsonb;
  v_total_weight_grams integer := 0;
BEGIN
  IF p_customer_id IS NULL THEN
    RAISE EXCEPTION 'Customer is required.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = p_customer_id
  ) THEN
    RAISE EXCEPTION 'Invalid customer.';
  END IF;

  IF p_payment_method <> 'Razorpay' THEN
    RAISE EXCEPTION 'Only online Razorpay payment is supported.';
  END IF;

  IF p_payment_status <> 'paid' THEN
    RAISE EXCEPTION 'Razorpay orders must be paid.';
  END IF;

  IF p_razorpay_order_id IS NULL
     OR p_razorpay_payment_id IS NULL
     OR p_paid_at IS NULL THEN
    RAISE EXCEPTION 'Verified Razorpay payment is required.';
  END IF;

  IF jsonb_typeof(p_items) <> 'array'
     OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order items are required.';
  END IF;

  FOR v_item IN
    SELECT jsonb_build_object(
      'id', value->>'id',
      'quantity', sum((value->>'quantity')::integer)
    )
    FROM jsonb_array_elements(p_items)
    GROUP BY value->>'id'
    ORDER BY value->>'id'
  LOOP
    BEGIN
      v_product_id := (v_item->>'id')::uuid;
      v_quantity := (v_item->>'quantity')::integer;
    EXCEPTION
      WHEN invalid_text_representation THEN
        RAISE EXCEPTION 'Invalid product ID.';
    END;

    IF v_quantity IS NULL OR v_quantity < 1 THEN
      RAISE EXCEPTION 'Invalid product quantity.';
    END IF;

    SELECT stock
      INTO v_stock
      FROM public.products
     WHERE id = v_product_id
       AND active = true
     FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'One or more products are invalid or unavailable.';
    END IF;

    IF v_quantity > v_stock THEN
      RAISE EXCEPTION 'Insufficient stock for product %.', v_product_id;
    END IF;

    UPDATE public.products
       SET stock = stock - v_quantity
     WHERE id = v_product_id;

    v_shipping_items :=
      v_shipping_items || jsonb_build_array(
        jsonb_build_object(
          'product_id', v_product_id,
          'quantity', v_quantity
        )
      );
  END LOOP;

  v_order := NULL;

  INSERT INTO public.orders (
    order_id,
    customer_id,
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
    paid_at,
    shipping_snapshot
  )
  VALUES (
    p_order_id,
    p_customer_id,
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
    p_paid_at,
    jsonb_build_object(
      'version', 1,
      'items', v_shipping_items,
      'total_weight_grams', v_total_weight_grams
    )
  )
  RETURNING * INTO v_order;

  RETURN v_order;
END;
$$;

REVOKE ALL ON FUNCTION public.create_order_with_inventory(
  uuid,text,text,text,text,text,text,text,text,text,text,text,jsonb,integer,text,text,text,timestamptz
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_order_with_inventory(
  uuid,text,text,text,text,text,text,text,text,text,text,text,jsonb,integer,text,text,text,timestamptz
) TO service_role;
