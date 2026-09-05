import { createClient } from "@/utils/supabase/server";

export type OrderItemInput = {
  id: string;
  quantity: number;
  customCoverId?: string | null;
};

export async function calculateOrder(items: unknown) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cart is empty.");
  }

  const normalizedInput: OrderItemInput[] = [];

  for (const rawItem of items) {
    if (!rawItem || typeof rawItem !== "object") {
      throw new Error("Invalid cart item.");
    }

    const item = rawItem as Record<string, unknown>;

    const id = String(item.id ?? "").trim();
    const quantity = Number(item.quantity);

    if (
      !id ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 50
    ) {
      throw new Error("Invalid product quantity.");
    }

    const existing = normalizedInput.find(
      (existingItem) => existingItem.id === id
    );

    const customCoverId =
      typeof item.customCoverId === "string" &&
      item.customCoverId.trim()
        ? item.customCoverId.trim()
        : null;

    if (existing) {
      /*
       * Product quantities are aggregated for inventory.
       *
       * Custom-cover identity is validated separately by the
       * checkout/order APIs because the existing inventory RPC
       * operates on real product UUIDs.
       */
      existing.quantity += quantity;
    } else {
      normalizedInput.push({
        id,
        quantity,
        customCoverId,
      });
    }
  }

  const productIds = normalizedInput.map((item) => item.id);

  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, image, stock, active")
    .in("id", productIds)
    .eq("active", true);

  if (error) {
    console.error("ORDER PRICING PRODUCT LOOKUP ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      productIds,
    });

    throw new Error(
      `Unable to validate products: ${error.message}`
    );
  }

  if (!products || products.length !== productIds.length) {
    throw new Error("One or more products are invalid or unavailable.");
  }

  const normalizedItems: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }> = [];

  for (const inputItem of normalizedInput) {
    const product = products.find(
      (item) => item.id === inputItem.id
    );

    if (!product) {
      throw new Error("Invalid product.");
    }

    if (inputItem.quantity > product.stock) {
      throw new Error(
        `Only ${product.stock} unit(s) of "${product.name}" are available.`
      );
    }

    normalizedItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: inputItem.quantity,
      image: product.image ?? "/images/notebooks/placeholder.png",
    });
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
