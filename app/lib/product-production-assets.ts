import {
  getNotebookSheetForSide,
  getNotebookSheetSide,
  type NotebookPhysicalSide,
} from "@/app/lib/notebook-physical-model";

export const PRODUCT_PRODUCTION_SIDES = [
  "front",
  "insideFront",
  "insideBack",
  "back",
] as const;

export type ProductProductionSide =
  (typeof PRODUCT_PRODUCTION_SIDES)[number];

export type ProductProductionAsset = {
  side: ProductProductionSide;
  sheetId: "sheet1" | "sheet2";
  sheetSide: "front" | "reverse";
  url: string;
  storagePath?: string | null;
  width?: number | null;
  height?: number | null;
  mimeType?: string | null;
  source?: "product_artwork" | "minenote_template" | "composed";
  templateVersion?: string | null;
};

export type ProductProductionAssets = Record<
  ProductProductionSide,
  ProductProductionAsset
>;

export const DEFAULT_PRODUCT_TEMPLATE_VERSION = "minenote-v1";

export function isProductProductionSide(
  value: unknown,
): value is ProductProductionSide {
  return (
    typeof value === "string" &&
    (PRODUCT_PRODUCTION_SIDES as readonly string[]).includes(value)
  );
}

export function normalizeProductProductionAssets(
  value: unknown,
): ProductProductionAsset[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((asset): asset is ProductProductionAsset => {
      if (!asset || typeof asset !== "object") {
        return false;
      }

      const candidate = asset as Record<string, unknown>;

      if (!isProductProductionSide(candidate.side)) {
        return false;
      }

      /*
       * A production asset may temporarily have no public/signed URL
       * because the real source is its private Supabase storagePath.
       * Do not discard it just because url is empty.
       */
      const hasUrl =
        typeof candidate.url === "string" &&
        candidate.url.trim().length > 0;

      const hasStoragePath =
        typeof candidate.storagePath === "string" &&
        candidate.storagePath.trim().length > 0;

      if (!hasUrl && !hasStoragePath) {
        return false;
      }

      const physicalSide = candidate.side as NotebookPhysicalSide;
      const sheet = getNotebookSheetForSide(physicalSide);
      const sheetSide = getNotebookSheetSide(physicalSide);

      if (
        candidate.sheetId !== undefined &&
        candidate.sheetId !== sheet.id
      ) {
        return false;
      }

      if (
        candidate.sheetSide !== undefined &&
        candidate.sheetSide !== sheetSide
      ) {
        return false;
      }

      return true;
    })
    .map((asset) => {
      const side = asset.side as NotebookPhysicalSide;
      const sheet = getNotebookSheetForSide(side);

      return {
        ...asset,
        url:
          typeof asset.url === "string"
            ? asset.url.trim()
            : "",
        storagePath:
          typeof asset.storagePath === "string"
            ? asset.storagePath.trim()
            : null,
        sheetId: sheet.id,
        sheetSide: getNotebookSheetSide(side),
      };
    });
}

export function hasCompleteProductProductionAssets(
  value: unknown,
): value is ProductProductionAsset[] {
  const assets = normalizeProductProductionAssets(value);

  if (assets.length !== 4) {
    return false;
  }

  return PRODUCT_PRODUCTION_SIDES.every((side) =>
    assets.some((asset) => asset.side === side),
  );
}

export function getProductProductionAsset(
  value: unknown,
  side: ProductProductionSide,
): ProductProductionAsset | null {
  const assets = normalizeProductProductionAssets(value);

  return assets.find((asset) => asset.side === side) ?? null;
}
