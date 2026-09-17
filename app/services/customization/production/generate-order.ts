import sharp from "sharp";

import { createSupabaseAdminClient } from "@/app/lib/supabase";
import {
  buildCustomCoverStoragePath,
  getCustomCoverStorageBucket,
} from "@/app/services/ai/persistence/storage";

import {
  renderDesignStateToProduction,
} from "./renderer";

import type {
  ProductionCoverSide,
  ProductionDesignState,
  ProductionOrientation,
  ProductionSize,
} from "./types";

const PRODUCTION_SIDES: ProductionCoverSide[] = [
  "front",
  "insideFront",
  "insideBack",
  "back",
];

type SnapshotAsset = {
  id: string;
  side: ProductionCoverSide;
  kind: "original" | "preview" | "production";
  storage_path: string;
  width?: number | null;
  height?: number | null;
  mime_type?: string | null;
  file_size?: number | null;
};

type OrderSnapshot = {
  customization?: {
    id: string;
    customer_id: string;
    product_id: string | null;
    customer_name?: string | null;
    customer_text?: string | null;
    design?: unknown;
    physical_config?: unknown;
  };
  assets?: SnapshotAsset[];
};

type PhysicalConfig = {
  size?: ProductionSize;
  orientation?: ProductionOrientation;
  quantity?: number;
};

function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function getPhysicalConfig(
  value: unknown,
): PhysicalConfig {
  if (!isObject(value)) {
    throw new Error(
      "Custom cover physical configuration is missing.",
    );
  }

  if (value.size !== "A4" && value.size !== "A5") {
    throw new Error(
      "Custom cover physical configuration has an invalid size.",
    );
  }

  if (
    value.orientation !== "portrait" &&
    value.orientation !== "landscape"
  ) {
    throw new Error(
      "Custom cover physical configuration has an invalid orientation.",
    );
  }

  if (
    !Number.isInteger(value.quantity) ||
    Number(value.quantity) < 1
  ) {
    throw new Error(
      "Custom cover physical configuration has an invalid quantity.",
    );
  }

  return {
    size: value.size,
    orientation: value.orientation,
    quantity: Number(value.quantity),
  };
}

function getSurfaces(
  design: unknown,
): Record<
  ProductionCoverSide,
  ProductionDesignState
> {
  if (!isObject(design)) {
    throw new Error(
      "Custom cover snapshot design is missing.",
    );
  }

  const result = {} as Record<
    ProductionCoverSide,
    ProductionDesignState
  >;

  for (const side of PRODUCTION_SIDES) {
    const surface = design[side];

    if (!isObject(surface)) {
      throw new Error(
        `Approved design is missing the ${side} surface.`,
      );
    }

    result[side] =
      surface as ProductionDesignState;
  }

  return result;
}

async function downloadAsset(
  supabase: ReturnType<
    typeof createSupabaseAdminClient
  >,
  asset: SnapshotAsset,
): Promise<Buffer> {
  const bucket =
    getCustomCoverStorageBucket(
      asset.kind === "preview"
        ? "preview"
        : "original",
    );

  const { data, error } =
    await supabase.storage
      .from(bucket)
      .download(asset.storage_path);

  if (error || !data) {
    throw new Error(
      `Unable to download custom cover asset ${asset.id}: ${
        error?.message ?? "asset not found"
      }`,
    );
  }

  return Buffer.from(
    await data.arrayBuffer(),
  );
}

async function validatePng(
  buffer: Buffer,
  expectedWidth: number,
  expectedHeight: number,
): Promise<void> {
  const metadata =
    await sharp(buffer).metadata();

  if (
    metadata.format !== "png" ||
    metadata.width !== expectedWidth ||
    metadata.height !== expectedHeight
  ) {
    throw new Error(
      `Invalid production output dimensions: expected ${expectedWidth}×${expectedHeight} PNG.`,
    );
  }
}

