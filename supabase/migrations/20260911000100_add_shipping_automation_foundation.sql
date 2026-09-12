-- Shipping automation foundation
-- No fake package weight/dimensions are assigned here.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS shipping_weight_grams integer,
  ADD COLUMN IF NOT EXISTS package_length_cm numeric,
  ADD COLUMN IF NOT EXISTS package_width_cm numeric,
  ADD COLUMN IF NOT EXISTS package_height_cm numeric;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_shipping_weight_grams_check'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_shipping_weight_grams_check
      CHECK (
        shipping_weight_grams IS NULL
        OR shipping_weight_grams > 0
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_package_length_cm_check'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_package_length_cm_check
      CHECK (
        package_length_cm IS NULL
        OR package_length_cm > 0
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_package_width_cm_check'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_package_width_cm_check
      CHECK (
        package_width_cm IS NULL
        OR package_width_cm > 0
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_package_height_cm_check'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_package_height_cm_check
      CHECK (
        package_height_cm IS NULL
        OR package_height_cm > 0
      );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id uuid NOT NULL
    REFERENCES public.orders(id)
    ON DELETE CASCADE,

  provider text NOT NULL DEFAULT 'shipmozo',
  status text NOT NULL DEFAULT 'pending',

  shipment_id text,
  courier_name text,
  courier_id text,
  awb text,

  tracking_url text,
  label_url text,

  shipping_charge integer,

  weight_grams integer,
  length_cm numeric,
  width_cm numeric,
  height_cm numeric,

  serviceable boolean,

  provider_status text,
  provider_response jsonb,

  error_code text,
  error_message text,
  retry_count integer NOT NULL DEFAULT 0,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  shipped_at timestamptz,
  delivered_at timestamptz,

  CONSTRAINT shipments_status_check
  CHECK (
    status IN (
      'pending',
      'checking_serviceability',
      'serviceable',
      'creating',
      'created',
      'ready_for_pickup',
      'picked_up',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'failed',
      'cancelled'
    )
  ),

  CONSTRAINT shipments_retry_count_check
  CHECK (retry_count >= 0),

  CONSTRAINT shipments_weight_check
  CHECK (weight_grams IS NULL OR weight_grams > 0),

  CONSTRAINT shipments_length_check
  CHECK (length_cm IS NULL OR length_cm > 0),

  CONSTRAINT shipments_width_check
  CHECK (width_cm IS NULL OR width_cm > 0),

  CONSTRAINT shipments_height_check
  CHECK (height_cm IS NULL OR height_cm > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS shipments_order_id_unique_idx
  ON public.shipments(order_id);

CREATE UNIQUE INDEX IF NOT EXISTS shipments_provider_shipment_id_unique_idx
  ON public.shipments(provider, shipment_id)
  WHERE shipment_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS shipments_awb_unique_idx
  ON public.shipments(provider, awb)
  WHERE awb IS NOT NULL;

CREATE INDEX IF NOT EXISTS shipments_status_idx
  ON public.shipments(status);

CREATE INDEX IF NOT EXISTS shipments_order_id_idx
  ON public.shipments(order_id);

CREATE INDEX IF NOT EXISTS shipments_awb_idx
  ON public.shipments(awb);

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Customers may only read the shipment belonging to their own order.
CREATE POLICY "Customers can view their own shipments"
ON public.shipments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.orders
    WHERE public.orders.id = public.shipments.order_id
      AND public.orders.customer_id = auth.uid()
  )
);

-- Admins may view all shipments.
CREATE POLICY "Admins can view shipments"
ON public.shipments
FOR SELECT
TO authenticated
USING (
  public.is_admin()
);

-- Admins may create shipments.
CREATE POLICY "Admins can create shipments"
ON public.shipments
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin()
);

-- Admins may update shipments.
CREATE POLICY "Admins can update shipments"
ON public.shipments
FOR UPDATE
TO authenticated
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);

-- Admins may delete shipments if an operational cleanup is ever required.
CREATE POLICY "Admins can delete shipments"
ON public.shipments
FOR DELETE
TO authenticated
USING (
  public.is_admin()
);

GRANT SELECT ON TABLE public.shipments TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.shipments TO authenticated;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipment_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_shipment_id_fkey'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_shipment_id_fkey
      FOREIGN KEY (shipment_id)
      REFERENCES public.shipments(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS orders_shipment_id_idx
  ON public.orders(shipment_id);
