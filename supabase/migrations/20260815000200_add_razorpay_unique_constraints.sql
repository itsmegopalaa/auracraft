ALTER TABLE public.orders
  ADD CONSTRAINT orders_razorpay_order_id_key
  UNIQUE (razorpay_order_id);

ALTER TABLE public.orders
  ADD CONSTRAINT orders_razorpay_payment_id_key
  UNIQUE (razorpay_payment_id);
