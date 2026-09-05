import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/app/lib/supabase";
import {
  buildCustomCoverStoragePath,
  getCustomCoverStorageBucket,
} from "@/app/services/ai/persistence/storage";
import { createCustomCoverAssetRecord } from "@/app/services/ai/persistence/repository";
import type { CoverSide } from "@/app/lib/customization";

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const MIN_WIDTH = 600;
const MIN_HEIGHT = 800;

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

function isCoverSide(value: FormDataEntryValue | null): value is CoverSide {
  return (
    value === "front" ||
    value === "insideFront" ||
    value === "back" ||
    value === "insideBack"
  );
}

function readUint16(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function readUint32BE(bytes: Uint8Array, offset: number): number {
  return (
    bytes[offset] * 0x1000000 +
    bytes[offset + 1] * 0x10000 +
    bytes[offset + 2] * 0x100 +
    bytes[offset + 3]
  );
}

function detectPng(bytes: Uint8Array) {
  if (
    bytes.length < 24 ||
    bytes[0] !== 0x89 ||
    bytes[1] !== 0x50 ||
    bytes[2] !== 0x4e ||
    bytes[3] !== 0x47 ||
    bytes[4] !== 0x0d ||
    bytes[5] !== 0x0a ||
    bytes[6] !== 0x1a ||
    bytes[7] !== 0x0a
  ) {
    return null;
  }

  const width = readUint32BE(bytes, 16);
  const height = readUint32BE(bytes, 20);

  if (!width || !height) {
    throw new Error("Invalid PNG dimensions.");
  }

  return {
    mimeType: "image/png" as const,
    width,
    height,
    extension: "png",
  };
}

function detectJpeg(bytes: Uint8Array) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return null;
  }

  let offset = 2;

  while (offset + 3 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    while (offset < bytes.length && bytes[offset] === 0xff) {
      offset += 1;
    }

    if (offset >= bytes.length) {
      break;
    }

    const marker = bytes[offset++];

    if (
      marker === 0xd8 ||
      marker === 0xd9 ||
      (marker >= 0xd0 && marker <= 0xd7)
    ) {
      continue;
    }

    if (offset + 1 >= bytes.length) {
      throw new Error("Invalid JPEG image.");
    }

    const segmentLength = readUint16(bytes, offset);

    if (segmentLength < 2 || offset + segmentLength > bytes.length) {
      throw new Error("Invalid JPEG segment.");
    }

    const isStartOfFrame =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);

    if (isStartOfFrame) {
      if (segmentLength < 7) {
        throw new Error("Invalid JPEG frame.");
      }

      const height = readUint16(bytes, offset + 3);
      const width = readUint16(bytes, offset + 5);

      if (!width || !height) {
        throw new Error("Invalid JPEG dimensions.");
      }

      return {
        mimeType: "image/jpeg" as const,
        width,
        height,
        extension: "jpg",
      };
    }

    offset += segmentLength;
  }

  throw new Error("JPEG dimensions could not be determined.");
}

function detectWebp(bytes: Uint8Array) {
  if (
    bytes.length < 16 ||
    String.fromCharCode(
      bytes[0],
      bytes[1],
      bytes[2],
      bytes[3]
    ) !== "RIFF" ||
    String.fromCharCode(
      bytes[8],
      bytes[9],
      bytes[10],
      bytes[11]
    ) !== "WEBP"
  ) {
    return null;
  }

  const chunk = String.fromCharCode(
    bytes[12],
    bytes[13],
    bytes[14],
    bytes[15]
  );

  if (chunk === "VP8X") {
    if (bytes.length < 30) {
      throw new Error("Invalid WebP image.");
    }

    const width =
      1 +
      bytes[24] +
      (bytes[25] << 8) +
      (bytes[26] << 16);

    const height =
      1 +
      bytes[27] +
      (bytes[28] << 8) +
      (bytes[29] << 16);

    return {
      mimeType: "image/webp" as const,
      width,
      height,
      extension: "webp",
    };
  }

  if (chunk === "VP8 ") {
    if (bytes.length < 30) {
      throw new Error("Invalid WebP image.");
    }

    const frameStart = 20;

    if (
      bytes[frameStart + 3] !== 0x9d ||
      bytes[frameStart + 4] !== 0x01 ||
      bytes[frameStart + 5] !== 0x2a
    ) {
      throw new Error("Invalid WebP frame.");
    }

    const width =
      readUint16(bytes, frameStart + 6) & 0x3fff;

    const height =
      readUint16(bytes, frameStart + 8) & 0x3fff;

    return {
      mimeType: "image/webp" as const,
      width,
      height,
      extension: "webp",
    };
  }

  if (chunk === "VP8L") {
    if (bytes.length < 25 || bytes[20] !== 0x2f) {
      throw new Error("Invalid WebP lossless image.");
    }

    const b0 = bytes[21];
    const b1 = bytes[22];
    const b2 = bytes[23];
    const b3 = bytes[24];

    const width =
      1 + (b0 | ((b1 & 0x3f) << 8));

    const height =
      1 +
      ((b1 >> 6) |
        (b2 << 2) |
        ((b3 & 0x0f) << 10));

    return {
      mimeType: "image/webp" as const,
      width,
      height,
      extension: "webp",
    };
  }

  throw new Error("Unsupported WebP encoding.");
}

