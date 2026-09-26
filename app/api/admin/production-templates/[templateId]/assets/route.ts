import { NextResponse } from "next/server";

import { requireAdminApi } from "@/app/lib/admin-auth";
import { createSupabaseAdminClient } from "@/app/lib/supabase";
import {
  PRODUCT_PRODUCTION_SIDES,
  type ProductProductionSide,
} from "@/app/lib/product-production-assets";

const BUCKET = "minenote-product-production";
const SIGNED_URL_SECONDS = 60 * 60;

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const MIME_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

type RouteContext = {
  params: Promise<{
    templateId: string;
  }>;
};

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

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function getTemplate(
  templateId: string,
) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("minenote_production_templates")
    .select(
      "id, template_key, version, name, description, status, locked, required_elements, created_at, updated_at",
    )
    .eq("id", templateId)
    .maybeSingle();

  if (error) {
    console.error(
      "ADMIN PRODUCTION TEMPLATE LOAD FAILED:",
      error,
    );
    throw new Error("Unable to load production template.");
  }

  return data;
}

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  const auth = await requireAdminApi();

  if (auth.error) {
    return jsonError(auth.error, auth.status);
  }

  const { templateId } = await context.params;

  try {
    const supabase = createSupabaseAdminClient();
    const template = await getTemplate(templateId);

    if (!template) {
      return jsonError("Production template not found.", 404);
    }

    const { data: assets, error: assetsError } = await supabase
      .from("minenote_production_template_assets")
      .select(
        "id, template_id, side, storage_path, width, height, mime_type, metadata, created_at",
      )
      .eq("template_id", templateId)
      .order("created_at", { ascending: true });

    if (assetsError) {
      console.error(
        "ADMIN PRODUCTION TEMPLATE ASSETS LOAD FAILED:",
        assetsError,
      );
      return jsonError(
        "Unable to load template assets.",
        500,
      );
    }

    const assetsWithUrls = await Promise.all(
      (assets ?? []).map(async (asset) => {
        const { data: signed, error: signedError } =
          await supabase.storage
            .from(BUCKET)
            .createSignedUrl(
              asset.storage_path,
              SIGNED_URL_SECONDS,
            );

        return {
          ...asset,
          signedUrl: signedError ? null : signed?.signedUrl ?? null,
        };
      }),
    );

    return NextResponse.json({
      template,
      assets: assetsWithUrls,
      requiredSides: PRODUCT_PRODUCTION_SIDES,
      configuredSides: assetsWithUrls
        .map((asset) => asset.side)
        .filter(isProductionSide),
      complete:
        assetsWithUrls.length === PRODUCT_PRODUCTION_SIDES.length &&
        PRODUCT_PRODUCTION_SIDES.every((side) =>
          assetsWithUrls.some((asset) => asset.side === side),
        ),
    });
  } catch (error) {
    console.error(
      "ADMIN PRODUCTION TEMPLATE ASSET GET FAILED:",
      error,
    );

    return jsonError(
      "Unable to load production template assets.",
      500,
    );
  }
}

