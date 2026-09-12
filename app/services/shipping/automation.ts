import { createSupabaseAdminClient } from "@/app/lib/supabase";
import { createShipment } from "./shipment-service";
import { ShipmozoProvider } from "./providers/shipmozo";
import { validateShippingSnapshot } from "./validation";
import type {
  ShippingAddress,
  ShippingOrderItem,
  ShippingPackage,
  ShippingRate,
} from "./provider";

export async function automateOrderShipping(orderId: string) {
  const supabase = createSupabaseAdminClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "order_id, name, phone, email, address, city, state, pin, items, total, payment_method, payment_status, order_status, shipping_snapshot"
    )
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load order for shipping: ${error.message}`);
  }

  if (!order) {
    throw new Error(`Order ${orderId} not found.`);
  }

  if (order.payment_status !== "paid") {
    throw new Error("Shipping automation requires a paid order.");
  }

  if (
    order.order_status !== "confirmed" &&
    order.order_status !== "processing"
  ) {
    throw new Error(
      `Order ${orderId} is not ready for shipping: ${order.order_status}.`
    );
  }

  const validation = validateShippingSnapshot(
    order.shipping_snapshot,
    order.pin
  );

  if (!validation.valid || !validation.package) {
    throw new Error(
      validation.errors.map((error) => error.message).join(" ")
    );
  }

  const existingShipment = await supabase
    .from("shipments")
    .select("id, status")
    .eq("order_id", orderId)
    .maybeSingle();

  if (existingShipment.error) {
    throw new Error(
      `Unable to check existing shipment: ${existingShipment.error.message}`
    );
  }

  if (existingShipment.data && existingShipment.data.status !== "failed") {
    return {
      created: false,
      reason: "shipment_already_exists",
      shipment: existingShipment.data,
    };
  }

  const provider = new ShipmozoProvider();

  const serviceable = await provider.checkServiceability(
    process.env.SHIPMOZO_PICKUP_PIN || "",
    order.pin
  );

  if (!serviceable) {
    throw new Error(
      `Shipping is not serviceable for PIN ${order.pin}.`
    );
  }

  const packageData: ShippingPackage = validation.package;

  const address: ShippingAddress = {
    name: order.name,
    phone: order.phone,
    email: order.email,
    address: order.address,
    city: order.city,
    state: order.state,
    pin: order.pin,
  };

  const orderItems = Array.isArray(order.items)
    ? order.items
    : [];

  const items: ShippingOrderItem[] = orderItems.map(
    (item: {
      id: string;
      name: string;
      quantity: number;
      price: number;
    }) => ({
      product_id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
    })
  );

  if (!items.length) {
    throw new Error("Order has no shippable items.");
  }

  const rates = await provider.getRates({
    order_id: order.order_id,
    origin_pin: process.env.SHIPMOZO_PICKUP_PIN || "",
    destination: address,
    package: packageData,
    order_value: Number(order.total),
    payment_method:
      order.payment_method === "COD" ? "COD" : "PREPAID",
    items,
  });

  const availableRates = rates
    .filter((rate: ShippingRate) => rate.serviceable)
    .sort(
      (a: ShippingRate, b: ShippingRate) =>
        a.shipping_charge - b.shipping_charge
    );

  if (!availableRates.length) {
    throw new Error("No serviceable courier rate was returned.");
  }

  const selectedRate = availableRates[0];

  return createShipment({
    orderId: order.order_id,
    address,
    package: packageData,
    orderValue: Number(order.total),
    paymentMethod:
      order.payment_method === "COD" ? "COD" : "PREPAID",
    rate: selectedRate,
    items,
  });
}
