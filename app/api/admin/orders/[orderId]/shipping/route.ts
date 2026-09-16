import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { automateOrderShipping } from "@/app/services/shipping/automation";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    await requireAdminApi();

    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required." },
        { status: 400 },
      );
    }

    const result = await automateOrderShipping(orderId);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("ADMIN SHIPPING AUTOMATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to create shipment.",
      },
      { status: 500 },
    );
  }
}