export async function generateCustomCoverProductionAssets(
  orderId: string,
): Promise<{
  customizationId: string;
  quantity: number;
  size: ProductionSize;
  orientation: ProductionOrientation;
  assetIds: string[];
}> {
  const supabase =
    createSupabaseAdminClient();

  const { data: order, error: orderError } =
    await supabase
      .from("orders")
      .select(
        "id,order_id,items,custom_cover_id,custom_cover_snapshot",
      )
      .eq("id", orderId)
      .single();

  if (orderError || !order) {
    throw new Error(
      orderError?.message ||
        "Order not found.",
    );
  }

  if (!order.custom_cover_id) {
    return {
      customizationId: "",
      quantity: 0,
      size: "A4",
      orientation: "portrait",
      assetIds: [],
    };
  }

  const snapshot =
    order.custom_cover_snapshot as OrderSnapshot | null;

  if (!snapshot?.customization) {
    throw new Error(
      "Immutable custom cover snapshot is missing.",
    );
  }

  const customization =
    snapshot.customization;

  if (
    customization.id !==
    order.custom_cover_id
  ) {
    throw new Error(
      "Custom cover snapshot does not match the order.",
    );
  }

  const physical =
    getPhysicalConfig(
      customization.physical_config,
    );

  const surfaces =
    getSurfaces(
      customization.design,
    );

  const snapshotAssets =
    (snapshot.assets ?? []).filter(
      (asset) =>
        asset.kind === "original" ||
        asset.kind === "preview",
    );

  const assetsById =
    new Map<string, SnapshotAsset>();

  for (const asset of snapshotAssets) {
    assetsById.set(
      asset.id,
      asset,
    );
  }

  /*
   * Load every image referenced by the immutable
   * approved design snapshot.
   */
  const requiredAssetIds =
    new Set<string>();

  for (const side of PRODUCTION_SIDES) {
    for (const element of surfaces[side].elements ?? []) {
      if (
        element.type === "image" &&
        element.assetId
      ) {
        requiredAssetIds.add(
          element.assetId,
        );
      }
    }
  }

  const assetBuffers: Record<
    string,
    {
      buffer: Buffer;
      mimeType?: string | null;
    }
  > = {};

  for (const assetId of requiredAssetIds) {
    const asset =
      assetsById.get(assetId);

    if (!asset) {
      throw new Error(
        `Approved design references asset ${assetId}, but that asset is not present in the immutable order snapshot.`,
      );
    }

    assetBuffers[assetId] = {
      buffer: await downloadAsset(
        supabase,
        asset,
      ),
      mimeType:
        asset.mime_type || "image/png",
    };
  }

  /*
   * Render every surface before touching the existing
   * production records. This keeps retries safe if
   * rendering fails halfway through.
   */
  const rendered: Array<{
    side: ProductionCoverSide;
    buffer: Buffer;
    width: number;
    height: number;
  }> = [];

  for (const side of PRODUCTION_SIDES) {
    const result =
      await renderDesignStateToProduction(
        surfaces[side],
        {
          size: physical.size!,
          orientation:
            physical.orientation!,
          assetBuffers,
        },
      );

    await validatePng(
      result.buffer,
      result.widthPx,
      result.heightPx,
    );

    rendered.push({
      side,
      buffer: result.buffer,
      width: result.widthPx,
      height: result.heightPx,
    });
  }

  /*
   * Verify that the custom-cover quantity in the
   * immutable snapshot matches the custom-cover line
   * item in the immutable order snapshot.
   */
  if (!Array.isArray(order.items)) {
    throw new Error(
      "Order items are missing.",
    );
  }

  const customCoverProductId =
    customization.product_id;

  const matchingItem =
    order.items.find(
      (item: unknown) => {
        if (!isObject(item)) {
          return false;
        }

        return (
          String(
            item.productId ??
              item.product_id ??
              "",
          ) ===
          String(
            customCoverProductId ?? "",
          )
        ) &&
          Number(item.quantity) ===
            physical.quantity;
      },
    );

  if (!matchingItem) {
    throw new Error(
      "Custom-cover quantity does not match the immutable order quantity.",
    );
  }

  /*
   * Production storage paths are deterministic and uploads use
   * upsert=true. The database has a unique production-side index,
   * so retries replace the logical production record instead of
   * accumulating duplicate rows.
   */
  const bucket =
    getCustomCoverStorageBucket(
      "production",
    );

  const createdIds: string[] = [];

  for (const item of rendered) {
    const storagePath =
      buildCustomCoverStoragePath({
        customerId:
          customization.customer_id,
        customizationId:
          customization.id,
        side: item.side,
        kind: "production",
        extension: "png",
      });

    const { error: uploadError } =
      await supabase.storage
        .from(bucket)
        .upload(
          storagePath,
          item.buffer,
          {
            contentType: "image/png",
            upsert: true,
          },
        );

    if (uploadError) {
      throw new Error(
        `Unable to save ${item.side} production file: ${uploadError.message}`,
      );
    }

    const { data: assetRow, error: assetError } =
      await supabase
        .from("custom_cover_assets")
        .upsert(
          {
            customization_id:
              customization.id,
            side: item.side,
            kind: "production",
            storage_path:
              storagePath,
            width: item.width,
            height: item.height,
            mime_type:
              "image/png",
            file_size:
              item.buffer.length,
            metadata: {
              source:
                "immutable_order_snapshot",
              orderId,
              quantity:
                physical.quantity,
              size:
                physical.size,
              orientation:
                physical.orientation,
              generatedAt:
                new Date().toISOString(),
            },
          },
          {
            onConflict:
              "customization_id,production_key",
          },
        )
        .select("id")
        .single();

    if (assetError || !assetRow) {
      throw new Error(
        `Unable to save ${item.side} production asset record: ${
          assetError?.message ??
          "unknown error"
        }`,
      );
    }

    createdIds.push(
      assetRow.id,
    );
  }

  return {
    customizationId:
      customization.id,
    quantity:
      physical.quantity!,
    size:
      physical.size!,
    orientation:
      physical.orientation!,
    assetIds:
      createdIds,
  };
}

