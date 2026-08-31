import type { OrderItem } from "@/app/types";

export function calculateItemSubtotal(
  price: number,
  quantity: number
): number {
  return price * quantity;
}

export function calculateItemsTotal(
  items: Array<{
    price: number;
    quantity: number;
  }>
): number {
  return items.reduce(
    (total, item) =>
      total +
      calculateItemSubtotal(
        item.price,
        item.quantity
      ),
    0
  );
}

export function calculateOrderTotal(
  items: OrderItem[]
): number {
  return calculateItemsTotal(items);
}
