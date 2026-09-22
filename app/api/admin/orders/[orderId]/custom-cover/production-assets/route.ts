import { NextResponse } from "next/server";

import { requireAdminApi } from "@/app/lib/admin-auth";
import { createSupabaseAdminClient } from "@/app/lib/supabase";
import { getCustomCoverStorageBucket } from "@/app/services/ai/persistence/storage";

const PRODUCTION_SIDES = [
  "front",
  "insideFront",
  "insideBack",
  "back",
] as const;

type ProductionSide = (typeof PRODUCTION_SIDES)[number];

const SIDE_LABELS: Record<ProductionSide, string> = {
  front: "Front Cover",
  insideFront: "Inside Front",
  insideBack: "Inside Back",
  back: "Back Cover",
};

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ orderId: string }>;
  },
) {
  const auth = await requireAdminApi();

  if (auth.error) {
    return NextResponse.json(
      {
        success: false,
        error: auth.error,
      },
      { status: auth.status },
    );
  }

  const { orderId } = await context.params;

  if (!orderId) {
    return NextResponse.json(
      {
        success: false,
        error: "Order ID is required.",
      },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id,order_id,custom_cover_id,custom_cover_snapshot",
    )
    .eq("order_id", orderId)
    .maybeSingle();

  if (orderError) {
    return NextResponse.json(
      {
        success: false,
        error: orderError.message,
      },
      { status: 500 },
    );
  }

  if (!order) {
    return NextResponse.json(
      {
        success: false,
        error: "Order not found.",
      },
      { status: 404 },
    );
  }

  if (!order.custom_cover_id) {
    return NextResponse.json({
      success: true,
      custom: false,
      ready: true,
      assets: [],
    });
  }

  const snapshot = order.custom_cover_snapshot as {
    customization?: {
      id?: string;
    };
  } | null;

  /*
   * Production Control must never fall back to a mutable
   * customization/editor state. The ordered immutable snapshot
   * is the only valid source for production artwork.
   */
  if (!snapshot?.customization?.id) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Immutable custom cover snapshot is missing from this order.",
      },
      { status: 409 },
    );
  }

  if (
    snapshot.customization.id !== order.custom_cover_id
  ) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Immutable custom cover snapshot does not match the order.",
      },
      { status: 409 },
    );
  }

  const { data: rows, error: assetError } = await supabase
    .from("custom_cover_assets")
    .select(
      "id,side,kind,storage_path,width,height,mime_type,file_size,metadata,created_at",
    )
    .eq("customization_id", order.custom_cover_id)
    .eq("kind", "production");

  if (assetError) {
    return NextResponse.json(
      {
        success: false,
        error: `Unable to load production cover assets: ${assetError.message}`,
      },
      { status: 500 },
    );
  }

  const bucket = getCustomCoverStorageBucket("production");

  const assets = [];

  for (const side of PRODUCTION_SIDES) {
    const row = (rows ?? []).find(
      (candidate) => candidate.side === side,
    );

    if (!row) {
      continue;
    }

    const metadata =
      row.metadata &&
      typeof row.metadata === "object" &&
      !Array.isArray(row.metadata)
        ? row.metadata as Record<string, unknown>
        : {};

    /*
     * Production assets are generated from the immutable
     * order snapshot. Keep this explicit in the admin response
     * so production never mistakes a customer draft/preview
     * for the final ordered artwork.
     */
    if (
      metadata.source !== "immutable_order_snapshot"
    ) {
      continue;
    }

    const { data: signed, error: signedError } =
      await supabase.storage
        .from(bucket)
        .createSignedUrl(row.storage_path, 60 * 60);

    if (signedError || !signed?.signedUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            signedError?.message ??
            `Unable to create secure preview for ${side}.`,
        },
        { status: 500 },
      );
    }

    assets.push({
      id: row.id,
      side,
      label: SIDE_LABELS[side],
      url: signed.signedUrl,
      width: row.width,
      height: row.height,
      mime_type: row.mime_type,
      file_size: row.file_size,
      created_at: row.created_at,
      source: metadata.source,
    });
  }

  return NextResponse.json({
    success: true,
    custom: true,
    ready: assets.length === PRODUCTION_SIDES.length,
    expectedSides: PRODUCTION_SIDES,
    assets,
  });
}
