import type { ID } from "@/app/types";

export interface RazorpayOrderInput {
  orderId: ID;
  customerId: ID;
  amount: number;
  receipt?: string;
}

export interface RazorpayOrderResult {
  id: string;
  amount: number;
  currency: string;
  status?: string;
}

export interface RazorpayPaymentResult {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
}

export interface VerifyPaymentInput {
  orderId: ID;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
}
