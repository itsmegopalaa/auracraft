import type { OrderItem } from "@/app/types";

export function normalizeOrderId(
  orderId: unknown
): string {
  return String(orderId ?? "").trim();
}

export function normalizeCustomerId(
  customerId: unknown
): string {
  return String(customerId ?? "").trim();
}

export function normalizeOrderItems(
  items: OrderItem[]
): OrderItem[] {
  return items.map((item) => ({
    ...item,
    id: String(item.id).trim(),
    name: String(item.name).trim(),
    price: Number(item.price),
    quantity: Number(item.quantity),
  }));
}
