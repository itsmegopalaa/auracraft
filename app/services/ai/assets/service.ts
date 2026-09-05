import type { SupabaseClient } from "@supabase/supabase-js";

import {
  buildCustomCoverStoragePath,
  getCustomCoverStorageBucket,
} from "../persistence/storage";
import {
  createCustomCoverAssetRecord,
  deleteCustomCoverAssetRecord,
} from "../persistence/repository";
import type { AiGeneratedAsset } from "../types";
import type { CoverSide } from "../../../lib/customization/types";
import type {
  AiAssetIngestionInput,
  AiAssetIngestionResult,
  IngestedAiAsset,
} from "./types";

const MAX_ASSET_BYTES = 20 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

function assertValidSide(side: CoverSide): void {
  if (
    side !== "front" &&
    side !== "insideFront" &&
    side !== "insideBack" &&
    side !== "back"
  ) {
    throw new Error(`Unsupported cover side: ${side}`);
  }
}

function getAllowedAssetHosts(): string[] {
  return (process.env.AI_ASSET_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

function assertAllowedAssetHost(hostname: string): void {
  const normalizedHost = hostname.toLowerCase().replace(/\.$/, "");
  const allowedHosts = getAllowedAssetHosts();

  if (allowedHosts.length === 0) {
    throw new Error(
      "AI asset host allowlist is not configured. Set AI_ASSET_ALLOWED_HOSTS."
    );
  }

  const isAllowed = allowedHosts.some((allowedHost) => {
    const normalizedAllowedHost = allowedHost
      .toLowerCase()
      .replace(/\.$/, "");

    return (
      normalizedHost === normalizedAllowedHost ||
      normalizedHost.endsWith(`.${normalizedAllowedHost}`)
    );
  });

  if (!isAllowed) {
    throw new Error(`AI asset host is not allowed: ${hostname}`);
  }
}

function assertValidAsset(asset: AiGeneratedAsset): void {
  assertValidSide(asset.side);

  if (!Number.isInteger(asset.width) || asset.width <= 0) {
    throw new Error(`Invalid width for ${asset.side} asset`);
  }

  if (!Number.isInteger(asset.height) || asset.height <= 0) {
    throw new Error(`Invalid height for ${asset.side} asset`);
  }

  if (!ALLOWED_MIME_TYPES.has(asset.mimeType)) {
    throw new Error(`Unsupported MIME type: ${asset.mimeType}`);
  }

  try {
    const url = new URL(asset.url);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Unsupported asset URL protocol");
    }

    if (url.username || url.password) {
      throw new Error("Asset URL must not contain credentials");
    }

    assertAllowedAssetHost(url.hostname);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("AI asset host is not allowed:")
    ) {
      throw error;
    }

    if (
      error instanceof Error &&
      error.message.startsWith("AI asset host allowlist")
    ) {
      throw error;
    }

    throw new Error(`Invalid asset URL for ${asset.side} asset`);
  }
}

type DetectedImage = {
  mimeType: "image/png" | "image/jpeg" | "image/webp";
  width: number;
  height: number;
};

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

function readUint32LE(bytes: Uint8Array, offset: number): number {
  return (
    bytes[offset] +
    bytes[offset + 1] * 0x100 +
    bytes[offset + 2] * 0x10000 +
    bytes[offset + 3] * 0x1000000
  );
}

function detectPng(bytes: Uint8Array): DetectedImage | null {
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

  const chunkLength = readUint32BE(bytes, 8);
  const chunkType =
    String.fromCharCode(bytes[12]) +
    String.fromCharCode(bytes[13]) +
    String.fromCharCode(bytes[14]) +
    String.fromCharCode(bytes[15]);

  if (chunkType !== "IHDR" || chunkLength < 13) {
    throw new Error("Invalid PNG image.");
  }

  const width = readUint32BE(bytes, 16);
  const height = readUint32BE(bytes, 20);

  if (width <= 0 || height <= 0) {
    throw new Error("Invalid PNG dimensions.");
  }

  return {
    mimeType: "image/png",
    width,
    height,
  };
}

