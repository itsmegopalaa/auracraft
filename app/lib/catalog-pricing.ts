import { createClient } from "@/utils/supabase/server";

export const CATALOG_PAGE_PRICES = {
  100: 849,
  150: 1049,
  200: 1249,
} as const;

export type CatalogPageCount = keyof typeof CATALOG_PAGE_PRICES;

export async function getCatalogBasePrices(productIds: string[]) {
  const ids = [...new Set(productIds.map(String).filter(Boolean))];

  if (ids.length === 0) {
    return new Map<string, number>();
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_page_prices")
    .select("product_id, pages, price")
    .in("product_id", ids)
    .in("pages", [100, 150, 200]);

  if (error) {
    console.error("CATALOG PAGE PRICES LOAD FAILED:", error);
    return new Map<string, number>();
  }

  const prices = new Map<string, number>();

  for (const row of data ?? []) {
    const productId = String(row.product_id);
    const pages = Number(row.pages);
    const price = Number(row.price);

    if (
      pages === 100 &&
      Number.isFinite(price) &&
      price >= 0
    ) {
      prices.set(productId, price);
    }
  }

  return prices;
}
