import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { createSupabaseAdminClient } from "@/app/lib/supabase";

export async function GET() {
  try {
    await requireAdminApi();

    const supabase = createSupabaseAdminClient();

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(
        `
          id,
          order_id,
          name,
          payment_status,
          order_status,
          total,
          custom_cover_id,
          product_printed,
          cover_verified,
          notebook_assembled,
          quality_checked,
          packed,
          production_checklist_updated_at,
          production_completed_at
        `,
      )
      .eq("payment_status", "paid")
      .in("order_status", ["confirmed", "processing"])
      .is("production_completed_at", null)
      .order("created_at", { ascending: true });

    if (ordersError) {
      return NextResponse.json(
        {
          success: false,
          error: ordersError.message,
        },
        { status: 500 },
      );
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: true,
        orders: [],
      });
    }

    const orderIds = orders.map((order) => order.id);

    const { data: assignments, error: assignmentsError } =
      await supabase
        .from("production_batch_orders")
        .select("order_id")
        .in("order_id", orderIds)
        .is("completed_at", null);

    if (assignmentsError) {
      return NextResponse.json(
        {
          success: false,
          error: assignmentsError.message,
        },
        { status: 500 },
      );
    }

    const assignedOrderIds = new Set(
      (assignments ?? []).map((assignment) => assignment.order_id),
    );

    const availableOrders = orders.filter(
      (order) => !assignedOrderIds.has(order.id),
    );

    return NextResponse.json({
      success: true,
      orders: availableOrders,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unauthorized";

    const status =
      message.toLowerCase().includes("forbidden")
        ? 403
        : message.toLowerCase().includes("unauthorized")
          ? 401
          : 500;

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status },
    );
  }
}
