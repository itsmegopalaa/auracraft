import { NextResponse } from "next/server";

import { requireAdminApi } from "@/app/lib/admin-auth";
import { createSupabaseAdminClient } from "@/app/lib/supabase";
import {
  hasCompleteProductProductionAssets,
  normalizeProductProductionAssets,
  PRODUCT_PRODUCTION_SIDES,
  type ProductProductionAsset,
} from "@/app/lib/product-production-assets";
import { MINENOTE_TEMPLATE_VERSION } from "@/app/lib/minenote-production-template";

type Params = {
  params: Promise<{
    productId: string;
  }>;
};

function isValidUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value.trim(),
    )
  );
}

export async function PATCH(
  request: Request,
  { params }: Params,
) {
  const adminAuth = await requireAdminApi();

  if (adminAuth.error) {
    return NextResponse.json(
      { error: adminAuth.error },
      { status: adminAuth.status },
    );
  }

  const { productId } = await params;

  if (!isValidUuid(productId)) {
    return NextResponse.json(
      { error: "A valid product ID is required." },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "A valid production asset payload is required." },
      { status: 400 },
    );
  }

  const incoming = normalizeProductProductionAssets(
    (body as { assets?: unknown }).assets,
  );

  if (!hasCompleteProductProductionAssets(incoming)) {
    return NextResponse.json(
      {
        error:
          "Exactly four valid production sides are required: front, insideFront, insideBack, back.",
      },
      { status: 400 },
    );
  }

  const uniqueSides = new Set(incoming.map((asset) => asset.side));

  if (uniqueSides.size !== PRODUCT_PRODUCTION_SIDES.length) {
    return NextResponse.json(
      { error: "Each physical production side must be unique." },
      { status: 400 },
    );
  }

  const assets: ProductProductionAsset[] = PRODUCT_PRODUCTION_SIDES.map(
    (side) => {
      const asset = incoming.find((item) => item.side === side);

      if (!asset) {
        throw new Error(`Missing production side: ${side}`);
      }

      return {
        ...asset,
        templateVersion:
          asset.templateVersion ?? MINENOTE_TEMPLATE_VERSION,
      };
    },
  );

  const supabase = createSupabaseAdminClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name")
    .eq("id", productId.trim())
    .maybeSingle();

  if (productError) {
    return NextResponse.json(
      { error: productError.message },
      { status: 500 },
    );
  }

  if (!product) {
    return NextResponse.json(
      { error: "Product not found." },
      { status: 404 },
    );
  }

  const { data, error } = await supabase
    .from("products")
    .update({
      production_assets: assets,
      production_template_version: MINENOTE_TEMPLATE_VERSION,
    })
    .eq("id", product.id)
    .select(
      "id, name, production_assets, production_template_version",
    )
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    product: {
      id: data.id,
      name: data.name,
    },
    production: {
      templateVersion: data.production_template_version,
      assets: normalizeProductProductionAssets(
        data.production_assets,
      ),
      complete: hasCompleteProductProductionAssets(
        data.production_assets,
      ),
    },
  });
}
