import type {
  ShippingProvider,
  ShippingRate,
  ShippingRateRequest,
} from "../../provider";

type ShipmozoRateResponse = {
  result?: string | number;
  message?: string;
  data?: unknown;
};

type ShipmozoRateItem = {
  courier_name?: string;
  courier_id?: string | number;
  rate?: string | number;
  shipping_charge?: string | number;
  total?: string | number;
  etd?: string | number;
  estimated_days?: string | number;
  serviceable?: boolean | number | string;
};

function toNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeBoolean(
  value: unknown,
  fallback: boolean
): boolean {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["true", "1", "yes", "y"].includes(normalized)) {
      return true;
    }

    if (["false", "0", "no", "n"].includes(normalized)) {
      return false;
    }
  }

  return fallback;
}

export class ShipmozoProvider implements ShippingProvider {
  readonly name = "shipmozo" as const;

  private getConfig() {
    const publicKey = process.env.SHIPMOZO_PUBLIC_KEY;
    const privateKey = process.env.SHIPMOZO_PRIVATE_KEY;
    const pickupPin = process.env.SHIPMOZO_PICKUP_PIN;

    if (!publicKey || !privateKey || !pickupPin) {
      throw new Error(
        "Shipmozo configuration is incomplete."
      );
    }

    return {
      publicKey,
      privateKey,
      pickupPin,
    };
  }

