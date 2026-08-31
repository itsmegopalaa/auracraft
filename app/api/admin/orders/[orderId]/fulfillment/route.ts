import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { createServerSupabaseClient } from "@/app/lib/supabase";

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const adminAuth = await requireAdminApi();

    if (adminAuth.error) {
      return NextResponse.json(
        {
          success: false,
          error: adminAuth.error,
        },
        { status: adminAuth.status }
      );
    }

    const { orderId } = await context.params;
    const body = await request.json();

    const shippingPartner =
      typeof body.shipping_partner === "string"
        ? body.shipping_partner.trim()
        : "";

    const trackingId =
      typeof body.tracking_id === "string"
        ? body.tracking_id.trim()
        : "";

    const trackingUrl =
      typeof body.tracking_url === "string"
        ? body.tracking_url.trim()
        : "";

    if (!shippingPartner) {
      return NextResponse.json(
        {
          success: false,
          error: "Shipping partner is required.",
        },
        { status: 400 }
      );
    }

    if (!trackingId) {
      return NextResponse.json(
        {
          success: false,
          error: "Tracking ID is required.",
        },
        { status: 400 }
      );
    }

    if (!trackingUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Tracking URL is required.",
        },
        { status: 400 }
      );
    }

    if (!isValidUrl(trackingUrl)) {
      return NextResponse.json(
        {
          success: false,
          error: "Tracking URL must be a valid HTTP or HTTPS URL.",
        },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const { data: existingOrder, error: existingOrderError } =
      await supabase
        .from("orders")
        .select(
          "order_id, order_status, shipping_partner, tracking_id, tracking_url, shipped_at, delivered_at"
        )
        .eq("order_id", orderId)
        .maybeSingle();

    if (existingOrderError) {
      console.error(
        "ADMIN FULFILLMENT LOAD ERROR:",
        existingOrderError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to load order.",
        },
        { status: 500 }
      );
    }

    if (!existingOrder) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    const updateData: {
      shipping_partner: string;
      tracking_id: string;
      tracking_url: string;
      shipped_at?: string;
      delivered_at?: string;
    } = {
      shipping_partner: shippingPartner,
      tracking_id: trackingId,
      tracking_url: trackingUrl,
    };

    if (
      existingOrder.order_status === "shipped" &&
      !existingOrder.shipped_at
    ) {
      updateData.shipped_at = new Date().toISOString();
    }

    if (
      existingOrder.order_status === "delivered" &&
      !existingOrder.shipped_at
    ) {
      updateData.shipped_at = new Date().toISOString();
    }

    if (
      existingOrder.order_status === "delivered" &&
      !existingOrder.delivered_at
    ) {
      updateData.delivered_at = new Date().toISOString();
    }

    const { data: order, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("order_id", orderId)
      .select(
        "order_id, order_status, shipping_partner, tracking_id, tracking_url, shipped_at, delivered_at"
      )
      .single();

    if (error) {
      console.error("ADMIN FULFILLMENT UPDATE ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Unable to update fulfillment details.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
      message: "Fulfillment details updated successfully.",
    });
  } catch (error) {
    console.error("ADMIN FULFILLMENT API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update fulfillment details.",
      },
      { status: 500 }
    );
  }
}
