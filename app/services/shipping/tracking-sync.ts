import { createSupabaseAdminClient } from "@/app/lib/supabase";
import { ShipmozoProvider } from "./providers/shipmozo";
import { sendOrderStatusEmail } from "@/app/services/orders/order-email";

type ShipmentRow = {
  id: string;
  order_id: string;
  awb: string | null;
  status: string;
};

function normalizeStatus(status: string | null) {
  const value = status?.trim().toLowerCase() || "";

  if (
    value.includes("delivered")
  ) {
    return "delivered";
  }

  if (
    value.includes("out for delivery") ||
    value.includes("out_for_delivery")
  ) {
    return "out_for_delivery";
  }

  if (
    value.includes("picked") ||
    value.includes("pickup") ||
    value.includes("in transit") ||
    value.includes("in_transit") ||
    value.includes("transit")
  ) {
    return "in_transit";
  }

  return null;
}

export async function syncShipmentTracking(
  shipmentId?: string
) {
  const supabase = createSupabaseAdminClient();
  const provider = new ShipmozoProvider();

  let query = supabase
    .from("shipments")
    .select("id, order_id, awb, status")
    .not("awb", "is", null)
    .in("status", [
      "ready_for_pickup",
      "picked_up",
      "in_transit",
      "out_for_delivery",
    ]);

  if (shipmentId) {
    query = query.eq("id", shipmentId);
  }

  const { data: shipments, error } = await query;

  if (error) {
    throw new Error(
      `Unable to load shipments for tracking sync: ${error.message}`
    );
  }

  const results: Array<{
    shipmentId: string;
    orderId: string;
    status: string | null;
    updated: boolean;
  }> = [];

  for (const shipment of (shipments || []) as ShipmentRow[]) {
    if (!shipment.awb) continue;

    try {
      const tracking = await provider.getTracking(shipment.awb);
      const mappedStatus = normalizeStatus(tracking.status);

      const shipmentUpdate: Record<string, unknown> = {
        provider_status: tracking.status,
        tracking_url: tracking.tracking_url,
        provider_response: tracking.raw_response,
        updated_at: new Date().toISOString(),
      };

      if (mappedStatus) {
        shipmentUpdate.status = mappedStatus;
      }

      if (mappedStatus === "delivered") {
        shipmentUpdate.delivered_at = new Date().toISOString();
      }

      const { error: shipmentUpdateError } = await supabase
        .from("shipments")
        .update(shipmentUpdate)
        .eq("id", shipment.id);

      if (shipmentUpdateError) {
        throw new Error(shipmentUpdateError.message);
      }

      const orderUpdate: Record<string, unknown> = {
        tracking_id: shipment.awb,
        tracking_url: tracking.tracking_url,
        shipping_partner: "shipmozo",
      };

      if (mappedStatus === "delivered") {
        orderUpdate.order_status = "delivered";
        orderUpdate.delivered_at = new Date().toISOString();
      }

      const { data: updatedOrder, error: orderUpdateError } =
        await supabase
          .from("orders")
          .update(orderUpdate)
          .eq("order_id", shipment.order_id)
          .select(
            "order_id, name, email, payment_method, total, delivery"
          )
          .single();

      if (orderUpdateError || !updatedOrder) {
        throw new Error(
          orderUpdateError?.message ||
            "Unable to update delivered order."
        );
      }

      if (mappedStatus === "delivered") {
        await sendOrderStatusEmail({
          orderId: updatedOrder.order_id,
          name: updatedOrder.name,
          email: updatedOrder.email,
          paymentMethod: updatedOrder.payment_method,
          orderStatus: "delivered",
          total: updatedOrder.total,
          delivery:
            updatedOrder.delivery || "Standard delivery",
        });
      }

      results.push({
        shipmentId: shipment.id,
        orderId: shipment.order_id,
        status: mappedStatus,
        updated: true,
      });
    } catch (error) {
      console.error("SHIPMENT TRACKING SYNC FAILED:", {
        shipmentId: shipment.id,
        orderId: shipment.order_id,
        awb: shipment.awb,
        error:
          error instanceof Error
            ? error.message
            : error,
      });

      results.push({
        shipmentId: shipment.id,
        orderId: shipment.order_id,
        status: null,
        updated: false,
      });
    }
  }

  return results;
}