function detectJpeg(bytes: Uint8Array): DetectedImage | null {
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

    // Standalone markers without a length field.
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

      if (width <= 0 || height <= 0) {
        throw new Error("Invalid JPEG dimensions.");
      }

      return {
        mimeType: "image/jpeg",
        width,
        height,
      };
    }

    offset += segmentLength;
  }

  throw new Error("JPEG dimensions could not be determined.");
}

function detectWebp(bytes: Uint8Array): DetectedImage | null {
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
      throw new Error("Invalid WebP VP8X image.");
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
      mimeType: "image/webp",
      width,
      height,
    };
  }

  if (chunk === "VP8 ") {
    if (bytes.length < 30) {
      throw new Error("Invalid WebP VP8 image.");
    }

    const frameStart = 20;

    if (
      bytes[frameStart + 3] !== 0x9d ||
      bytes[frameStart + 4] !== 0x01 ||
      bytes[frameStart + 5] !== 0x2a
    ) {
      throw new Error("Invalid WebP VP8 frame.");
    }

    const width = readUint16(bytes, frameStart + 6) & 0x3fff;
    const height = readUint16(bytes, frameStart + 8) & 0x3fff;

    if (width <= 0 || height <= 0) {
      throw new Error("Invalid WebP dimensions.");
    }

    return {
      mimeType: "image/webp",
      width,
      height,
    };
  }

  if (chunk === "VP8L") {
    if (bytes.length < 25 || bytes[20] !== 0x2f) {
      throw new Error("Invalid WebP VP8L image.");
    }

    const b0 = bytes[21];
    const b1 = bytes[22];
    const b2 = bytes[23];
    const b3 = bytes[24];

    const width = 1 + (b0 | ((b1 & 0x3f) << 8));

    const height =
      1 +
      ((b1 >> 6) |
        (b2 << 2) |
        ((b3 & 0xf) << 10));

    if (width <= 0 || height <= 0) {
      throw new Error("Invalid WebP dimensions.");
    }

    return {
      mimeType: "image/webp",
      width,
      height,
    };
  }

  throw new Error("Unsupported WebP encoding.");
}

function detectImage(bytes: Uint8Array): DetectedImage {
  const detected =
    detectPng(bytes) ??
    detectJpeg(bytes) ??
    detectWebp(bytes);

  if (!detected) {
    throw new Error(
      "Downloaded asset is not a supported PNG, JPEG, or WebP image."
    );
  }

  return detected;
}

function assertDownloadedImageMatches(
  asset: AiGeneratedAsset,
  bytes: Uint8Array
): DetectedImage {
  const detected = detectImage(bytes);

  if (detected.mimeType !== asset.mimeType) {
    throw new Error(
      `Generated ${asset.side} asset MIME mismatch: declared ${asset.mimeType}, detected ${detected.mimeType}`
    );
  }

  if (
    detected.width !== asset.width ||
    detected.height !== asset.height
  ) {
    throw new Error(
      `Generated ${asset.side} asset dimensions mismatch: declared ${asset.width}x${asset.height}, detected ${detected.width}x${detected.height}`
    );
  }

  return detected;
}

function getExtension(mimeType: string): string {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    default:
      throw new Error(`Unsupported MIME type: ${mimeType}`);
  }
}

function getAssetIdBySide(
  assets: IngestedAiAsset[],
  side: CoverSide
): string | null {
  return assets.find((asset) => asset.side === side)?.id ?? null;
}

async function cleanupIngestedAssets(
  supabase: SupabaseClient,
  createdAssets: Array<{
    id: string;
    storagePath: string;
  }>
): Promise<void> {
  for (const asset of createdAssets) {
    try {
      await deleteCustomCoverAssetRecord(supabase, asset.id);
    } catch (error) {
      console.error(
        `[AI assets] Failed to delete asset record ${asset.id} during cleanup`,
        error
      );
    }
  }

  const bucket = getCustomCoverStorageBucket("preview");

  for (const asset of createdAssets) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([asset.storagePath]);

      if (error) {
        console.error(
          `[AI assets] Failed to remove storage object ${asset.storagePath} during cleanup`,
          error
        );
      }
    } catch (error) {
      console.error(
        `[AI assets] Unexpected storage cleanup failure for ${asset.storagePath}`,
        error
      );
    }
  }
}

