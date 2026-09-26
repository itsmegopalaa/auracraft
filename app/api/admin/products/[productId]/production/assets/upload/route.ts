import { NextResponse } from "next/server";
import {
  PRODUCT_PRODUCTION_SIDES,
  isProductProductionSide,
} from "@/app/lib/product-production-assets";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { createSupabaseAdminClient } from "@/app/lib/supabase";

const BUCKET = "minenote-product-production";
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{ productId: string }>;
  },
) {
  const adminAuth = await requireAdminApi();

  if (adminAuth.error) {
    return NextResponse.json(
      { error: adminAuth.error },
      { status: adminAuth.status },
    );
  }

  const { productId } = await context.params;

  if (!isUuid(productId)) {
    return NextResponse.json(
      { error: "Invalid product id." },
      { status: 400 },
    );
  }

  const formData = await request.formData();
  const sideValue = formData.get("side");
  const fileValue = formData.get("file");

  if (
    typeof sideValue !== "string" ||
    !isProductProductionSide(sideValue)
  ) {
    return NextResponse.json(
      {
        error: `Invalid production side. Expected one of: ${PRODUCT_PRODUCTION_SIDES.join(
          ", ",
        )}.`,
      },
      { status: 400 },
    );
  }

  if (!(fileValue instanceof File)) {
    return NextResponse.json(
      { error: "Artwork file is required." },
      { status: 400 },
    );
  }

  if (fileValue.size <= 0) {
    return NextResponse.json(
      { error: "Artwork file is empty." },
      { status: 400 },
    );
  }

  if (fileValue.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Artwork file must be 20 MB or smaller." },
      { status: 400 },
    );
  }

  const extension = MIME_TO_EXTENSION[fileValue.type];

  if (!extension) {
    return NextResponse.json(
      {
        error:
          "Unsupported artwork format. Use PNG, JPEG, or WebP.",
      },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, production_template_version")
    .eq("id", productId)
    .maybeSingle();

  if (productError) {
    console.error(
      "Failed to load product for production artwork upload:",
      productError,
    );

    return NextResponse.json(
      { error: "Unable to load product." },
      { status: 500 },
    );
  }

  if (!product) {
    return NextResponse.json(
      { error: "Product not found." },
      { status: 404 },
    );
  }

  const templateVersion =
    product.production_template_version || "minenote-v1";

  const storagePath =
    `product/${productId}/${templateVersion}/${sideValue}.${extension}`;

  const bytes = new Uint8Array(
    await fileValue.arrayBuffer(),
  );

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, bytes, {
      contentType: fileValue.type,
      cacheControl: "31536000",
      upsert: true,
    });

  if (uploadError) {
    console.error(
      "Failed to upload product production artwork:",
      uploadError,
    );

    return NextResponse.json(
      { error: "Unable to upload production artwork." },
      { status: 500 },
    );
  }

  const { data: signed, error: signedError } =
    await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, 60 * 60);

  if (signedError || !signed?.signedUrl) {
    console.error(
      "Failed to create production artwork preview URL:",
      signedError,
    );

    return NextResponse.json(
      {
        error:
          "Artwork uploaded, but preview URL could not be created.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    productId,
    side: sideValue,
    storagePath,
    url: signed.signedUrl,
    mimeType: fileValue.type,
    size: fileValue.size,
    templateVersion,
  });
}
