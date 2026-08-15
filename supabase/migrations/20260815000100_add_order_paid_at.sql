ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;
