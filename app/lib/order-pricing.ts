import { createClient } from "@/utils/supabase/server";
import { getCustomCoverFee } from "@/app/lib/custom-cover-pricing";

const ALLOWED_PAGES = [100, 150, 200] as const;
type AllowedPages = (typeof ALLOWED_PAGES)[number];

 export type OrderItemInput = {
  id: string;
  quantity: number;
  pages?: AllowedPages;
  customCoverId?: string | null;
};

type NormalizedOrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  pages: AllowedPages;
  customCoverId?: string | null;
};

function isAllowedPages(value: unknown): value is AllowedPages {
  return (
    value === 100 ||
    value === 150 ||
    value === 200
  );
}


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

    const pages = isAllowedPages(item.pages)
      ? item.pages
      : undefined;

    const customCoverId =
      typeof item.customCoverId === "string" &&
      item.customCoverId.trim()
        ? item.customCoverId.trim()
        : null;

    /*
     * Keep different page variants and different custom covers
     * as separate commercial lines. Inventory is still aggregated
     * safely by the database RPC later.
     */
    const existing = normalizedInput.find(
      (existingItem) =>
        existingItem.id === id &&
        existingItem.pages === pages &&
        existingItem.customCoverId === customCoverId
    );

    if (existing) {
      existing.quantity += quantity;

      if (existing.quantity > 50) {
        throw new Error("Maximum quantity per product is 50.");
      }
    } else {
      normalizedInput.push({
        id,
        quantity,
        pages,
        customCoverId,
      });
    }
  }

  const productIds = Array.from(
    new Set(normalizedInput.map((item) => item.id))
  );

  const customCoverIds = Array.from(
    new Set(
      normalizedInput
        .map((item) => item.customCoverId)
        .filter((id): id is string => Boolean(id))
    )
  );

  if (customCoverIds.length > 1) {
    throw new Error(
      "Only one custom cover can be attached to an order."
    );
  }

  const customCoverId = customCoverIds[0] ?? null;

  const supabase = await createClient();

  const { data: products, error: productsError } =
    await supabase
      .from("products")
      .select("id, name, price, image, stock, active")
      .in("id", productIds)
      .eq("active", true);

  if (productsError) {
    console.error("ORDER PRICING PRODUCT LOOKUP ERROR:", {
      message: productsError.message,
      details: productsError.details,
      hint: productsError.hint,
      code: productsError.code,
      productIds,
    });

    throw new Error(
      `Unable to validate products: ${productsError.message}`
    );
  }

  if (
    !products ||
    products.length !== productIds.length
  ) {
    throw new Error(
      "One or more products are invalid or unavailable."
    );
  }

  const { data: pagePrices, error: pagePricesError } =
    await supabase
      .from("product_page_prices")
      .select("product_id, pages, price")
      .in("product_id", productIds)
      .in("pages", ALLOWED_PAGES);

  if (pagePricesError) {
    console.error(
      "ORDER PRICING PAGE PRICE LOOKUP ERROR:",
      pagePricesError
    );
    throw new Error(
      `Unable to validate notebook pricing: ${pagePricesError.message}`
    );
  }

  const customCoverQuantity = customCoverId
    ? normalizedInput
        .filter(
          (item) => item.customCoverId === customCoverId
        )
        .reduce(
          (sum, item) => sum + item.quantity,
          0
        )
    : 0;

  let customCoverPages: AllowedPages | null = null;

  if (customCoverId) {
    const { data: customization, error: customizationError } =
      await supabase
        .from("custom_cover_customizations")
        .select("id, product_id, status, physical_config")
        .eq("id", customCoverId)
        .eq("status", "customer_approved")
        .single();

    if (
      customizationError ||
      !customization
    ) {
      throw new Error(
        "Custom cover is not approved for ordering."
      );
    }

    if (
      !customization.product_id ||
      !productIds.includes(String(customization.product_id))
    ) {
      throw new Error(
        "Custom cover product does not match the order."
      );
    }

    const physicalConfig =
      customization.physical_config &&
      typeof customization.physical_config === "object"
        ? (customization.physical_config as Record<
            string,
            unknown
          >)
        : null;

    if (
      !physicalConfig ||
      !isAllowedPages(physicalConfig.pages)
    ) {
      throw new Error(
        "Custom cover notebook page configuration is invalid."
      );
    }

    customCoverPages = physicalConfig.pages;
  }

  const normalizedItems: NormalizedOrderItem[] = [];

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

    const resolvedPages =
      inputItem.customCoverId === customCoverId
        ? customCoverPages
        : inputItem.pages;

    if (!resolvedPages) {
      throw new Error(
        `"${product.name}" is missing a valid notebook page selection.`
      );
    }

    const pagePrice = pagePrices?.find(
      (item) =>
        item.product_id === product.id &&
        Number(item.pages) === resolvedPages
    );

    if (
      !pagePrice ||
      !Number.isFinite(Number(pagePrice.price)) ||
      Number(pagePrice.price) < 0
    ) {
      throw new Error(
        `Pricing for "${product.name}" (${resolvedPages} pages) is unavailable.`
      );
    }

    normalizedItems.push({
      id: product.id,
      name: product.name,
      price: Number(pagePrice.price),
      quantity: inputItem.quantity,
      image:
        product.image ??
        "/images/notebooks/placeholder.png",
      pages: resolvedPages,
      customCoverId:
        inputItem.customCoverId ?? null,
    });
  }

  const productSubtotal = normalizedItems.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  const customCoverFee = customCoverId
    ? getCustomCoverFee(customCoverQuantity)
    : 0;

  const total = productSubtotal + customCoverFee;

  if (
    !Number.isFinite(productSubtotal) ||
    !Number.isFinite(customCoverFee) ||
    !Number.isFinite(total) ||
    total <= 0
  ) {
    throw new Error("Invalid order total.");
  }

  return {
    items: normalizedItems,
    subtotal: productSubtotal,
    customCoverFee,
    total,
  };
}
