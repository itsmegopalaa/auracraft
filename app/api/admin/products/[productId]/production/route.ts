import { NextResponse } from "next/server";

import { requireAdminApi } from "@/app/lib/admin-auth";
import { createSupabaseAdminClient } from "@/app/lib/supabase";
import {
  hasCompleteProductProductionAssets,
  normalizeProductProductionAssets,
  PRODUCT_PRODUCTION_SIDES,
  type ProductProductionAsset,
} from "@/app/lib/product-production-assets";
import {
  MINENOTE_TEMPLATE_KEY,
  MINENOTE_TEMPLATE_VERSION,
} from "@/app/lib/minenote-production-template";

const BUCKET = "minenote-product-production";

type Params = {
  params: Promise<{
    productId: string;
  }>;
};

type TemplateAsset = {
  id: string;
  side: string;
  storage_path: string;
  width: number | null;
  height: number | null;
  mime_type: string | null;
  metadata: unknown;
};

function isValidUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value.trim(),
    )
  );
}

async function getProduct(
  productId: string,
  supabase: ReturnType<typeof createSupabaseAdminClient>,
) {
  return supabase
    .from("products")
    .select(
      "id, name, image, production_assets, production_template_version",
    )
    .eq("id", productId)
    .maybeSingle();
}

async function getTemplate(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
) {
  return supabase
    .from("minenote_production_templates")
    .select(
      "id, template_key, version, name, description, status, locked, required_elements",
    )
    .eq("template_key", MINENOTE_TEMPLATE_KEY)
    .eq("version", MINENOTE_TEMPLATE_VERSION)
    .maybeSingle();
}

async function getTemplateAssets(
  templateId: string,
  supabase: ReturnType<typeof createSupabaseAdminClient>,
) {
  return supabase
    .from("minenote_production_template_assets")
    .select(
      "id, side, storage_path, width, height, mime_type, metadata",
    )
    .eq("template_id", templateId);
}

async function signStoragePath(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  storagePath: string,
) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 60 * 60);

  if (error || !data?.signedUrl) {
    throw new Error(
      `Unable to create signed URL for ${storagePath}.`,
    );
  }

  return data.signedUrl;
}

/**
 * Copies a template asset into the product-specific production folder.
 *
 * This keeps the template immutable while giving each product its own
 * production asset path.
 */
