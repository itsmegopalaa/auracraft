import { createSupabaseAdminClient } from "@/app/lib/supabase";
import { ShipmozoProvider } from "./providers/shipmozo";
import type {
  ShippingAddress,
  ShippingPackage,
  ShippingRate,
  ShippingOrderItem,
} from "./provider";

export type CreateShipmentInput = {
  orderUuid: string;
  orderNumber: string;
  address: ShippingAddress;
  items: ShippingOrderItem[];
  package: ShippingPackage;
  orderValue: number;
  paymentMethod: "PREPAID";
  rate: ShippingRate;
};

type ProviderStage = {
  stage: string;
  response: unknown;
  recorded_at: string;
};

async function appendProviderStage(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  shipmentId: string,
  stage: string,
  response: unknown
) {
  const { data: current, error: readError } = await supabase
    .from("shipments")
    .select("provider_response")
    .eq("id", shipmentId)
    .single();

  if (readError) {
    throw new Error(
      `Unable to read shipment provider response: ${readError.message}`
    );
  }

  const history: ProviderStage[] = Array.isArray(
    current?.provider_response
  )
    ? current.provider_response
    : [];

  history.push({
    stage,
    response,
    recorded_at: new Date().toISOString(),
  });

  const { error } = await supabase
    .from("shipments")
    .update({
      provider_response: history,
      updated_at: new Date().toISOString(),
    })
    .eq("id", shipmentId);

  if (error) {
    throw new Error(
      `Unable to save shipment provider response: ${error.message}`
    );
  }
}

