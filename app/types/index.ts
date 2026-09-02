import type {
  OrderStatus,
  PaymentMethod,
  RefundStatus,
} from "@/app/constants";

export type ID = string;

export interface OrderItem {
  id: ID;
  name: string;
  price: number;
  quantity: number;
}

export interface Address {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pin: string;
}

export interface Order {
  order_id: ID;
  customer_id: ID;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pin: string;

  items: OrderItem[];
  total: number;

  payment_method: PaymentMethod | string;
  payment_status: string;
  order_status: OrderStatus | string;

  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;

  shipping_partner?: string | null;
  tracking_id?: string | null;
  tracking_url?: string | null;

  shipped_at?: string | null;
  delivered_at?: string | null;
  paid_at?: string | null;

  refund_status?: RefundStatus | string | null;
  refund_id?: string | null;
  refund_amount?: number | null;
  refund_processed_at?: string | null;

  delivery?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T = unknown> =
  | ApiSuccess<T>
  | ApiError;

export * from "./orders";
export * from "./products";
export * from "./payments";
export * from "./refunds";
export * from "./contact";
