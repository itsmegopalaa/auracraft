import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { createSupabaseAdminClient } from "@/app/lib/supabase";
import {
  hasCompleteProductProductionAssets,
  normalizeProductProductionAssets,
  PRODUCT_PRODUCTION_SIDES,
  type ProductProductionSide,
} from "@/app/lib/product-production-assets";

const BUCKET = "minenote-product-production";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Product ID is required." },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, active, production_assets")
    .eq("id", id)
    .eq("active", true)
    .maybeSingle();

  if (productError) {
    console.error(
      "[production-preview] product lookup failed:",
      productError,
    );

    return NextResponse.json(
      { error: "Unable to load product preview." },
      { status: 500 },
    );
  }

  if (!product) {
    return NextResponse.json(
      { error: "Product not found." },
      { status: 404 },
    );
  }

  const assets = normalizeProductProductionAssets(
    product.production_assets,
  );

  if (!hasCompleteProductProductionAssets(assets)) {
    return NextResponse.json({
      complete: false,
      assets: [],
    });
  }

  const admin = createSupabaseAdminClient();

  const signedAssets = await Promise.all(
    PRODUCT_PRODUCTION_SIDES.map(async (side) => {
      const asset = assets.find(
        (item) => item.side === side,
      );

      if (!asset?.storagePath) {
        return null;
      }

      const { data, error } = await admin.storage
        .from(BUCKET)
        .createSignedUrl(asset.storagePath, 60 * 60);

      if (error || !data?.signedUrl) {
        console.error(
          `[production-preview] signed URL failed for ${side}:`,
          error,
        );

        return null;
      }

      return {
        side: side as ProductProductionSide,
        sheetId: asset.sheetId,
        sheetSide: asset.sheetSide,
        url: data.signedUrl,
        width: asset.width ?? null,
        height: asset.height ?? null,
        mimeType: asset.mimeType ?? null,
        source: asset.source ?? "product_artwork",
        templateVersion: asset.templateVersion ?? null,
      };
    }),
  );

  if (signedAssets.some((asset) => !asset)) {
    return NextResponse.json(
      {
        complete: false,
        assets: [],
      },
      { status: 200 },
    );
  }

  return NextResponse.json({
    complete: true,
    assets: signedAssets,
  });
}