export async function createShipment(input: CreateShipmentInput) {
  const supabase = createSupabaseAdminClient();
  const provider = new ShipmozoProvider();

  const { data: existingShipment, error: existingError } =
    await supabase
      .from("shipments")
      .select(
        "id, status, shipment_id, awb, retry_count"
      )
      .eq("order_id", input.orderUuid)
      .maybeSingle();

  if (existingError) {
    throw new Error(
      `Unable to check existing shipment: ${existingError.message}`
    );
  }

  if (
    existingShipment &&
    existingShipment.status !== "failed"
  ) {
    throw new Error(
      `Shipment already exists for this order (${existingShipment.status}).`
    );
  }

  /*
   * A failed shipment may already exist at the provider.
   * We only allow a fresh retry when no provider shipment ID/AWB
   * was recorded locally. This prevents blindly creating duplicates.
   */
  if (
    existingShipment?.status === "failed" &&
    (existingShipment.shipment_id || existingShipment.awb)
  ) {
    throw new Error(
      "Shipment creation previously reached the shipping provider. Manual recovery is required before retrying."
    );
  }

  let shipmentId: string;

  if (existingShipment?.status === "failed") {
    const nextRetryCount =
      Number(existingShipment.retry_count || 0) + 1;

    const { data: retriedShipment, error: retryError } =
      await supabase
        .from("shipments")
        .update({
          status: "creating",
          error_code: null,
          error_message: null,
          retry_count: nextRetryCount,
          provider_response: [],
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingShipment.id)
        .select("id")
        .single();

    if (retryError || !retriedShipment) {
      throw new Error(
        retryError?.message ||
          "Unable to prepare failed shipment for retry."
      );
    }

    shipmentId = retriedShipment.id;
  } else {
    const { data: newShipment, error: insertError } =
      await supabase
        .from("shipments")
        .insert({
          order_id: input.orderUuid,
          provider: provider.name,
          status: "creating",
          weight_grams: input.package.weight_grams,
          length_cm: input.package.length_cm,
          width_cm: input.package.width_cm,
          height_cm: input.package.height_cm,
          shipping_charge: Math.round(
            input.rate.shipping_charge
          ),
          serviceable: true,
          courier_name: input.rate.courier_name,
          courier_id: input.rate.courier_id,
          retry_count: 0,
          provider_response: [],
        })
        .select("id")
        .single();

    if (insertError || !newShipment) {
      throw new Error(
        insertError?.message ||
          "Unable to create shipment record."
      );
    }

    shipmentId = newShipment.id;
  }

  try {
    const pushed = await provider.createShipment(
      {
        order_id: input.orderNumber,
        origin_pin:
          process.env.SHIPMOZO_PICKUP_PIN || "",
        destination: input.address,
        package: input.package,
        order_value: input.orderValue,
        payment_method: input.paymentMethod,
        items: input.items,
      },
      input.rate
    );

    const { error: providerIdError } = await supabase
      .from("shipments")
      .update({
        shipment_id: pushed.shipment_id,
        provider_status: pushed.provider_status,
        courier_name: pushed.courier_name,
        courier_id: pushed.courier_id,
        shipping_charge: Math.round(
          pushed.shipping_charge
        ),
        updated_at: new Date().toISOString(),
      })
      .eq("id", shipmentId);

    if (providerIdError) {
      throw new Error(
        `Provider shipment was created, but saving shipment ID failed: ${providerIdError.message}`
      );
    }

    await appendProviderStage(
      supabase,
      shipmentId,
      "push_order",
      pushed.raw_response
    );

    const assigned = await provider.assignCourier(
      pushed.shipment_id,
      pushed.courier_id
    );

    await appendProviderStage(
      supabase,
      shipmentId,
      "assign_courier",
      assigned.raw_response
    );

    const awb = assigned.awb || pushed.awb;

    if (!awb) {
      throw new Error(
        "Shipmozo created the order but did not return an AWB."
      );
    }

    const { error: awbSaveError } = await supabase
      .from("shipments")
      .update({
        awb,
        courier_name:
          assigned.courier_name ||
          pushed.courier_name,
        courier_id:
          assigned.courier_id ||
          pushed.courier_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", shipmentId);

    if (awbSaveError) {
      throw new Error(
        `Courier assigned, but saving AWB failed: ${awbSaveError.message}`
      );
    }

    const pickup = await provider.schedulePickup(
      pushed.shipment_id
    );

    await appendProviderStage(
      supabase,
      shipmentId,
      "schedule_pickup",
      pickup.raw_response
    );

    const finalAwb = pickup.awb || awb;

    const { error: readySaveError } = await supabase
      .from("shipments")
      .update({
        awb: finalAwb,
        courier_name:
          pickup.courier_name ||
          assigned.courier_name ||
          pushed.courier_name,
        courier_id:
          pickup.courier_id ||
          assigned.courier_id ||
          pushed.courier_id,
        status: "ready_for_pickup",
        shipped_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", shipmentId);

    if (readySaveError) {
      throw new Error(
        `Pickup scheduled, but saving shipment state failed: ${readySaveError.message}`
      );
    }

    try {
      const label = await provider.getLabel(finalAwb);

      await appendProviderStage(
        supabase,
        shipmentId,
        "label",
        label.raw_response
      );

      if (label.label_url) {
        await supabase
          .from("shipments")
          .update({
            label_url: label.label_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", shipmentId);
      }
    } catch (labelError) {
      console.error(
        "SHIPMENT LABEL GENERATION FAILED:",
        {
          orderId: input.orderNumber,
          awb: finalAwb,
          error:
            labelError instanceof Error
              ? labelError.message
              : labelError,
        }
      );
    }

    const tracking =
      await provider.getTracking(finalAwb).catch(
        (trackingError) => {
          console.error(
            "INITIAL TRACKING SYNC FAILED:",
            {
              orderId: input.orderNumber,
              awb: finalAwb,
              error:
                trackingError instanceof Error
                  ? trackingError.message
                  : trackingError,
            }
          );

          return null;
        }
      );

    if (tracking) {
      await appendProviderStage(
        supabase,
        shipmentId,
        "tracking",
        tracking.raw_response
      );

      await supabase
        .from("shipments")
        .update({
          tracking_url: tracking.tracking_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", shipmentId);
    }

    const { data: finalShipment, error: finalError } =
      await supabase
        .from("shipments")
        .select("*")
        .eq("id", shipmentId)
        .single();

    if (finalError || !finalShipment) {
      throw new Error(
        finalError?.message ||
          "Shipment was created but could not be finalized locally."
      );
    }

    const { error: orderLinkError } =
      await supabase
        .from("orders")
        .update({
          shipment_id: shipmentId,
          shipping_partner:
            finalShipment.courier_name ||
            provider.name,
          tracking_id: finalShipment.awb,
          tracking_url:
            finalShipment.tracking_url,
        })
        .eq("order_id", input.orderNumber);

    if (orderLinkError) {
      throw new Error(
        `Shipment created, but linking shipment to order failed: ${orderLinkError.message}`
      );
    }

    return finalShipment;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Shipment creation failed.";

    const { error: failureSaveError } = await supabase
      .from("shipments")
      .update({
        status: "failed",
        error_message: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", shipmentId);

    if (failureSaveError) {
      console.error(
        "FAILED TO SAVE SHIPMENT FAILURE STATE:",
        failureSaveError.message
      );
    }

    throw error;
  }
}
