import { NextResponse } from "next/server";

import { requireAdminApi } from "@/app/lib/admin-auth";
import { createSupabaseAdminClient } from "@/app/lib/supabase";

const COVER_SIDES = [
  "front",
  "insideFront",
  "insideBack",
  "back",
] as const;

type CoverSide = (typeof COVER_SIDES)[number];

type CustomizationRow = {
  id: string;
  customer_id: string | null;
  product_id: number | null;
  creation_method: string;
  status: string;
  version: number;
  template_id: string | null;
  customer_name: string | null;
  customer_text: string | null;
  physical_config: Record<string, unknown> | null;
  customer_approved_at: string | null;
  admin_approved_at: string | null;
  admin_approved_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};

type ProductRow = {
  id: number;
  name: string;
  image: string | null;
  active: boolean;
};

type OrderRow = {
  id: string;
  order_id: string;
  custom_cover_id: string | null;
  name: string;
  email: string;
  phone: string;
  total: number | string;
  payment_status: string;
  order_status: string;
  created_at: string;
};

type AssetRow = {
  id: string;
  customization_id: string;
  side: string;
  kind: "original" | "preview";
  storage_path: string;
  width: number | null;
  height: number | null;
  mime_type: string;
  created_at: string;
};

function isCoverSide(value: unknown): value is CoverSide {
  return (
    typeof value === "string" &&
    COVER_SIDES.includes(value as CoverSide)
  );
}

function bucketForKind(kind: AssetRow["kind"]) {
  return kind === "original"
    ? "custom-cover-uploads"
    : "custom-cover-previews";
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

    const {
      data: rawCustomizations,
      error: customizationError,
    } = await supabase
      .from("custom_cover_customizations")
      .select(
        "id, customer_id, product_id, creation_method, status, version, template_id, customer_name, customer_text, physical_config, customer_approved_at, admin_approved_at, admin_approved_by, rejection_reason, created_at, updated_at",
      )
      .order("updated_at", { ascending: false })
      .limit(500);

    if (customizationError) {
      console.error(
        "ADMIN CUSTOM COVER CUSTOMIZATIONS FAILED:",
        customizationError,
      );

      return NextResponse.json(
        { error: "Unable to load custom covers." },
        { status: 500 },
      );
    }

    const customizations =
      (rawCustomizations ?? []) as unknown as CustomizationRow[];

    const customizationIds = customizations.map(
      (row) => row.id,
    );

    const productIds = [
      ...new Set(
        customizations
          .map((row) => row.product_id)
          .filter(
            (id): id is number =>
              typeof id === "number",
          ),
      ),
    ];

    let products: ProductRow[] = [];
    let orders: OrderRow[] = [];
    let assets: AssetRow[] = [];

    if (productIds.length > 0) {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, image, active")
        .in("id", productIds);

      if (error) {
        console.error(
          "ADMIN CUSTOM COVER PRODUCTS FAILED:",
          error,
        );

        return NextResponse.json(
          { error: "Unable to load custom cover products." },
          { status: 500 },
        );
      }

      products = (data ?? []) as unknown as ProductRow[];
    }

    if (customizationIds.length > 0) {
      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, order_id, custom_cover_id, name, email, phone, total, payment_status, order_status, created_at",
        )
        .in("custom_cover_id", customizationIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          "ADMIN CUSTOM COVER ORDERS FAILED:",
          error,
        );

        return NextResponse.json(
          { error: "Unable to load custom cover orders." },
          { status: 500 },
        );
      }

      orders = (data ?? []) as unknown as OrderRow[];

      const { data: assetData, error: assetError } =
        await supabase
          .from("custom_cover_assets")
          .select(
            "id, customization_id, side, kind, storage_path, width, height, mime_type, created_at",
          )
          .in("customization_id", customizationIds)
          .in("kind", ["original", "preview"])
          .order("created_at", { ascending: false });

      if (assetError) {
        console.error(
          "ADMIN CUSTOM COVER ASSETS FAILED:",
          assetError,
        );

        return NextResponse.json(
          { error: "Unable to load custom cover artwork." },
          { status: 500 },
        );
      }

      assets = (assetData ?? []) as unknown as AssetRow[];
    }

    const productMap = new Map(
      products.map((product) => [
        String(product.id),
        product,
      ]),
    );

    const orderMap = new Map<string, OrderRow>();

    for (const order of orders) {
      if (
        order.custom_cover_id &&
        !orderMap.has(order.custom_cover_id)
      ) {
        orderMap.set(order.custom_cover_id, order);
      }
    }

    const assetMap = new Map<string, AssetRow>();

    for (const asset of assets) {
      if (!isCoverSide(asset.side)) continue;

      const key = `${asset.customization_id}:${asset.side}`;

      if (!assetMap.has(key)) {
        assetMap.set(key, asset);
      }
    }

    const items = await Promise.all(
      customizations.map(async (customization) => {
        const order =
          orderMap.get(customization.id) ?? null;

        const product =
          customization.product_id !== null
            ? productMap.get(
                String(customization.product_id),
              ) ?? null
            : null;

        const artwork = await Promise.all(
          COVER_SIDES.map(async (side) => {
            const asset =
              assetMap.get(
                `${customization.id}:${side}`,
              ) ?? null;

            if (!asset) {
              return {
                side,
                asset: null,
              };
            }

            const { data: signedData } =
              await supabase.storage
                .from(bucketForKind(asset.kind))
                .createSignedUrl(
                  asset.storage_path,
                  60 * 60,
                );

            return {
              side,
              asset: {
                id: asset.id,
                kind: asset.kind,
                width: asset.width,
                height: asset.height,
                mimeType: asset.mime_type,
                url: signedData?.signedUrl ?? null,
              },
            };
          }),
        );

        return {
          id: customization.id,
          customerId: customization.customer_id,
          productId: customization.product_id,
          creationMethod: customization.creation_method,
          status: customization.status,
          version: customization.version,
          templateId: customization.template_id,
          customerName:
            customization.customer_name ||
            order?.name ||
            "Customer",
          customerText: customization.customer_text,
          physicalConfig:
            customization.physical_config ?? {},
          customerApprovedAt:
            customization.customer_approved_at,
          adminApprovedAt:
            customization.admin_approved_at,
          adminApprovedBy:
            customization.admin_approved_by,
          rejectionReason:
            customization.rejection_reason,
          createdAt: customization.created_at,
          updatedAt: customization.updated_at,

          product: product
            ? {
                id: product.id,
                name: product.name,
                image: product.image,
                active: product.active,
              }
            : null,

          order: order
            ? {
                id: order.id,
                orderId: order.order_id,
                name: order.name,
                email: order.email,
                phone: order.phone,
                total: Number(order.total),
                paymentStatus:
                  order.payment_status,
                orderStatus: order.order_status,
                createdAt: order.created_at,
              }
            : null,

          artwork,

          artworkComplete: artwork.every(
            (item) => Boolean(item.asset?.url),
          ),
        };
      }),
    );

    return NextResponse.json({
      items,
      summary: {
        total: items.length,
        customerApproved: items.filter(
          (item) =>
            item.status === "customer_approved",
        ).length,
        adminReview: items.filter(
          (item) => item.status === "admin_review",
        ).length,
        approvedForPrint: items.filter(
          (item) =>
            item.status === "approved_for_print",
        ).length,
        rejected: items.filter(
          (item) => item.status === "rejected",
        ).length,
      },
    });
  } catch (error) {
    console.error(
      "ADMIN CUSTOM COVER LIST ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load custom covers.",
      },
      { status: 500 },
    );
  }
}
