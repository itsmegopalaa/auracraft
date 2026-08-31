import {
  ORDER_STATUSES,
  type OrderStatus,
} from "@/app/constants";

const CURRENT_ORDER_STATUSES = {
  PLACED: "placed",
  CONFIRMED: ORDER_STATUSES.CONFIRMED,
  PROCESSING: ORDER_STATUSES.PROCESSING,
  SHIPPED: ORDER_STATUSES.SHIPPED,
  DELIVERED: ORDER_STATUSES.DELIVERED,
  CANCELLED: ORDER_STATUSES.CANCELLED,
} as const;

export function isValidOrderStatus(
  value: unknown
): value is OrderStatus | "placed" {
  return (
    typeof value === "string" &&
    Object.values(CURRENT_ORDER_STATUSES).includes(
      value as (typeof CURRENT_ORDER_STATUSES)[keyof typeof CURRENT_ORDER_STATUSES]
    )
  );
}

export function canTransitionOrderStatus(
  currentStatus: string,
  nextStatus: OrderStatus | "placed"
): boolean {
  if (currentStatus === nextStatus) {
    return true;
  }

  const transitions: Record<
    string,
    readonly string[]
  > = {
    [CURRENT_ORDER_STATUSES.PLACED]: [
      CURRENT_ORDER_STATUSES.CONFIRMED,
      CURRENT_ORDER_STATUSES.CANCELLED,
    ],

    [CURRENT_ORDER_STATUSES.CONFIRMED]: [
      CURRENT_ORDER_STATUSES.PROCESSING,
      CURRENT_ORDER_STATUSES.CANCELLED,
    ],

    [CURRENT_ORDER_STATUSES.PROCESSING]: [
      CURRENT_ORDER_STATUSES.SHIPPED,
      CURRENT_ORDER_STATUSES.CANCELLED,
    ],

    [CURRENT_ORDER_STATUSES.SHIPPED]: [
      CURRENT_ORDER_STATUSES.DELIVERED,
    ],

    [CURRENT_ORDER_STATUSES.DELIVERED]: [],
    [CURRENT_ORDER_STATUSES.CANCELLED]: [],
  };

  return (
    transitions[currentStatus]?.includes(
      nextStatus
    ) ?? false
  );
}

export function shouldSetShippedAt(
  status: string
): boolean {
  return (
    status === "shipped" ||
    status === "delivered"
  );
}

export function shouldSetDeliveredAt(
  status: string
): boolean {
  return status === "delivered";
}

export function getOrderEmailSubject(
  status: string,
  orderId: string
): string {
  switch (status) {
    case "confirmed":
      return `Your MineNote order is confirmed ✅`;

    case "processing":
      return `Your MineNote order is being prepared ⚙️`;

    case "shipped":
      return `Your MineNote order has shipped 📦`;

    case "delivered":
      return `Your MineNote order has been delivered 🎉`;

    case "cancelled":
      return `Your MineNote order has been cancelled`;

    default:
      return `MineNote Order Update — ${orderId}`;
  }
}
