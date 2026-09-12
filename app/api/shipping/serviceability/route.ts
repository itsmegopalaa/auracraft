import { errorResponse, successResponse } from "@/app/lib/api-response";
import { createServerSupabaseClient } from "@/app/lib/supabase";
import { ShipmozoProvider } from "@/app/services/shipping";

function isValidUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value.trim()
    )
  );
}

function isValidPin(value: unknown): value is string {
  return typeof value === "string" && /^\d{6}$/.test(value.trim());
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return errorResponse("Unauthorized.", 401, "UNAUTHORIZED");
    }

    const body = await request.json();

    if (!body || typeof body !== "object") {
      return errorResponse(
        "Invalid request body.",
        400,
        "VALIDATION_ERROR"
      );
    }

    const orderId = (body as Record<string, unknown>).orderId;

    if (!isValidUuid(orderId)) {
      return errorResponse(
        "A valid order ID is required.",
        400,
        "VALIDATION_ERROR"
      );
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, pin")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) {
      console.error(
        "Shipping serviceability order lookup error:",
        orderError
      );

      return errorResponse(
        "Unable to load the order.",
        500,
        "INTERNAL_ERROR"
      );
    }

    if (!order) {
      return errorResponse(
        "Order not found.",
        404,
        "NOT_FOUND"
      );
    }

    if (!isValidPin(order.pin)) {
      return errorResponse(
        "Order destination PIN is invalid.",
        400,
        "INVALID_PIN"
      );
    }

    const originPin = process.env.SHIPMOZO_PICKUP_PIN;

    if (!isValidPin(originPin)) {
      console.error("Invalid SHIPMOZO_PICKUP_PIN configuration.");

      return errorResponse(
        "Shipping origin is not configured.",
        500,
        "SHIPPING_CONFIG_ERROR"
      );
    }

    const provider = new ShipmozoProvider();

    const serviceable = await provider.checkServiceability(
      originPin,
      order.pin
    );

    return successResponse({
      orderId: order.id,
      originPin,
      destinationPin: order.pin,
      serviceable,
      provider: provider.name,
    });
  } catch (error) {
    console.error(
      "Shipping serviceability error:",
      error
    );

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Unable to check shipping serviceability.",
      500,
      "INTERNAL_ERROR"
    );
  }
}
