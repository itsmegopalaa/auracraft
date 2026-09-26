export const PRODUCT_SIZES = ["A4", "A5"] as const;
export const PRODUCT_ORIENTATIONS = ["portrait", "landscape"] as const;
export const PRODUCT_PAPERS = ["plain", "ruled", "dotGrid"] as const;

export type ProductSize = (typeof PRODUCT_SIZES)[number];
export type ProductOrientation = (typeof PRODUCT_ORIENTATIONS)[number];
export type ProductPaper = (typeof PRODUCT_PAPERS)[number];

export type ProductPhysicalConfig = {
  pages: 100 | 150 | 200;
  paper: ProductPaper;
  paperGsm: number;
  size: ProductSize;
  orientation: ProductOrientation;
};

export const DEFAULT_PRODUCT_PHYSICAL_CONFIG: ProductPhysicalConfig = {
  pages: 100,
  paper: "plain",
  paperGsm: 80,
  size: "A4",
  orientation: "portrait",
};

export function formatPaper(
  paper: string | null | undefined,
  gsm: number | null | undefined,
) {
  const label =
    paper === "plain"
      ? "Plain"
      : paper === "ruled"
        ? "Ruled"
        : paper === "dotGrid"
          ? "Dot Grid"
          : paper || "Not recorded";

  return gsm ? `${label} — ${gsm} GSM` : label;
}

export function formatOrientation(
  orientation: string | null | undefined,
) {
  if (!orientation) return "Not recorded";

  return orientation === "portrait"
    ? "Portrait"
    : orientation === "landscape"
      ? "Landscape"
      : orientation;
}
