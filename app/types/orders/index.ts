import type {
  OrderStatus,
  PaymentMethod,
} from "@/app/constants";

import type {
  ID,
  OrderItem,
  Address,
} from "@/app/types";

export interface CreateOrderInput {
  orderId: ID;
  customerId: ID;
  name: string;
  phone: string;
  email: string;
  address: Address;
  paymentMethod: PaymentMethod | string;
  paymentStatus: string;
  orderStatus: OrderStatus | string;
  items: OrderItem[];
  total: number;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
}

export interface OrderStatusUpdateInput {
  orderId: ID;
  status: OrderStatus;
}

export interface OrderFulfillmentInput {
  orderId: ID;
  shippingPartner?: string | null;
  trackingId?: string | null;
  trackingUrl?: string | null;
}

export interface OrderLookupInput {
  orderId: ID;
  customerId?: ID;
}
