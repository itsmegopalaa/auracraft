import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { createSupabaseAdminClient } from "@/app/lib/supabase";

type RouteContext = {
  params: Promise<{
    batchId: string;
    orderId: string;
  }>;
};

export async function DELETE(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    await requireAdminApi();

    const { batchId, orderId } = await params;
    const supabase = createSupabaseAdminClient();

    const { data: batch, error: batchError } = await supabase
      .from("production_batches")
      .select("id, status")
      .eq("id", batchId)
      .single();

    if (batchError || !batch) {
      return NextResponse.json(
        { success: false, error: "Production batch not found." },
        { status: 404 },
      );
    }

    if (batch.status !== "draft") {
      return NextResponse.json(
        {
          success: false,
          error: "Orders can only be removed from a draft batch.",
        },
        { status: 409 },
      );
    }

    const { data: assignment, error: assignmentError } = await supabase
      .from("production_batch_orders")
      .select("id")
      .eq("batch_id", batchId)
      .eq("order_id", orderId)
      .is("completed_at", null)
      .maybeSingle();

    if (assignmentError) {
      return NextResponse.json(
        { success: false, error: assignmentError.message },
        { status: 500 },
      );
    }

    if (!assignment) {
      return NextResponse.json(
        {
          success: false,
          error: "Order is not assigned to this batch.",
        },
        { status: 404 },
      );
    }

    const { error: deleteError } = await supabase
      .from("production_batch_orders")
      .delete()
      .eq("id", assignment.id);

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order removed from production batch.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unauthorized";

    const status = message.toLowerCase().includes("forbidden")
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
