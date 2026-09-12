/*
 * MineNote — Order Shipping Snapshot
 *
 * Captures product shipping specifications at the exact moment
 * an order is created.
 *
 * Product shipping data remains the source of defaults.
 * The order keeps an immutable snapshot so future product edits
 * cannot change historical shipping inputs.
 *
 * Parcel dimensions are NOT multiplied or guessed here.
 * Final parcel/package dimensions will be resolved when the
 * shipment is created.
 */

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_snapshot jsonb;


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
    SELECT 1
    FROM auth.users
    WHERE id = p_customer_id
  ) THEN
    RAISE EXCEPTION 'Invalid customer.';
  END IF;

  IF p_payment_method NOT IN ('COD', 'Razorpay') THEN
    RAISE EXCEPTION 'Invalid payment method.';
  END IF;

  IF jsonb_typeof(p_items) <> 'array'
     OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order items are required.';
  END IF;

  /*
   * Aggregate quantities by product ID before checking
   * or deducting stock.
   *
   * Product rows are locked with FOR UPDATE.
   *
   * The same locked product rows are also used to create
   * the shipping snapshot, preventing the snapshot from
   * being based on stale product data.
   */
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

    /*
     * Capture shipping information from the locked product row.
     *
     * NULL values are intentionally preserved. We do not invent
     * physical dimensions or weight. Shipment creation will
     * validate that required shipping data exists before calling
     * the courier provider.
     */
    SELECT
      v_shipping_items || jsonb_build_array(
        jsonb_build_object(
          'product_id', p.id,
          'name', p.name,
          'quantity', v_quantity,
          'shipping_weight_grams', p.shipping_weight_grams,
          'package_length_cm', p.package_length_cm,
          'package_width_cm', p.package_width_cm,
          'package_height_cm', p.package_height_cm
        )
      )
      INTO v_shipping_items
    FROM public.products p
    WHERE p.id = v_product_id;

    /*
     * Total shipping weight is additive across purchased units.
     * Missing product weight is not guessed.
     */
    SELECT
      v_total_weight_grams +
      COALESCE(
        p.shipping_weight_grams * v_quantity,
        0
      )
      INTO v_total_weight_grams
    FROM public.products p
    WHERE p.id = v_product_id;
  END LOOP;


  /*
   * Deduct aggregated quantities while product rows remain locked.
   */
  FOR v_item IN
    SELECT jsonb_build_object(
      'id', value->>'id',
      'quantity', sum((value->>'quantity')::integer)
    )
    FROM jsonb_array_elements(p_items)
    GROUP BY value->>'id'
    ORDER BY value->>'id'
  LOOP
    v_product_id := (v_item->>'id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;

    UPDATE public.products
       SET stock = stock - v_quantity,
           updated_at = now()
     WHERE id = v_product_id;
  END LOOP;


  /*
   * Store order-time shipping inputs separately from commerce items.
   *
   * total_weight_grams is calculated only from known weights.
   * Parcel dimensions remain unresolved until shipment creation.
   */
  INSERT INTO public.orders (
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
    paid_at,
    shipping_snapshot
  )
  VALUES (
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
    p_paid_at,
    jsonb_build_object(
      'version', 1,
      'captured_at', now(),
      'total_weight_grams', v_total_weight_grams,
      'items', v_shipping_items,
      'package', jsonb_build_object(
        'length_cm', NULL,
        'width_cm', NULL,
        'height_cm', NULL,
        'source', 'resolved_at_shipment_creation'
      )
    )
  )
  RETURNING * INTO v_order;

  RETURN v_order;
END;
$$;


/*
 * Keep the RPC restricted to the server-side service role.
 */
REVOKE ALL ON FUNCTION public.create_order_with_inventory(
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
) FROM public;

REVOKE ALL ON FUNCTION public.create_order_with_inventory(
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
) FROM anon;

REVOKE ALL ON FUNCTION public.create_order_with_inventory(
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
) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.create_order_with_inventory(
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
) TO service_role;