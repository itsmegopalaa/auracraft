import { createClient } from "@/utils/supabase/server";
import type { Order } from "@/app/types";

const TRACK_ORDER_SELECT = `
  order_id,
  name,
  email,
  payment_method,
  payment_status,
  paid_at,
  order_status,
  items,
  total,
  delivery,
  shipping_partner,
  tracking_id,
  tracking_url,
  shipped_at,
  delivered_at,
  created_at
`;

const ACCOUNT_ORDER_SELECT = `
  order_id,
  payment_method,
  payment_status,
  paid_at,
  order_status,
  items,
  total,
  delivery,
  shipping_partner,
  tracking_id,
  tracking_url,
  shipped_at,
  delivered_at,
  created_at
`;

export async function getOrderForTracking(
  orderId: string,
  email: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(TRACK_ORDER_SELECT)
    .eq("order_id", orderId)
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getCustomerOrders(
  customerId: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(ACCOUNT_ORDER_SELECT)
    .eq("customer_id", customerId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getOrderById(
  orderId: string
): Promise<Order | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Order | null;
}
