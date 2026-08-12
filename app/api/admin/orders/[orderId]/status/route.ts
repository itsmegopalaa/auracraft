import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin-auth";
import { createClient } from "@/utils/supabase/server";

const ALLOWED_STATUSES = [
  "placed",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

type Status = (typeof ALLOWED_STATUSES)[number];

export async function PATCH(
  request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    await requireAdmin();

    const { orderId } = await context.params;
    const body = await request.json();
    const status = body.orderStatus as Status;

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid order status.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: order, error } = await supabase
      .from("orders")
      .update({
        order_status: status,
      })
      .eq("order_id", orderId)
      .select("order_id, order_status")
      .single();

    if (error) {
      console.error("ADMIN ORDER STATUS ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("ADMIN STATUS API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update order status.",
      },
      { status: 500 }
    );
  }
}
