import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { createServerSupabaseClient } from "@/app/lib/supabase";

type RouteContext = {
  params: Promise<{ batchId: string }>;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    await requireAdminApi();

    const { batchId } = await params;
    const body = await request.json().catch(() => ({}));

    const shipmentIds = Array.isArray(body.shipmentIds)
      ? body.shipmentIds
      : body.shipmentId
        ? [body.shipmentId]
        : [];

    if (
      shipmentIds.length === 0 ||
      shipmentIds.some(
        (id: unknown) => typeof id !== "string" || !isUuid(id),
      )
    ) {
      return NextResponse.json(
        { error: "Valid shipmentId or shipmentIds is required" },
        { status: 400 },
      );
    }

    const uniqueShipmentIds = [...new Set(shipmentIds as string[])];
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
        { error: "Shipments can only be added to a draft batch" },
        { status: 409 },
      );
    }

    const { data: shipments, error: shipmentsError } = await supabase
      .from("shipments")
      .select("id,status")
      .in("id", uniqueShipmentIds);

    if (shipmentsError) {
      return NextResponse.json(
        { error: shipmentsError.message },
        { status: 500 },
      );
    }

    if (!shipments || shipments.length !== uniqueShipmentIds.length) {
      return NextResponse.json(
        { error: "One or more shipments were not found" },
        { status: 404 },
      );
    }

    const invalidShipments = shipments.filter(
      (shipment) => shipment.status !== "ready_for_pickup",
    );

    if (invalidShipments.length > 0) {
      return NextResponse.json(
        {
          error:
            "Only ready_for_pickup shipments can be added to a production batch",
          invalidShipmentIds: invalidShipments.map(
            (shipment) => shipment.id,
          ),
        },
        { status: 409 },
      );
    }

    const { data: activeAssignments, error: assignmentError } = await supabase
      .from("production_batch_shipments")
      .select("shipment_id,batch_id")
      .in("shipment_id", uniqueShipmentIds)
      .is("completed_at", null);

    if (assignmentError) {
      return NextResponse.json(
        { error: assignmentError.message },
        { status: 500 },
      );
    }

    const alreadyAssigned = (activeAssignments ?? []).filter(
      (assignment) => assignment.batch_id !== batchId,
    );

    if (alreadyAssigned.length > 0) {
      return NextResponse.json(
        {
          error: "One or more shipments are already in an active batch",
          shipmentIds: alreadyAssigned.map(
            (assignment) => assignment.shipment_id,
          ),
        },
        { status: 409 },
      );
    }

    const rows = uniqueShipmentIds.map((shipmentId) => ({
      batch_id: batchId,
      shipment_id: shipmentId,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("production_batch_shipments")
      .insert(rows)
      .select("id,batch_id,shipment_id,added_at,completed_at");

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        assignments: inserted ?? [],
      },
      { status: 201 },
    );
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
