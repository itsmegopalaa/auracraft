ALTER TABLE public.orders
ADD COLUMN customer_id uuid
REFERENCES auth.users(id)
ON DELETE SET NULL;

CREATE INDEX orders_customer_id_idx
ON public.orders(customer_id);