export async function POST(
  request: Request,
  context: RouteContext,
) {
  const auth = await requireAdminApi();

  if (auth.error) {
    return jsonError(auth.error, auth.status);
  }

  const { templateId } = await context.params;

  try {
    const supabase = createSupabaseAdminClient();
    const template = await getTemplate(templateId);

    if (!template) {
      return jsonError("Production template not found.", 404);
    }

    if (template.status !== "draft" || template.locked) {
      return jsonError(
        "Only an unlocked draft template can be edited.",
        409,
      );
    }

    const formData = await request.formData();
    const sideValue = formData.get("side");
    const file = formData.get("file");
    const widthValue = formData.get("width");
    const heightValue = formData.get("height");

    if (!isProductionSide(sideValue)) {
      return jsonError(
        "A valid production side is required.",
        400,
      );
    }

    if (!(file instanceof File)) {
      return jsonError(
        "A template artwork file is required.",
        400,
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return jsonError(
        "Only PNG, JPEG, and WebP artwork is supported.",
        415,
      );
    }

    if (file.size <= 0) {
      return jsonError(
        "The uploaded artwork is empty.",
        400,
      );
    }

    if (file.size > 20 * 1024 * 1024) {
      return jsonError(
        "Template artwork must be 20 MB or smaller.",
        413,
      );
    }

    const extension = MIME_EXTENSIONS[file.type];
    const storagePath = [
      "template",
      template.template_key,
      template.version,
      `${sideValue}.${extension}`,
    ].join("/");

    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, bytes, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: true,
      });

    if (uploadError) {
      console.error(
        "ADMIN PRODUCTION TEMPLATE ASSET UPLOAD FAILED:",
        uploadError,
      );

      return jsonError(
        "Unable to upload template artwork.",
        500,
      );
    }

    const width =
      typeof widthValue === "string" &&
      Number.isFinite(Number(widthValue))
        ? Number(widthValue)
        : null;

    const height =
      typeof heightValue === "string" &&
      Number.isFinite(Number(heightValue))
        ? Number(heightValue)
        : null;

    const { data: asset, error: assetError } = await supabase
      .from("minenote_production_template_assets")
      .upsert(
        {
          template_id: template.id,
          side: sideValue,
          storage_path: storagePath,
          width,
          height,
          mime_type: file.type,
          metadata: {
            source: "admin_upload",
            templateKey: template.template_key,
            templateVersion: template.version,
          },
        },
        {
          onConflict: "template_id,side",
        },
      )
      .select(
        "id, template_id, side, storage_path, width, height, mime_type, metadata, created_at",
      )
      .single();

    if (assetError) {
      console.error(
        "ADMIN PRODUCTION TEMPLATE ASSET RECORD FAILED:",
        assetError,
      );

      return jsonError(
        "Artwork uploaded but its asset record could not be saved.",
        500,
      );
    }

    const { data: signed, error: signedError } =
      await supabase.storage
        .from(BUCKET)
        .createSignedUrl(
          storagePath,
          SIGNED_URL_SECONDS,
        );

    return NextResponse.json(
      {
        asset: {
          ...asset,
          signedUrl: signedError
            ? null
            : signed?.signedUrl ?? null,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "ADMIN PRODUCTION TEMPLATE ASSET POST FAILED:",
      error,
    );

    return jsonError(
      "Unable to save production template artwork.",
      500,
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext,
) {
  const auth = await requireAdminApi();

  if (auth.error) {
    return jsonError(auth.error, auth.status);
  }

  const { templateId } = await context.params;

  try {
    const supabase = createSupabaseAdminClient();
    const template = await getTemplate(templateId);

    if (!template) {
      return jsonError("Production template not found.", 404);
    }

    if (template.status !== "draft" || template.locked) {
      return jsonError(
        "Only an unlocked draft template can be edited.",
        409,
      );
    }

    const body = await request.json().catch(() => null);
    const side = body?.side;

    if (!isProductionSide(side)) {
      return jsonError(
        "A valid production side is required.",
        400,
      );
    }

    const { data: asset, error: assetError } = await supabase
      .from("minenote_production_template_assets")
      .select("id, storage_path")
      .eq("template_id", templateId)
      .eq("side", side)
      .maybeSingle();

    if (assetError) {
      console.error(
        "ADMIN PRODUCTION TEMPLATE ASSET LOOKUP FAILED:",
        assetError,
      );
      return jsonError(
        "Unable to load template asset.",
        500,
      );
    }

    if (!asset) {
      return NextResponse.json({
        deleted: false,
        side,
      });
    }

    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([asset.storage_path]);

    if (storageError) {
      console.error(
        "ADMIN PRODUCTION TEMPLATE STORAGE DELETE FAILED:",
        storageError,
      );
      return jsonError(
        "Unable to delete template artwork.",
        500,
      );
    }

    const { error: deleteError } = await supabase
      .from("minenote_production_template_assets")
      .delete()
      .eq("id", asset.id);

    if (deleteError) {
      console.error(
        "ADMIN PRODUCTION TEMPLATE ASSET DELETE FAILED:",
        deleteError,
      );
      return jsonError(
        "Artwork was removed from storage but its database record could not be deleted.",
        500,
      );
    }

    return NextResponse.json({
      deleted: true,
      side,
    });
  } catch (error) {
    console.error(
      "ADMIN PRODUCTION TEMPLATE ASSET DELETE FAILED:",
      error,
    );

    return jsonError(
      "Unable to delete production template artwork.",
      500,
    );
  }
}
