/*
 * MineNote — Disable COD for new orders
 *
 * Historical COD orders remain untouched.
 * New orders must use Razorpay.
 */

CREATE OR REPLACE FUNCTION public.reject_new_cod_orders()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.payment_method = 'COD' THEN
    RAISE EXCEPTION 'Cash on Delivery is no longer supported.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_reject_new_cod
ON public.orders;

CREATE TRIGGER orders_reject_new_cod
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.reject_new_cod_orders();

REVOKE ALL
ON FUNCTION public.reject_new_cod_orders()
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE
ON FUNCTION public.reject_new_cod_orders()
TO service_role;