function detectImage(bytes: Uint8Array) {
  const detected =
    detectPng(bytes) ??
    detectJpeg(bytes) ??
    detectWebp(bytes);

  if (!detected) {
    throw new Error(
      "Only PNG, JPEG, and WebP images are supported."
    );
  }

  return detected;
}

async function signedUrl(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  storagePath: string
) {
  const bucket = getCustomCoverStorageBucket("original");

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, 60 * 60);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      customizationId: string;
    }>;
  }
) {
  const { customizationId } = await context.params;

  if (!isValidUuid(customizationId)) {
    return NextResponse.json(
      { error: "Invalid customization ID." },
      { status: 400 }
    );
  }

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to upload artwork." },
      { status: 401 }
    );
  }

  const { data: customization, error: customizationError } =
    await supabase
      .from("custom_cover_customizations")
      .select("id, customer_id, status")
      .eq("id", customizationId)
      .eq("customer_id", user.id)
      .maybeSingle();

  if (customizationError) {
    console.error(
      "Custom cover upload customization lookup failed:",
      customizationError
    );

    return NextResponse.json(
      { error: "Unable to verify customization." },
      { status: 500 }
    );
  }

  if (!customization) {
    return NextResponse.json(
      { error: "Customization not found." },
      { status: 404 }
    );
  }

  if (customization.status !== "draft") {
    return NextResponse.json(
      { error: "Only draft customizations can be edited." },
      { status: 409 }
    );
  }

  const formData = await request.formData();
  const sideValue = formData.get("side");
  const fileValue = formData.get("file");

  if (!isCoverSide(sideValue)) {
    return NextResponse.json(
      { error: "A valid cover side is required." },
      { status: 400 }
    );
  }

  const side = sideValue;

  if (!(fileValue instanceof File)) {
    return NextResponse.json(
      { error: "Please select an image file." },
      { status: 400 }
    );
  }

  if (fileValue.size <= 0) {
    return NextResponse.json(
      { error: "The selected image is empty." },
      { status: 400 }
    );
  }

  if (fileValue.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Image must be 15 MB or smaller." },
      { status: 413 }
    );
  }

  if (!ALLOWED_TYPES.has(fileValue.type)) {
    return NextResponse.json(
      { error: "Only PNG, JPEG, and WebP images are supported." },
      { status: 415 }
    );
  }

  const bytes = new Uint8Array(await fileValue.arrayBuffer());

  let detected;

  try {
    detected = detectImage(bytes);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid image file.",
      },
      { status: 415 }
    );
  }

  if (detected.mimeType !== fileValue.type) {
    return NextResponse.json(
      { error: "The file contents do not match the declared image type." },
      { status: 415 }
    );
  }

  if (
    detected.width < MIN_WIDTH ||
    detected.height < MIN_HEIGHT
  ) {
    return NextResponse.json(
      {
        error: `Image must be at least ${MIN_WIDTH}×${MIN_HEIGHT}px.`,
      },
      { status: 422 }
    );
  }

  const bucket = getCustomCoverStorageBucket("original");

  const storagePath = buildCustomCoverStoragePath({
    customerId: user.id,
    customizationId,
    side,
    kind: "original",
    extension: detected.extension,
  });

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, bytes, {
      contentType: detected.mimeType,
      upsert: true,
    });

  if (uploadError) {
    console.error(
      "Custom cover artwork storage upload failed:",
      uploadError
    );

    return NextResponse.json(
      { error: "Unable to store your artwork." },
      { status: 500 }
    );
  }

  const { data: previousAssets, error: previousError } =
    await supabase
      .from("custom_cover_assets")
      .select("id, storage_path")
      .eq("customization_id", customizationId)
      .eq("side", side)
      .eq("kind", "original");

  if (previousError) {
    console.error(
      "Custom cover previous asset lookup failed:",
      previousError
    );
  }

  const { data: asset, error: assetError } =
    await supabase
      .from("custom_cover_assets")
      .insert({
        customization_id: customizationId,
        side,
        kind: "original",
        storage_path: storagePath,
        width: detected.width,
        height: detected.height,
        mime_type: detected.mimeType,
        file_size: fileValue.size,
        metadata: {
          source: "customer_upload",
        },
      })
      .select("*")
      .single();

  if (assetError) {
    console.error(
      "Custom cover asset record creation failed:",
      assetError
    );

    await supabase.storage
      .from(bucket)
      .remove([storagePath]);

    return NextResponse.json(
      { error: "Unable to register your artwork." },
      { status: 500 }
    );
  }

  if (previousAssets?.length) {
    const previousIds = previousAssets
      .map((item) => item.id)
      .filter((id) => id !== asset.id);

    const previousPaths = previousAssets
      .map((item) => item.storage_path)
      .filter((path) => path !== storagePath);

    if (previousIds.length) {
      const { error } = await supabase
        .from("custom_cover_assets")
        .delete()
        .in("id", previousIds);

      if (error) {
        console.error(
          "Custom cover previous asset cleanup failed:",
          error
        );
      }
    }

    if (previousPaths.length) {
      const { error } = await supabase.storage
        .from(bucket)
        .remove(previousPaths);

      if (error) {
        console.error(
          "Custom cover previous storage cleanup failed:",
          error
        );
      }
    }
  }

  const previewUrl = await signedUrl(
    supabase,
    storagePath
  );

  return NextResponse.json(
    {
      asset: {
        id: asset.id,
        side: asset.side,
        kind: asset.kind,
        storagePath: asset.storage_path,
        width: asset.width,
        height: asset.height,
        mimeType: asset.mime_type,
        fileSize: asset.file_size,
        previewUrl,
      },
    },
    { status: 201 }
  );
}

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      customizationId: string;
    }>;
  }
) {
  const { customizationId } = await context.params;

  if (!isValidUuid(customizationId)) {
    return NextResponse.json(
      { error: "Invalid customization ID." },
      { status: 400 }
    );
  }

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in." },
      { status: 401 }
    );
  }

  const { data: customization, error: customizationError } =
    await supabase
      .from("custom_cover_customizations")
      .select("id, status")
      .eq("id", customizationId)
      .eq("customer_id", user.id)
      .maybeSingle();

  if (customizationError) {
    return NextResponse.json(
      { error: "Unable to verify customization." },
      { status: 500 }
    );
  }

  if (!customization) {
    return NextResponse.json(
      { error: "Customization not found." },
      { status: 404 }
    );
  }

  const { data: assets, error: assetsError } =
    await supabase
      .from("custom_cover_assets")
      .select(
        "id, side, kind, storage_path, width, height, mime_type, file_size, metadata, created_at"
      )
      .eq("customization_id", customizationId)
      .eq("kind", "original")
      .order("created_at", { ascending: false });

  if (assetsError) {
    console.error(
      "Custom cover assets lookup failed:",
      assetsError
    );

    return NextResponse.json(
      { error: "Unable to load artwork." },
      { status: 500 }
    );
  }

  const latestBySide = new Map<string, (typeof assets)[number]>();

  for (const asset of assets) {
    if (!latestBySide.has(asset.side)) {
      latestBySide.set(asset.side, asset);
    }
  }

  const result = [];

  for (const asset of latestBySide.values()) {
    const previewUrl = await signedUrl(
      supabase,
      asset.storage_path
    );

    result.push({
      id: asset.id,
      side: asset.side,
      kind: asset.kind,
      storagePath: asset.storage_path,
      width: asset.width,
      height: asset.height,
      mimeType: asset.mime_type,
      fileSize: asset.file_size,
      previewUrl,
    });
  }

  return NextResponse.json({
    assets: result,
  });
}
