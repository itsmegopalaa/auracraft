import { notebooks } from "../data/notebooks";

export type OrderItemInput = {
  id: number;
  quantity: number;
};

export function calculateOrder(
  items: unknown
) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cart is empty.");
  }

  const normalizedItems: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }> = [];

  for (const rawItem of items) {
    if (!rawItem || typeof rawItem !== "object") {
      throw new Error("Invalid cart item.");
    }

    const item = rawItem as Record<string, unknown>;

    const id = Number(item.id);
    const quantity = Number(item.quantity);

    if (
      !Number.isInteger(id) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 50
    ) {
      throw new Error("Invalid product quantity.");
    }

    const product = notebooks.find(
      (notebook) => notebook.id === id
    );

    if (!product) {
      throw new Error("Invalid product.");
    }

    const existing = normalizedItems.find(
      (existingItem) => existingItem.id === id
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      normalizedItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image,
      });
    }
  }

  const total = normalizedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (!Number.isFinite(total) || total <= 0) {
    throw new Error("Invalid order total.");
  }

  return {
    items: normalizedItems,
    total,
  };
}
