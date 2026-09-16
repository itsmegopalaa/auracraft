import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { createServerSupabaseClient } from "@/app/lib/supabase";

type RouteContext = {
  params: Promise<{
    batchId: string;
    shipmentId: string;
  }>;
};

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext,
) {
  try {
    await requireAdminApi();

    const { batchId, shipmentId } = await params;
    const supabase = await createServerSupabaseClient();

    const { data: batch, error: batchError } = await supabase
      .from("production_batches")
      .select("id,status")
      .eq("id", batchId)
      .single();

    if (batchError || !batch) {
      return NextResponse.json(
        { error: "Production batch not found" },
        { status: 404 },
      );
    }

    if (batch.status !== "draft") {
      return NextResponse.json(
        {
          error:
            "Shipments can only be removed from a draft production batch",
        },
        { status: 409 },
      );
    }

    const { data: assignment, error: assignmentError } = await supabase
      .from("production_batch_shipments")
      .select("id,shipment_id,completed_at")
      .eq("batch_id", batchId)
      .eq("shipment_id", shipmentId)
      .maybeSingle();

    if (assignmentError) {
      return NextResponse.json(
        { error: assignmentError.message },
        { status: 500 },
      );
    }

    if (!assignment) {
      return NextResponse.json(
        { error: "Shipment is not assigned to this batch" },
        { status: 404 },
      );
    }

    if (assignment.completed_at) {
      return NextResponse.json(
        { error: "Completed shipment assignments cannot be removed" },
        { status: 409 },
      );
    }

    const { error: deleteError } = await supabase
      .from("production_batch_shipments")
      .delete()
      .eq("id", assignment.id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      shipmentId,
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

    return NextResponse.json({ error: message }, { status });
  }
}
