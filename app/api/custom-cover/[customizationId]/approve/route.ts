import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/app/lib/supabase";
import { createSupabaseAdminClient } from "@/app/lib/supabase";

type RouteContext = {
  params: Promise<{
    customizationId: string;
  }>;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

export async function POST(
  _request: Request,
  { params }: RouteContext
) {
  const { customizationId } = await params;

  if (!isUuid(customizationId)) {
    return NextResponse.json(
      { error: "Invalid customization ID." },
      { status: 400 }
    );
  }

  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const { data: customization, error } = await supabase
      .from("custom_cover_customizations")
      .select(
        "id, customer_id, product_id, creation_method, status, template_id, design"
      )
      .eq("id", customizationId)
      .eq("customer_id", user.id)
      .single();

    if (error || !customization) {
      return NextResponse.json(
        { error: "Customization not found." },
        { status: 404 }
      );
    }

    if (customization.status !== "draft") {
      return NextResponse.json(
        {
          error:
            "This customization can no longer be approved.",
        },
        { status: 409 }
      );
    }

    const { data: product, error: productError } =
      await supabase
        .from("products")
        .select("id, name, price, active")
        .eq("id", customization.product_id)
        .eq("active", true)
        .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Product is unavailable." },
        { status: 409 }
      );
    }

    if (
      customization.creation_method === "ai" ||
      customization.creation_method === "upload"
    ) {
      const admin = createSupabaseAdminClient();

      const { data: assets, error: assetError } = await admin
        .from("custom_cover_assets")
        .select("id, side, kind, width, height, storage_path")
        .eq("customization_id", customizationId)
        .in("kind", ["original", "preview"]);

      if (assetError) {
        console.error(
          "CUSTOM COVER APPROVAL ASSET LOOKUP FAILED:",
          assetError
        );

        return NextResponse.json(
          { error: "Unable to validate cover artwork." },
          { status: 500 }
        );
      }

      const front = assets?.some(
        (asset) => asset.side === "front"
      );

      const insideFront = assets?.some(
        (asset) => asset.side === "insideFront"
      );

      const back = assets?.some(
        (asset) => asset.side === "back"
      );

      const insideBack = assets?.some(
        (asset) => asset.side === "insideBack"
      );

      if (!front || !insideFront || !back || !insideBack) {
        return NextResponse.json(
          {
            error:
              "Front, inside front, back, and inside back cover artwork are required before approval.",
          },
          { status: 400 }
        );
      }
    }

    const now = new Date().toISOString();

    const admin = createSupabaseAdminClient();

    const { data: approved, error: updateError } =
      await admin
        .from("custom_cover_customizations")
        .update({
          status: "customer_approved",
          customer_approved_by: user.id,
          customer_approved_at: now,
          updated_at: now,
        })
        .eq("id", customizationId)
        .eq("customer_id", user.id)
        .eq("status", "draft")
        .select(
          "id, product_id, creation_method, status, template_id, customer_name, customer_text, design, print_spec, customer_approved_at"
        )
        .single();

    if (updateError || !approved) {
      console.error(
        "CUSTOM COVER APPROVAL UPDATE FAILED:",
        updateError
      );

      return NextResponse.json(
        { error: "Unable to approve custom cover." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      customization: approved,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
      },
    });
  } catch (error) {
    console.error("CUSTOM COVER APPROVAL FAILED:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to approve custom cover.",
      },
      { status: 500 }
    );
  }
}