  async checkServiceability(
    origin_pin: string,
    destination_pin: string
  ): Promise<boolean> {
    const { publicKey, privateKey } = this.getConfig();

    const response = await fetch(
      "https://shipping-api.com/app/api/v1/pincode-serviceability",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "public-key": publicKey,
          "private-key": privateKey,
        },
        body: JSON.stringify({
          pickup_pincode: origin_pin,
          delivery_pincode: destination_pin,
        }),
      }
    );

    const payload = (await response.json()) as {
      result?: string | number;
      message?: string;
      data?: {
        serviceable?: boolean;
      };
    };

    if (!response.ok) {
      throw new Error(
        payload.message ||
          `Shipmozo serviceability API failed with HTTP ${response.status}.`
      );
    }

    if (String(payload.result) !== "1") {
      throw new Error(
        payload.message ||
          "Shipmozo could not check pincode serviceability."
      );
    }

    return payload.data?.serviceable === true;
  }

  async getRates(
    request: ShippingRateRequest
  ): Promise<ShippingRate[]> {
    const { publicKey, privateKey, pickupPin } =
      this.getConfig();

    const body = {
      order_id: request.order_id || `RATE-${Date.now()}`,
      pickup_pincode: pickupPin,
      delivery_pincode: request.destination.pin,
      payment_type: request.payment_method,
      shipment_type: "FORWARD",
      order_amount: String(request.order_value),
      type_of_package: "SPS",
      rov_type: "ROV_OWNER",
      cod_amount: 0,
      weight: String(request.package.weight_grams),
      dimensions: [
        {
          no_of_box: 1,
          length: request.package.length_cm,
          width: request.package.width_cm,
          height: request.package.height_cm,
        },
      ],
    };

    const response = await fetch(
      "https://shipping-api.com/app/api/v1/rate-calculator",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "public-key": publicKey,
          "private-key": privateKey,
        },
        body: JSON.stringify(body),
      }
    );

    const payload =
      (await response.json()) as ShipmozoRateResponse;

    if (!response.ok) {
      throw new Error(
        payload.message ||
          `Shipmozo rate API failed with HTTP ${response.status}.`
      );
    }

    if (String(payload.result) !== "1") {
      throw new Error(
        payload.message ||
          "Shipmozo could not calculate shipping rates."
      );
    }

    if (!Array.isArray(payload.data)) {
      return [];
    }

    return payload.data
      .map((item) => {
        const rateItem = item as ShipmozoRateItem;

        const charge =
          toNumber(rateItem.shipping_charge) ??
          toNumber(rateItem.rate) ??
          toNumber(rateItem.total);

        if (
          !rateItem.courier_name ||
          charge === null
        ) {
          return null;
        }

        return {
          provider: "shipmozo" as const,
          courier_name: rateItem.courier_name,
          courier_id:
            rateItem.courier_id != null
              ? String(rateItem.courier_id)
              : null,
          shipping_charge: charge,
          estimated_days:
            toNumber(rateItem.estimated_days) ??
            toNumber(rateItem.etd),
          serviceable: normalizeBoolean(
            rateItem.serviceable,
            true
          ),
        };
      })
      .filter(
        (rate): rate is ShippingRate => rate !== null
      );
  }

  async createShipment(
    request: ShippingRateRequest,
    rate: ShippingRate
  ): Promise<Awaited<ReturnType<ShippingProvider["createShipment"]>>> {
    const { publicKey, privateKey } = this.getConfig();

    if (!request.order_id) {
      throw new Error("Shipmozo shipment requires an order ID.");
    }

    if (!request.items?.length) {
      throw new Error("Shipmozo shipment requires order items.");
    }

    const warehouseId = process.env.SHIPMOZO_WAREHOUSE_ID;

    if (!warehouseId) {
      throw new Error("SHIPMOZO_WAREHOUSE_ID is not configured.");
    }

    const productDetail = request.items.map((item) => ({
      name: item.name,
      sku_number: item.product_id,
      quantity: item.quantity,
      discount: "0",
      hsn: "",
      unit_price: String(item.unit_price),
      product_category: "Notebook",
    }));

    const body = {
      order_id: request.order_id,
      order_date: new Date().toISOString(),
      consignee_name: request.destination.name,
      consignee_phone: request.destination.phone,
      alternate_phone: "",
      consignee_email: request.destination.email,
      consignee_address_line_one: request.destination.address,
      consignee_address_line_two: "",
      consignee_pin_code: request.destination.pin,
      consignee_city: request.destination.city,
      consignee_state: request.destination.state,
      product_detail: productDetail,
      payment_type: request.payment_method,
      cod_amount: 0,
      shipping_charges: String(Math.round(rate.shipping_charge)),
      weight: request.package.weight_grams,
      length: request.package.length_cm,
      width: request.package.width_cm,
      height: request.package.height_cm,
      warehouse_id: warehouseId,
      gst_ewaybill_number: "",
      gstin_number: "",
    };

    const response = await fetch(
      "https://shipping-api.com/app/api/v1/push-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "public-key": publicKey,
          "private-key": privateKey,
        },
        body: JSON.stringify(body),
      }
    );

    const payload = (await response.json()) as {
      result?: string | number;
      message?: string;
      data?: {
        order_id?: string;
        refrence_id?: string;
        awb_number?: string;
      };
    };

    if (!response.ok) {
      throw new Error(
        payload.message ||
          `Shipmozo push-order API failed with HTTP ${response.status}.`
      );
    }

    if (String(payload.result) !== "1") {
      throw new Error(
        payload.message ||
          "Shipmozo could not create the shipment."
      );
    }

    const shipmentId =
      payload.data?.order_id ||
      payload.data?.refrence_id ||
      request.order_id;

    return {
      shipment_id: shipmentId,
      courier_name: rate.courier_name,
      courier_id: rate.courier_id,
      awb: payload.data?.awb_number || "",
      tracking_url: null,
      label_url: null,
      shipping_charge: rate.shipping_charge,
      provider_status: String(payload.result),
      raw_response: payload,
    };
  }
  async assignCourier(
    shipmentId: string,
    courierId?: string | null
  ) {
    const { publicKey, privateKey } = this.getConfig();

    const body: Record<string, string> = {
      order_id: shipmentId,
    };

    if (courierId) {
      body.courier_id = courierId;
    }

    const response = await fetch(
      "https://shipping-api.com/app/api/v1/auto-assign-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "public-key": publicKey,
          "private-key": privateKey,
        },
        body: JSON.stringify(body),
      }
    );

    const payload = (await response.json()) as {
      result?: string | number;
      message?: string;
      data?: {
        awb_number?: string;
        courier_company?: string;
        courier_company_service?: string;
      };
    };

    if (!response.ok || String(payload.result) !== "1") {
      throw new Error(
        payload.message ||
          `Shipmozo auto-assign API failed with HTTP ${response.status}.`
      );
    }

    return {
      awb: payload.data?.awb_number || "",
      courier_name:
        payload.data?.courier_company ||
        payload.data?.courier_company_service ||
        null,
      courier_id: courierId || null,
      raw_response: payload,
    };
  }

  async schedulePickup(shipmentId: string) {
    const { publicKey, privateKey } = this.getConfig();

    const response = await fetch(
      "https://shipping-api.com/app/api/v1/schedule-pickup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "public-key": publicKey,
          "private-key": privateKey,
        },
        body: JSON.stringify({
          order_id: shipmentId,
        }),
      }
    );

    const payload = (await response.json()) as {
      result?: string | number;
      message?: string;
      data?: {
        awb_number?: string;
        courier_company?: string;
        courier_company_service?: string;
        lr_number?: string;
      };
    };

    if (!response.ok || String(payload.result) !== "1") {
      throw new Error(
        payload.message ||
          `Shipmozo schedule-pickup API failed with HTTP ${response.status}.`
      );
    }

    return {
      awb: payload.data?.awb_number || "",
      courier_name:
        payload.data?.courier_company ||
        payload.data?.courier_company_service ||
        null,
      courier_id: null,
      raw_response: payload,
    };
  }

  async getLabel(awb: string) {
    const { publicKey, privateKey } = this.getConfig();

    const response = await fetch(
      `https://shipping-api.com/app/api/v1/get-order-label/${encodeURIComponent(awb)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "public-key": publicKey,
          "private-key": privateKey,
        },
        body: JSON.stringify({
          type_of_label: "PDF",
        }),
      }
    );

    const payload = (await response.json()) as {
      result?: string | number;
      message?: string;
      data?: unknown;
    };

    if (!response.ok || String(payload.result) !== "1") {
      throw new Error(
        payload.message ||
          `Shipmozo label API failed with HTTP ${response.status}.`
      );
    }

    const data = payload.data as
      | { label_url?: string; url?: string }
      | undefined;

    return {
      label_url: data?.label_url || data?.url || null,
      raw_response: payload,
    };
  }

  async getTracking(awb: string) {
    const { publicKey, privateKey } = this.getConfig();

    const response = await fetch(
      "https://shipping-api.com/app/api/v1/track-order",
      {
        method: "GET",
        headers: {
          "public-key": publicKey,
          "private-key": privateKey,
          "awb_number": awb,
        },
      }
    );

    const payload = (await response.json()) as {
      result?: string | number;
      message?: string;
      data?: unknown;
    };

    if (!response.ok || String(payload.result) !== "1") {
      throw new Error(
        payload.message ||
          `Shipmozo tracking API failed with HTTP ${response.status}.`
      );
    }

    const data = payload.data as
      | {
          status?: string;
          tracking_url?: string;
          tracking_link?: string;
        }
      | undefined;

    return {
      status: data?.status || null,
      tracking_url:
        data?.tracking_url ||
        data?.tracking_link ||
        null,
      raw_response: payload,
    };
  }

}
