export const APP_NAME = "MineNote";
export const COMPANY_NAME = "AuraCraft";

export const CURRENCY = "INR";
export const CURRENCY_SYMBOL = "₹";

export const DELIVERY_ESTIMATE = "3-5 Working Days";

export const PAYMENT_METHODS = {
  RAZORPAY: "Razorpay",
  COD: "COD",
} as const;

export type PaymentMethod =
  (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export const PAYMENT_STATUSES = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export const ORDER_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export type OrderStatus =
  (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];

export const REFUND_STATUSES = {
  PENDING: "pending",
  PARTIAL: "partial",
  PROCESSED: "processed",
  FAILED: "failed",
} as const;

export type RefundStatus =
  (typeof REFUND_STATUSES)[keyof typeof REFUND_STATUSES];

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
