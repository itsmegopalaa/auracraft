import { createSupabaseAdminClient } from "@/app/lib/supabase";
import {
  normalizeProductProductionAssets,
  PRODUCT_PRODUCTION_SIDES,
  type ProductProductionAsset,
  type ProductProductionSide,
} from "@/app/lib/product-production-assets";

const BUCKET = "minenote-product-production";

export type ProductProductionPreviewAsset =
  ProductProductionAsset & {
    url: string;
  };

export async function getProductProductionPreview(
  rawAssets: unknown,
): Promise<ProductProductionPreviewAsset[]> {
  const assets = normalizeProductProductionAssets(rawAssets);

  const bySide = new Map(
    assets.map((asset) => [asset.side, asset]),
  );

  // A customer preview is valid only when all four
  // canonical physical sides exist.
  if (
    PRODUCT_PRODUCTION_SIDES.some(
      (side) => !bySide.get(side),
    )
  ) {
    return [];
  }

  const supabase = createSupabaseAdminClient();

  const signedAssets = await Promise.all(
    PRODUCT_PRODUCTION_SIDES.map(async (side) => {
      const asset = bySide.get(side);

      if (!asset) {
        return null;
      }

      // Existing public/signed URL can be used directly.
      if (!asset.storagePath) {
        if (!asset.url) {
          return null;
        }

        return {
          ...asset,
          side: side as ProductProductionSide,
          url: asset.url,
        };
      }

      // Product production assets are stored privately.
      // Always create a fresh signed URL so the product page
      // does not depend on an expired URL saved in the DB.
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(
          asset.storagePath,
          60 * 60,
        );

      if (error || !data?.signedUrl) {
        console.error(
          `[product-production-preview] failed to sign ${side}:`,
          error,
        );
        return null;
      }

      return {
        ...asset,
        side: side as ProductProductionSide,
        url: data.signedUrl,
      };
    }),
  );

  if (
    signedAssets.some(
      (asset) => asset === null,
    )
  ) {
    return [];
  }

  return signedAssets.filter(
    (
      asset,
    ): asset is ProductProductionPreviewAsset =>
      asset !== null,
  );
}
