import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin-auth";
import { createSupabaseAdminClient } from "@/app/lib/supabase";
import { sendOrderStatusEmail } from "@/app/services/orders/order-email";
import { hasCompleteCustomCoverProduction } from "@/app/services/customization/production/generate-order";

const PRODUCTION_FIELDS = [
  "product_printed",
  "cover_verified",
  "notebook_assembled",
  "quality_checked",
  "packed",
] as const;

type ProductionField = (typeof PRODUCTION_FIELDS)[number];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await requireAdmin();

    const { orderId } = await params;

    const body = (await request.json()) as {
      field?: string;
      value?: boolean;
    };

    if (
      !body.field ||
      typeof body.value !== "boolean"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid checklist update.",
        },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
          id,
          order_id,
          name,
          email,
          payment_method,
          payment_status,
          order_status,
          total,
          delivery,
          product_printed,
          cover_verified,
          notebook_assembled,
          quality_checked,
          packed,
          production_completed_at,
          custom_cover_id
        `
      )
      .eq("order_id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          success: false,
          error: orderError?.message || "Order not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Courier handover is intentionally kept separate from
     * production. Existing UI can still send this field while
     * the shipping system is being migrated.
     */
    if (body.field === "handed_over") {
      if (body.value !== true) {
        return NextResponse.json(
          {
            success: false,
            error: "Courier handover cannot be reversed.",
          },
          { status: 409 }
        );
      }

      const productionComplete =
        order.product_printed &&
        order.cover_verified &&
        order.notebook_assembled &&
        order.quality_checked &&
        order.packed;

      if (!productionComplete) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Complete all five production steps before handing the parcel over.",
          },
          { status: 409 }
        );
      }

      const { data: shipment, error: shipmentError } = await supabase
        .from("shipments")
        .select(
          "id,status,handed_over,shipped_at"
        )
        .eq("order_id", order.id)
        .maybeSingle();

      if (shipmentError) {
        return NextResponse.json(
          {
            success: false,
            error: shipmentError.message,
          },
          { status: 500 }
        );
      }

      if (!shipment) {
        return NextResponse.json(
          {
            success: false,
            error:
              "No shipment exists yet. Complete production and let shipping automation create the shipment first.",
          },
          { status: 409 }
        );
      }

      if (shipment.handed_over) {
        return NextResponse.json({
          success: true,
          handedOver: true,
          shipment,
        });
      }

      if (shipment.status !== "ready_for_pickup") {
        return NextResponse.json(
          {
            success: false,
            error:
              "Shipment is not ready for courier handover yet.",
          },
          { status: 409 }
        );
      }

      const now = new Date().toISOString();

      const { data: updatedShipment, error: shipmentUpdateError } =
        await supabase
          .from("shipments")
          .update({
            handed_over: true,
            status: "picked_up",
            shipped_at: now,
            checklist_updated_at: now,
          })
          .eq("id", shipment.id)
          .select(
            "id,status,handed_over,shipped_at,tracking_url,awb"
          )
          .single();

      if (shipmentUpdateError || !updatedShipment) {
        return NextResponse.json(
          {
            success: false,
            error:
              shipmentUpdateError?.message ||
              "Unable to update shipment handover.",
          },
          { status: 500 }
        );
      }

      const { data: updatedOrder, error: updatedOrderError } =
        await supabase
          .from("orders")
          .update({
            order_status: "shipped",
            shipped_at: now,
          })
          .eq("id", order.id)
          .select(
            "order_id,name,email,payment_method,total,delivery"
          )
          .single();

      if (updatedOrderError || !updatedOrder) {
        return NextResponse.json(
          {
            success: false,
            error:
              updatedOrderError?.message ||
              "Shipment was updated but order status could not be updated.",
          },
          { status: 500 }
        );
      }

      const emailSent = await sendOrderStatusEmail({
        orderId: updatedOrder.order_id,
        name: updatedOrder.name,
        email: updatedOrder.email,
        paymentMethod: updatedOrder.payment_method,
        orderStatus: "shipped",
        total: updatedOrder.total,
        delivery: updatedOrder.delivery || "Standard delivery",
      });

      return NextResponse.json({
        success: true,
        handedOver: true,
        shipment: updatedShipment,
        emailSent,
      });
    }

    if (
      !PRODUCTION_FIELDS.includes(
        body.field as ProductionField
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid production checklist field.",
        },
        { status: 400 }
      );
    }

    if (
      order.production_completed_at &&
      body.value === false
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Production is already completed and cannot be reopened.",
        },
        { status: 409 }
      );
    }

    if (
      body.field === "product_printed" &&
      body.value === true &&
      order.custom_cover_id
    ) {
      let productionReady = false;

      try {
        productionReady =
          await hasCompleteCustomCoverProduction(
            order.order_id,
          );
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Unable to verify custom cover production files.",
          },
          { status: 500 },
        );
      }

      if (!productionReady) {
        return NextResponse.json(
          {
            success: false,
            error:
              "All four custom cover production files must exist and match the selected print format before Product Printed can be completed.",
          },
          { status: 409 },
        );
      }
    }

    const now = new Date().toISOString();

    const nextChecklist = {
      product_printed:
        body.field === "product_printed"
          ? body.value
          : order.product_printed,
      cover_verified:
        body.field === "cover_verified"
          ? body.value
          : order.cover_verified,
      notebook_assembled:
        body.field === "notebook_assembled"
          ? body.value
          : order.notebook_assembled,
      quality_checked:
        body.field === "quality_checked"
          ? body.value
          : order.quality_checked,
      packed:
        body.field === "packed"
          ? body.value
          : order.packed,
    };

    const productionComplete =
      nextChecklist.product_printed &&
      nextChecklist.cover_verified &&
      nextChecklist.notebook_assembled &&
      nextChecklist.quality_checked &&
      nextChecklist.packed;

    const update: Record<string, unknown> = {
      [body.field]: body.value,
      production_checklist_updated_at: now,
    };

    if (productionComplete) {
      update.production_completed_at =
        order.production_completed_at || now;
    }

    const { data: updatedOrder, error: updateError } =
      await supabase
        .from("orders")
        .update(update)
        .eq("id", order.id)
        .select(
          `
            id,
            order_id,
            order_status,
            payment_status,
            product_printed,
            cover_verified,
            notebook_assembled,
            quality_checked,
            packed,
            production_checklist_updated_at,
            production_completed_at,
          custom_cover_id
          `
        )
        .single();

    if (updateError || !updatedOrder) {
      return NextResponse.json(
        {
          success: false,
          error:
            updateError?.message ||
            "Unable to update production checklist.",
        },
        { status: 500 }
      );
    }

    /*
     * Production completion no longer schedules courier pickup.
     * Shipment preparation remains automated, but final pickup
     * authorization belongs to Admin in Shipping Control.
     */
    let shippingAttempted = false;
    let shippingError: string | null = null;

    if (
      productionComplete &&
      !order.production_completed_at &&
      order.payment_status === "paid" &&
      ["confirmed", "processing"].includes(order.order_status)
    ) {
      /*
       * Intentionally do not call automateOrderShipping() here.
       * Shipping Control owns the explicit shipment-preparation
       * action so courier pickup can never happen silently.
       */
      shippingAttempted = false;
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      productionComplete,
      shippingAttempted,
      shippingError,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update production checklist.",
      },
      { status: 500 }
    );
  }
}
