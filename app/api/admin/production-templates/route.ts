import { NextResponse } from "next/server";

import { requireAdminApi } from "@/app/lib/admin-auth";
import { createSupabaseAdminClient } from "@/app/lib/supabase";
import {
  PRODUCT_PRODUCTION_SIDES,
  type ProductProductionSide,
} from "@/app/lib/product-production-assets";

const BUCKET = "minenote-product-production";
const SIGNED_URL_SECONDS = 60 * 60;

function isProductionSide(
  value: unknown,
): value is ProductProductionSide {
  return (
    typeof value === "string" &&
    PRODUCT_PRODUCTION_SIDES.includes(
      value as ProductProductionSide,
    )
  );
}

export async function GET() {
  const auth = await requireAdminApi();

  if (auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status },
    );
  }

  try {
    const supabase = createSupabaseAdminClient();

    const { data: templates, error: templateError } =
      await supabase
        .from("minenote_production_templates")
        .select(
          "id, template_key, version, name, description, status, locked, required_elements, created_at, updated_at",
        )
        .eq("template_key", "minenote-notebook")
        .order("created_at", { ascending: false });

    if (templateError) {
      console.error(
        "ADMIN PRODUCTION TEMPLATES LOAD FAILED:",
        templateError,
      );

      return NextResponse.json(
        { error: "Unable to load production templates." },
        { status: 500 },
      );
    }

    const templateIds = (templates ?? []).map(
      (template) => template.id,
    );

    let assets: Array<{
      id: string;
      template_id: string;
      side: string;
      storage_path: string;
      width: number | null;
      height: number | null;
      mime_type: string | null;
    }> = [];

    if (templateIds.length > 0) {
      const { data, error: assetError } = await supabase
        .from("minenote_production_template_assets")
        .select(
          "id, template_id, side, storage_path, width, height, mime_type",
        )
        .in("template_id", templateIds);

      if (assetError) {
        console.error(
          "ADMIN PRODUCTION TEMPLATE ASSETS LOAD FAILED:",
          assetError,
        );

        return NextResponse.json(
          { error: "Unable to load production template assets." },
          { status: 500 },
        );
      }

      assets = data ?? [];
    }

    const assetsWithUrls = await Promise.all(
      assets.map(async (asset) => {
        const { data: signed, error: signedError } =
          await supabase.storage
            .from(BUCKET)
            .createSignedUrl(
              asset.storage_path,
              SIGNED_URL_SECONDS,
            );

        return {
          ...asset,
          side: isProductionSide(asset.side)
            ? asset.side
            : null,
          signedUrl: signedError
            ? null
            : signed?.signedUrl ?? null,
        };
      }),
    );

    return NextResponse.json({
      templates: (templates ?? []).map((template) => {
        const templateAssets = assetsWithUrls.filter(
          (asset) => asset.template_id === template.id,
        );

        return {
          ...template,
          assets: templateAssets,
          complete:
            templateAssets.length ===
              PRODUCT_PRODUCTION_SIDES.length &&
            PRODUCT_PRODUCTION_SIDES.every((side) =>
              templateAssets.some(
                (asset) => asset.side === side,
              ),
            ),
        };
      }),
    });
  } catch (error) {
    console.error(
      "ADMIN PRODUCTION TEMPLATES GET FAILED:",
      error,
    );

    return NextResponse.json(
      { error: "Unable to load production templates." },
      { status: 500 },
    );
  }
}
