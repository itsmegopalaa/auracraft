import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin-auth";
import { createSupabaseAdminClient } from "@/app/lib/supabase";
import { sendOrderStatusEmail } from "@/app/services/orders/order-email";

const ALLOWED_FIELDS = [
  "product_printed",
  "cover_verified",
  "notebook_assembled",
  "quality_checked",
  "packed",
  "handed_over",
] as const;

type ChecklistField = (typeof ALLOWED_FIELDS)[number];

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
      !ALLOWED_FIELDS.includes(body.field as ChecklistField) ||
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

    const { data: shipment, error: shipmentError } = await supabase
      .from("shipments")
      .select(
        "id, status, product_printed, cover_verified, notebook_assembled, quality_checked, packed, handed_over"
      )
      .eq("order_id", orderId)
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
          error: "No automated shipment exists for this order.",
        },
        { status: 404 }
      );
    }

    if (
      shipment.handed_over &&
      body.field !== "handed_over" &&
      shipment.status !== "ready_for_pickup"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Production checklist is locked after courier handover.",
        },
        { status: 409 }
      );
    }

    if (
      shipment.handed_over &&
      body.field === "handed_over" &&
      body.value === false
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Courier handover cannot be reversed after shipment.",
        },
        { status: 409 }
      );
    }

    if (body.field === "handed_over" && body.value === true) {
      const productionComplete =
        shipment.product_printed &&
        shipment.cover_verified &&
        shipment.notebook_assembled &&
        shipment.quality_checked &&
        shipment.packed;

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
    }

    const now = new Date().toISOString();

    const update: Record<string, unknown> = {
      [body.field]: body.value,
      checklist_updated_at: now,
    };

    if (body.field === "handed_over" && body.value === true) {
      update.status = "picked_up";
      update.shipped_at = now;
    }

    const { data, error } = await supabase
      .from("shipments")
      .update(update)
      .eq("id", shipment.id)
      .select(
        "id, status, product_printed, cover_verified, notebook_assembled, quality_checked, packed, handed_over, checklist_updated_at, shipped_at"
      )
      .single();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    if (body.field === "handed_over" && body.value === true) {
      const { data: updatedOrder, error: orderError } = await supabase
        .from("orders")
        .update({
          order_status: "shipped",
          shipped_at: now,
        })
        .eq("order_id", orderId)
        .select(
          "order_id, name, email, payment_method, total, delivery"
        )
        .single();

      if (orderError || !updatedOrder) {
        return NextResponse.json(
          {
            success: false,
            error:
              orderError?.message ||
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
        shipment: data,
        emailSent,
      });
    }

    return NextResponse.json({
      success: true,
      shipment: data,
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
