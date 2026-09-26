export const ALLOWED_PAGES = [100, 150, 200] as const;
export type AllowedPages = (typeof ALLOWED_PAGES)[number];

export const ALLOWED_PAPERS = ["plain", "ruled", "dotGrid"] as const;
export type AllowedPaper = (typeof ALLOWED_PAPERS)[number];

export const ALLOWED_SIZES = ["A4", "A5"] as const;
export type AllowedSize = (typeof ALLOWED_SIZES)[number];

export const ALLOWED_ORIENTATIONS = ["portrait", "landscape"] as const;
export type AllowedOrientation = (typeof ALLOWED_ORIENTATIONS)[number];

export type PhysicalConfig = {
  pages: AllowedPages;
  paper: AllowedPaper;
  paperGsm: number;
  size: AllowedSize;
  orientation: AllowedOrientation;
};

export function isAllowedPages(value: unknown): value is AllowedPages {
  return (
    typeof value === "number" &&
    ALLOWED_PAGES.includes(value as AllowedPages)
  );
}

export function isAllowedPaper(value: unknown): value is AllowedPaper {
  return (
    typeof value === "string" &&
    ALLOWED_PAPERS.includes(value as AllowedPaper)
  );
}

export function isAllowedSize(value: unknown): value is AllowedSize {
  return (
    typeof value === "string" &&
    ALLOWED_SIZES.includes(value as AllowedSize)
  );
}

export function isAllowedOrientation(
  value: unknown,
): value is AllowedOrientation {
  return (
    typeof value === "string" &&
    ALLOWED_ORIENTATIONS.includes(value as AllowedOrientation)
  );
}

export function normalizeGsm(value: unknown): number {
  const gsm = Number(value ?? 80);

  if (!Number.isFinite(gsm) || gsm <= 0 || gsm > 1000) {
    throw new Error("Invalid paper GSM.");
  }

  return gsm;
}

export function normalizePhysicalConfig(input: {
  pages?: unknown;
  paper?: unknown;
  paperGsm?: unknown;
  size?: unknown;
  orientation?: unknown;
}): PhysicalConfig {
  if (!isAllowedPages(input.pages)) {
    throw new Error("Invalid notebook page count.");
  }

  if (!isAllowedPaper(input.paper)) {
    throw new Error("Invalid notebook paper.");
  }

  if (!isAllowedSize(input.size)) {
    throw new Error("Invalid notebook size.");
  }

  if (!isAllowedOrientation(input.orientation)) {
    throw new Error("Invalid notebook orientation.");
  }

  return {
    pages: input.pages,
    paper: input.paper,
    paperGsm: normalizeGsm(input.paperGsm),
    size: input.size,
    orientation: input.orientation,
  };
}

export function resolvePagePrice(
  pagePrices: Array<{
    product_id: string;
    pages: number;
    price: number;
  }>,
  productId: string,
  pages: AllowedPages,
): number {
  const row = pagePrices.find(
    (item) =>
      item.product_id === productId &&
      Number(item.pages) === pages,
  );

  if (
    !row ||
    !Number.isFinite(Number(row.price)) ||
    Number(row.price) < 0
  ) {
    throw new Error(
      `Pricing for product "${productId}" (${pages} pages) is unavailable.`,
    );
  }

  return Number(row.price);
}
