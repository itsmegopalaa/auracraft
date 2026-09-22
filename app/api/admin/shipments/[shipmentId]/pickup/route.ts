import { NextResponse } from "next/server";

import { requireAdminApi } from "@/app/lib/admin-auth";
import { scheduleShipmentPickup } from "@/app/services/shipping/shipment-service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ shipmentId: string }> },
) {
  const auth = await requireAdminApi();

  if (auth.error) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status },
    );
  }

  try {
    const { shipmentId } = await params;

    if (!shipmentId) {
      return NextResponse.json(
        { success: false, error: "Shipment ID is required." },
        { status: 400 },
      );
    }

    const shipment = await scheduleShipmentPickup(shipmentId);

    return NextResponse.json({
      success: true,
      shipment,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to schedule shipment pickup.",
      },
      { status: 500 },
    );
  }
}
