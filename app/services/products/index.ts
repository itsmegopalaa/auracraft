import type { Product } from "@/app/types";

export function isProductInStock(
  product: Product,
  quantity: number
): boolean {
  return (
    product.is_active !== false &&
    Number.isInteger(quantity) &&
    quantity > 0 &&
    product.stock >= quantity
  );
}

export function calculateProductSubtotal(
  price: number,
  quantity: number
): number {
  return Number(price) * Number(quantity);
}

export function calculateProductsTotal(
  items: Array<{
    price: number;
    quantity: number;
  }>
): number {
  return items.reduce(
    (total, item) =>
      total +
      calculateProductSubtotal(
        item.price,
        item.quantity
      ),
    0
  );
}