export async function ingestAiGeneratedAssets(
  supabase: SupabaseClient,
  input: AiAssetIngestionInput
): Promise<AiAssetIngestionResult> {
  if (!input.customerId) {
    throw new Error("Customer ID is required");
  }

  if (!input.customizationId) {
    throw new Error("Customization ID is required");
  }

  if (!Array.isArray(input.assets) || input.assets.length === 0) {
    throw new Error("At least one generated asset is required");
  }

  const seenSides = new Set<CoverSide>();

  for (const asset of input.assets) {
    assertValidAsset(asset);

    if (seenSides.has(asset.side)) {
      throw new Error(`Duplicate generated asset for side: ${asset.side}`);
    }

    seenSides.add(asset.side);
  }

  const createdAssets: Array<{
    id: string;
    storagePath: string;
  }> = [];

  const ingestedAssets: IngestedAiAsset[] = [];

  try {
    for (const asset of input.assets) {
      const response = await fetch(asset.url, {
        method: "GET",
        redirect: "error",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to download generated ${asset.side} asset: HTTP ${response.status}`
        );
      }

      const contentLength = response.headers.get("content-length");

      if (contentLength) {
        const declaredSize = Number(contentLength);

        if (
          !Number.isFinite(declaredSize) ||
          declaredSize <= 0 ||
          declaredSize > MAX_ASSET_BYTES
        ) {
          throw new Error(
            `Generated ${asset.side} asset exceeds the ${MAX_ASSET_BYTES} byte limit`
          );
        }
      }

      const bytes = new Uint8Array(await response.arrayBuffer());

      if (bytes.length === 0) {
        throw new Error(`Generated ${asset.side} asset is empty`);
      }

      if (bytes.length > MAX_ASSET_BYTES) {
        throw new Error(
          `Generated ${asset.side} asset exceeds the ${MAX_ASSET_BYTES} byte limit`
        );
      }

      assertDownloadedImageMatches(asset, bytes);

      const extension = getExtension(asset.mimeType);

      const storagePath = buildCustomCoverStoragePath({
        customerId: input.customerId,
        customizationId: input.customizationId,
        generationId: input.generationId,
        side: asset.side,
        kind: "preview",
        extension,
      });

      const bucket = getCustomCoverStorageBucket("preview");

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, bytes, {
          contentType: asset.mimeType,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(
          `Failed to store generated ${asset.side} asset: ${uploadError.message}`
        );
      }

      let assetId: string;

      try {
        const assetRecord = await createCustomCoverAssetRecord(
          supabase,
          {
            customizationId: input.customizationId,
            side: asset.side,
            kind: "preview",
            storagePath,
            width: asset.width,
            height: asset.height,
            mimeType: asset.mimeType,
            fileSize: bytes.length,
            metadata: asset.metadata ?? {},
          }
        );

        assetId = assetRecord.id;
      } catch (error) {
        try {
          await supabase.storage
            .from(bucket)
            .remove([storagePath]);
        } catch (cleanupError) {
          console.error(
            `[AI assets] Failed to remove orphaned storage object ${storagePath}`,
            cleanupError
          );
        }

        throw error;
      }

      createdAssets.push({
        id: assetId,
        storagePath,
      });

      ingestedAssets.push({
        id: assetId,
        side: asset.side,
        storagePath,
        width: asset.width,
        height: asset.height,
        mimeType: asset.mimeType,
        fileSize: bytes.length,
      });
    }

    return {
      assets: ingestedAssets,
      frontAssetId: getAssetIdBySide(ingestedAssets, "front"),
      insideFrontAssetId: getAssetIdBySide(
        ingestedAssets,
        "insideFront"
      ),
      insideBackAssetId: getAssetIdBySide(
        ingestedAssets,
        "insideBack"
      ),
      backAssetId: getAssetIdBySide(ingestedAssets, "back"),
    };
  } catch (error) {
    await cleanupIngestedAssets(supabase, createdAssets);
    throw error;
  }
}