async function copyTemplateAssetToProduct(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  templateAsset: TemplateAsset,
  productId: string,
  side: string,
) {
  const sourceUrl = await signStoragePath(
    supabase,
    templateAsset.storage_path,
  );

  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(
      `Unable to read MineNote template asset for ${side}.`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();

  const mimeType =
    templateAsset.mime_type ||
    response.headers.get("content-type") ||
    "image/png";

  const extension =
    mimeType === "image/jpeg"
      ? "jpg"
      : mimeType === "image/webp"
        ? "webp"
        : "png";

  const storagePath =
    `product/${productId}/${MINENOTE_TEMPLATE_VERSION}/${side}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(
      storagePath,
      new Uint8Array(arrayBuffer),
      {
        contentType: mimeType,
        cacheControl: "31536000",
        upsert: true,
      },
    );

  if (uploadError) {
    throw new Error(
      `Unable to store ${side} production asset: ${uploadError.message}`,
    );
  }

  return {
    storagePath,
    mimeType,
    width: templateAsset.width,
    height: templateAsset.height,
  };
}

function getPhysicalConfig(side: ProductProductionAsset["side"]) {
  if (side === "front" || side === "insideFront") {
    return {
      sheetId: "sheet1" as const,
      sheetSide: "front" as const,
    };
  }

  if (side === "insideBack") {
    return {
      sheetId: "sheet2" as const,
      sheetSide: "front" as const,
    };
  }

  return {
    sheetId: "sheet2" as const,
    sheetSide: "reverse" as const,
  };
}

export async function GET(
  _request: Request,
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

  const supabase = createSupabaseAdminClient();

  const { data: product, error: productError } =
    await getProduct(productId.trim(), supabase);

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

  const assets = normalizeProductProductionAssets(
    product.production_assets,
  );

  const assetsWithFreshUrls = await Promise.all(
    assets.map(async (asset) => {
      if (!asset.storagePath) {
        return asset;
      }

      try {
        const url = await signStoragePath(
          supabase,
          asset.storagePath,
        );

        return {
          ...asset,
          url,
        };
      } catch {
        return {
          ...asset,
          url: "",
        };
      }
    }),
  );

  return NextResponse.json({
    product: {
      id: product.id,
      name: product.name,
      image: product.image,
    },
    production: {
      templateKey: MINENOTE_TEMPLATE_KEY,
      templateVersion:
        product.production_template_version ??
        MINENOTE_TEMPLATE_VERSION,
      assets: assetsWithFreshUrls,
      complete:
        hasCompleteProductProductionAssets(
          assetsWithFreshUrls,
        ),
    },
  });
}

export async function POST(
  _request: Request,
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

  const supabase = createSupabaseAdminClient();

  const { data: product, error: productError } =
    await getProduct(productId.trim(), supabase);

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

  const { data: template, error: templateError } =
    await getTemplate(supabase);

  if (templateError) {
    return NextResponse.json(
      { error: templateError.message },
      { status: 500 },
    );
  }

  if (!template) {
    return NextResponse.json(
      {
        error:
          "MineNote production template v1 has not been created.",
      },
      { status: 409 },
    );
  }

  if (template.status !== "active" || !template.locked) {
    return NextResponse.json(
      {
        error:
          "MineNote production template v1 must be active and locked before product production can be created.",
        templateStatus: template.status,
        templateLocked: template.locked,
      },
      { status: 409 },
    );
  }

  const {
    data: templateAssets,
    error: templateAssetsError,
  } = await getTemplateAssets(template.id, supabase);

  if (templateAssetsError) {
    return NextResponse.json(
      { error: templateAssetsError.message },
      { status: 500 },
    );
  }

  const templateBySide = new Map<string, TemplateAsset>();

  for (const asset of (templateAssets ?? []) as TemplateAsset[]) {
    templateBySide.set(asset.side, asset);
  }

  const missingSides = PRODUCT_PRODUCTION_SIDES.filter(
    (side) => !templateBySide.has(side),
  );

  if (missingSides.length > 0) {
    return NextResponse.json(
      {
        error:
          "The active MineNote production template is incomplete.",
        missingSides,
      },
      { status: 409 },
    );
  }

  const existingAssets =
    normalizeProductProductionAssets(
      product.production_assets,
    );

  const existingBySide = new Map<
    ProductProductionAsset["side"],
    ProductProductionAsset
  >();

  for (const asset of existingAssets) {
    existingBySide.set(asset.side, asset);
  }

  const nextAssets: ProductProductionAsset[] = [];

  try {
    for (const side of PRODUCT_PRODUCTION_SIDES) {
      const existing = existingBySide.get(side);

      /*
       * Preserve an already uploaded product-specific asset.
       */
      if (existing?.storagePath) {
        const physical = getPhysicalConfig(side);

        nextAssets.push({
          ...existing,
          ...physical,
          templateVersion: MINENOTE_TEMPLATE_VERSION,
        });

        continue;
      }

      const templateAsset = templateBySide.get(side);

      if (!templateAsset) {
        throw new Error(
          `Missing template asset for ${side}.`,
        );
      }

      const copied =
        await copyTemplateAssetToProduct(
          supabase,
          templateAsset,
          product.id,
          side,
        );

      const physical = getPhysicalConfig(side);

      nextAssets.push({
        side,
        ...physical,
        url: "",
        storagePath: copied.storagePath,
        width: copied.width,
        height: copied.height,
        mimeType: copied.mimeType,
        source: "minenote_template",
        templateVersion: MINENOTE_TEMPLATE_VERSION,
      });
    }
  } catch (error) {
    console.error(
      "Failed to prepare product production assets:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to prepare product production assets.",
      },
      { status: 500 },
    );
  }

  const { data, error: updateError } =
    await supabase
      .from("products")
      .update({
        production_assets: nextAssets,
        production_template_version:
          MINENOTE_TEMPLATE_VERSION,
      })
      .eq("id", product.id)
      .select(
        "id, name, production_assets, production_template_version",
      )
      .single();

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 },
    );
  }

  const finalAssets =
    normalizeProductProductionAssets(
      data.production_assets,
    );

  const assetsWithUrls = await Promise.all(
    finalAssets.map(async (asset) => {
      if (!asset.storagePath) {
        return asset;
      }

      try {
        return {
          ...asset,
          url: await signStoragePath(
            supabase,
            asset.storagePath,
          ),
        };
      } catch {
        return asset;
      }
    }),
  );

  return NextResponse.json({
    ok: true,
    alreadyComplete: false,
    prepared: true,
    product: {
      id: data.id,
      name: data.name,
    },
    production: {
      templateKey: MINENOTE_TEMPLATE_KEY,
      templateVersion:
        data.production_template_version,
      assets: assetsWithUrls,
      complete:
        hasCompleteProductProductionAssets(
          assetsWithUrls,
        ),
    },
    message:
      "Four product-specific MineNote production assets were created from the locked template.",
  });
}