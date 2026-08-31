import {
  ORDER_STATUSES,
  type OrderStatus,
} from "@/app/constants";

const ORDER_STATUS_VALUES = Object.values(
  ORDER_STATUSES
) as string[];

export function isOrderStatus(
  value: unknown
): value is OrderStatus {
  return (
    typeof value === "string" &&
    ORDER_STATUS_VALUES.includes(value)
  );
}

export function isTerminalOrderStatus(
  status: OrderStatus
) {
  return (
    status === ORDER_STATUSES.DELIVERED ||
    status === ORDER_STATUSES.CANCELLED
  );
}

export function shouldSetShippedAt(
  status: OrderStatus
) {
  return status === ORDER_STATUSES.SHIPPED ||
    status === ORDER_STATUSES.DELIVERED;
}

export function shouldSetDeliveredAt(
  status: OrderStatus
) {
  return status === ORDER_STATUSES.DELIVERED;
}
