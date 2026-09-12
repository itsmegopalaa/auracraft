export type ShippingProviderName = "shipmozo";

export type ShippingAddress = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pin: string;
};

export type ShippingPackage = {
  weight_grams: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
};

export type ShippingOrderItem = {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
};

export type ShippingRateRequest = {
  order_id?: string;
  origin_pin: string;
  destination: ShippingAddress;
  package: ShippingPackage;
  order_value: number;
  payment_method: "COD" | "PREPAID";
  items?: ShippingOrderItem[];
};

export type ShippingRate = {
  provider: ShippingProviderName;
  courier_name: string;
  courier_id: string | null;
  shipping_charge: number;
  estimated_days: number | null;
  serviceable: boolean;
};

export interface ShippingProvider {
  readonly name: ShippingProviderName;

  checkServiceability(
    origin_pin: string,
    destination_pin: string
  ): Promise<boolean>;

  getRates(
    request: ShippingRateRequest
  ): Promise<ShippingRate[]>;

  createShipment(
    request: ShippingRateRequest,
    rate: ShippingRate
  ): Promise<{
    shipment_id: string;
    courier_name: string;
    courier_id: string | null;
    awb: string;
    tracking_url: string | null;
    label_url: string | null;
    shipping_charge: number;
    provider_status: string | null;
    raw_response: unknown;
  }>;

  assignCourier(
    shipmentId: string,
    courierId?: string | null
  ): Promise<{
    awb: string;
    courier_name: string | null;
    courier_id: string | null;
    raw_response: unknown;
  }>;

  schedulePickup(
    shipmentId: string
  ): Promise<{
    awb: string;
    courier_name: string | null;
    courier_id: string | null;
    raw_response: unknown;
  }>;

  getLabel(
    awb: string
  ): Promise<{
    label_url: string | null;
    raw_response: unknown;
  }>;

  getTracking(
    awb: string
  ): Promise<{
    status: string | null;
    tracking_url: string | null;
    raw_response: unknown;
  }>;
}
