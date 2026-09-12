import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { createServerSupabaseClient } from "@/app/lib/supabase";

const PRODUCT_SELECT =
  "id, name, price, description, category, image, stock, active, rating, bestseller, featured, new_arrival, pages, paper, size, theme, badge, shipping_weight_grams, package_length_cm, package_width_cm, package_height_cm, created_at, updated_at";

function isValidUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value.trim()
    )
  );
}

function positiveNumber(
  value: unknown,
  field: string
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    throw new Error(`${field} must be a positive number.`);
  }

  return value;
}

export async function PATCH(request: Request) {
  const adminAuth = await requireAdminApi();

  if (adminAuth.error) {
    return NextResponse.json(
      { error: adminAuth.error },
      { status: adminAuth.status }
    );
  }

  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const ids = (body as Record<string, unknown>).productIds;
    const shipping = (body as Record<string, unknown>).shipping;

    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      ids.some((id) => !isValidUuid(id))
    ) {
      return NextResponse.json(
        { error: "At least one valid product ID is required." },
        { status: 400 }
      );
    }

    if (!shipping || typeof shipping !== "object") {
      return NextResponse.json(
        { error: "Shipping details are required." },
        { status: 400 }
      );
    }

    const values = shipping as Record<string, unknown>;

    const shippingData = {
      shipping_weight_grams: positiveNumber(
        values.shipping_weight_grams,
        "Shipping weight"
      ),
      package_length_cm: positiveNumber(
        values.package_length_cm,
        "Package length"
      ),
      package_width_cm: positiveNumber(
        values.package_width_cm,
        "Package width"
      ),
      package_height_cm: positiveNumber(
        values.package_height_cm,
        "Package height"
      ),
      updated_at: new Date().toISOString(),
    };

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .update(shippingData)
      .in("id", ids)
      .select(PRODUCT_SELECT);

    if (error) {
      console.error("Bulk shipping update error:", error);

      return NextResponse.json(
        { error: "Unable to update shipping details." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      products: data ?? [],
      updatedCount: data?.length ?? 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update shipping details.",
      },
      { status: 400 }
    );
  }
}