export async function hasCompleteCustomCoverProduction(
  orderId: string,
): Promise<boolean> {
  const supabase =
    createSupabaseAdminClient();

  const { data: order, error } =
    await supabase
      .from("orders")
      .select(
        "id,custom_cover_id,custom_cover_snapshot",
      )
      .eq("order_id", orderId)
      .single();

  if (error || !order) {
    throw new Error(
      error?.message ||
        "Order not found.",
    );
  }

  if (!order.custom_cover_id) {
    return true;
  }

  const { data: assets, error: assetError } =
    await supabase
      .from("custom_cover_assets")
      .select(
        "id,side,kind,mime_type,width,height,metadata",
      )
      .eq(
        "customization_id",
        order.custom_cover_id,
      )
      .eq("kind", "production");

  if (assetError) {
    throw new Error(
      `Unable to verify production assets: ${assetError.message}`,
    );
  }

  const snapshot =
    order.custom_cover_snapshot as OrderSnapshot | null;

  const physical =
    getPhysicalConfig(
      snapshot?.customization
        ?.physical_config,
    );

  const expected =
    (() => {
      if (
        physical.size === "A4" &&
        physical.orientation ===
          "landscape"
      ) {
        return [3508, 2480];
      }

      if (
        physical.size === "A5" &&
        physical.orientation ===
          "landscape"
      ) {
        return [2480, 1748];
      }

      if (
        physical.size === "A5"
      ) {
        return [1748, 2480];
      }

      return [2480, 3508];
    })();

  const validAssets = (assets ?? []).filter(
    (asset) =>
      asset.kind === "production" &&
      asset.mime_type === "image/png" &&
      asset.width === expected[0] &&
      asset.height === expected[1],
  );

  if (validAssets.length < PRODUCTION_SIDES.length) {
    return false;
  }

  const assetBySide = new Map(
    validAssets.map((asset) => [
      asset.side,
      asset,
    ]),
  );

  for (const side of PRODUCTION_SIDES) {
    const asset = assetBySide.get(side);

    if (!asset) {
      return false;
    }

    const storagePath =
      buildCustomCoverStoragePath({
        customerId:
          snapshot?.customization?.customer_id ?? "",
        customizationId:
          order.custom_cover_id,
        side,
        kind: "production",
        extension: "png",
      });

    if (!storagePath) {
      return false;
    }

    const { data, error } =
      await supabase.storage
        .from(
          getCustomCoverStorageBucket(
            "production",
          ),
        )
        .download(storagePath);

    if (error || !data) {
      return false;
    }

    const buffer = Buffer.from(
      await data.arrayBuffer(),
    );

    try {
      await validatePng(
        buffer,
        expected[0],
        expected[1],
      );
    } catch {
      return false;
    }
  }

  return true;
}
