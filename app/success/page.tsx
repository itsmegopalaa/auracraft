"use client";

import Image from "next/image";

import { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "../components/Footer";

type OrderItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type Order = {
  orderId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  payment: string;
  items: OrderItem[];
  total: number;
  delivery: string;

  razorpayPaymentId?: string | null;
  razorpayOrderId?: string | null;

  orderStatus?: string;

  paymentStatus?: string | null;
  paidAt?: string | null;

  shippingPartner?: string | null;
  trackingId?: string | null;
  trackingUrl?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
};

const STATUS_STEPS = [
  {
    id: "placed",
    title: "Order Received",
    icon: "📋",
    description: "We've received your order details.",
  },
  {
    id: "confirmed",
    title: "Preparing",
    icon: "📦",
    description: "Your notebooks will be carefully packed.",
  },
  {
    id: "shipped",
    title: "Shipped",
    icon: "🚚",
    description: "Your order is on its way to you.",
  },
  {
    id: "delivered",
    title: "Delivered",
    icon: "✅",
    description: "Your order has been delivered.",
  },
] as const;

const STATUS_ORDER = [
  "placed",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

function formatDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function SuccessPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [checked, setChecked] = useState(false);
  const [orderStatus, setOrderStatus] =
    useState<string>("placed");
  const [imageErrors, setImageErrors] =
    useState<Record<number, boolean>>({});

  useEffect(() => {
    async function loadOrder() {
      try {
        const savedOrder = localStorage.getItem(
          "auracraft_last_order"
        );

        if (!savedOrder) {
          return;
        }

        const parsedOrder: Order =
          JSON.parse(savedOrder);

        if (
          !parsedOrder ||
          !parsedOrder.orderId ||
          !Array.isArray(parsedOrder.items) ||
          !parsedOrder.email
        ) {
          return;
        }

        setOrder(parsedOrder);

        const response = await fetch(
          `/api/orders/${encodeURIComponent(
            parsedOrder.orderId
          )}`,
          {
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          console.error(
            "CUSTOMER ORDER LOAD FAILED:",
            JSON.stringify(result, null, 2)
          );

          throw new Error(
            result?.error ||
              `Unable to load order (HTTP ${response.status}).`
          );
        }

        const databaseOrder = result.order;

        const mergedOrder: Order = {
          ...parsedOrder,
          orderId:
            databaseOrder.order_id ??
            parsedOrder.orderId,
          name:
            databaseOrder.name ??
            parsedOrder.name,
          phone:
            databaseOrder.phone ??
            parsedOrder.phone,
          email:
            databaseOrder.email ??
            parsedOrder.email,
          address:
            databaseOrder.address ??
            parsedOrder.address,
          city:
            databaseOrder.city ??
            parsedOrder.city,
          state:
            databaseOrder.state ??
            parsedOrder.state,
          pin:
            databaseOrder.pin ??
            parsedOrder.pin,
          payment:
            databaseOrder.payment_method ??
            parsedOrder.payment,
          items:
            Array.isArray(databaseOrder.items)
              ? databaseOrder.items
              : parsedOrder.items,
          total:
            typeof databaseOrder.total === "number"
              ? databaseOrder.total
              : parsedOrder.total,
          delivery:
            databaseOrder.delivery ??
            parsedOrder.delivery,
          orderStatus:
            databaseOrder.order_status ??
            parsedOrder.orderStatus ??
            "placed",
          paymentStatus:
            databaseOrder.payment_status ??
            parsedOrder.paymentStatus ??
            null,
          paidAt:
            databaseOrder.paid_at ??
            parsedOrder.paidAt ??
            null,
          razorpayPaymentId:
            databaseOrder.razorpay_payment_id ??
            parsedOrder.razorpayPaymentId ??
            null,
          razorpayOrderId:
            databaseOrder.razorpay_order_id ??
            parsedOrder.razorpayOrderId ??
            null,
          shippingPartner:
            databaseOrder.shipping_partner ??
            parsedOrder.shippingPartner ??
            null,
          trackingId:
            databaseOrder.tracking_id ??
            parsedOrder.trackingId ??
            null,
          trackingUrl:
            databaseOrder.tracking_url ??
            parsedOrder.trackingUrl ??
            null,
          shippedAt:
            databaseOrder.shipped_at ??
            parsedOrder.shippedAt ??
            null,
          deliveredAt:
            databaseOrder.delivered_at ??
            parsedOrder.deliveredAt ??
            null,
        };

        setOrder(mergedOrder);

        setOrderStatus(
          databaseOrder.order_status ||
            parsedOrder.orderStatus ||
            "placed"
        );
      } catch (error) {
        console.error(
          "Failed to load order:",
          error
        );
      } finally {
        setChecked(true);
      }
    }

    loadOrder();
  }, []);

  if (!checked) {
    return (
      <>
        <main className="min-h-screen bg-black px-6 py-24 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10">
              <div className="text-5xl">⏳</div>

              <h1 className="mt-6 text-2xl font-bold">
                Loading your order...
              </h1>

              <p className="mt-3 text-gray-400">
                Please wait a moment.
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <main className="min-h-screen bg-black px-6 py-24 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10">
              <div className="text-5xl">🧾</div>

              <h1 className="mt-6 text-3xl font-bold">
                Order Details Not Found
              </h1>

              <p className="mt-4 text-gray-400">
                We couldn&apos;t find a recent MineNote order on this device.
              </p>

              <Link
                href="/products"
                className="mt-8 inline-block rounded-full bg-yellow-400 px-8 py-4 font-bold text-black transition hover:scale-105"
              >
                Explore Products →
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  const currentStatusIndex =
    STATUS_ORDER.indexOf(orderStatus);

  const paymentLabel =
    order.payment === "COD"
      ? "💵 Cash on Delivery"
      : "💳 Paid online via Razorpay";

  const paidDate = formatDate(order.paidAt);
  const shippedDate = formatDate(order.shippedAt);
  const deliveredDate = formatDate(order.deliveredAt);

  return (
    <>
      <main className="min-h-screen bg-black px-6 py-24 text-white">
        <div className="mx-auto max-w-6xl">
          {/* Confirmation */}
          <div className="rounded-3xl border border-yellow-400/30 bg-zinc-900 p-8 text-center shadow-2xl md:p-12">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-yellow-400 text-5xl font-bold text-black">
              ✓
            </div>

            <h1 className="mt-7 text-4xl font-extrabold md:text-5xl">
              Order Confirmed 🎉
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-gray-400">
              Thank you for choosing{" "}
              <span className="font-bold text-yellow-400">
                MineNote
              </span>
              . Your premium notebook order has been received.
            </p>

            <div className="mt-6 inline-block rounded-full border border-yellow-400/30 bg-black px-6 py-3">
              <span className="text-sm text-gray-400">
                Order ID
              </span>

              <span className="ml-2 font-bold text-yellow-400">
                {order.orderId}
              </span>
            </div>
          </div>

          {/* Order Details */}
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {/* Products */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-7">
              <h2 className="text-2xl font-bold">
                Your Order 📦
              </h2>

              <div className="mt-6 space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-zinc-800 bg-black"
                  >
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                      <div className="relative flex h-44 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 sm:h-32 sm:w-24">
                        {item.image &&
                        !imageErrors[item.id] ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={96}
                            height={176}
                            className="h-full w-full object-contain p-1"
                            onError={() =>
                              setImageErrors(
                                (current) => ({
                                  ...current,
                                  [item.id]: true,
                                })
                              )
                            }
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center px-2 text-center text-xs text-gray-500">
                            <span className="text-2xl">
                              📓
                            </span>
                            <span className="mt-1">
                              Preview unavailable
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-white">
                          {item.name}
                        </p>

                        <p className="mt-1 text-sm text-gray-400">
                          ₹{item.price} ×{" "}
                          {item.quantity}
                        </p>
                      </div>

                      <p className="text-lg font-bold text-yellow-400">
                        ₹
                        {item.price *
                          item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="my-6 border-t border-zinc-700" />

              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>

                <span className="text-yellow-400">
                  ₹{order.total}
                </span>
              </div>
            </div>

            {/* Delivery */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-7">
              <h2 className="text-2xl font-bold">
                Delivery Details 🚚
              </h2>

              <div className="mt-6 space-y-4 text-gray-300">
                <div>
                  <p className="text-sm text-gray-500">
                    Customer
                  </p>

                  <p className="font-semibold">
                    {order.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Phone
                  </p>

                  <p className="font-semibold">
                    {order.phone}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Email
                  </p>

                  <p className="break-all font-semibold">
                    {order.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Delivery Address
                  </p>

                  <p className="font-semibold leading-relaxed">
                    {order.address}
                    <br />
                    {order.city}, {order.state} -{" "}
                    {order.pin}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Payment
                  </p>

                  <p className="font-semibold">
                    {paymentLabel}
                  </p>

                  {paidDate && (
                    <p className="mt-1 text-sm text-gray-500">
                      Paid on {paidDate}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Estimated Delivery
                  </p>

                  <p className="font-semibold text-yellow-400">
                    {order.delivery}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-7">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-2xl font-bold">
                Order Status ✨
              </h2>

              <span className="w-fit rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold capitalize text-black">
                {orderStatus}
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {STATUS_STEPS.map((step) => {
                const stepIndex =
                  STATUS_ORDER.indexOf(step.id);

                const completed =
                  currentStatusIndex >=
                  stepIndex;

                return (
                  <div
                    key={step.id}
                    className={`rounded-2xl p-5 ${
                      completed
                        ? "bg-yellow-400 text-black"
                        : "bg-black"
                    }`}
                  >
                    <div className="text-3xl">
                      {step.icon}
                    </div>

                    <h3 className="mt-3 font-bold">
                      {step.title}
                    </h3>

                    <p
                      className={`mt-2 text-sm ${
                        completed
                          ? "text-black/70"
                          : "text-gray-400"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {orderStatus === "cancelled" && (
              <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-950/40 p-5">
                <h3 className="font-bold text-red-300">
                  Order Cancelled
                </h3>

                <p className="mt-2 text-sm text-red-200/80">
                  This order has been cancelled.
                  Please contact MineNote if you need
                  assistance.
                </p>
              </div>
            )}

            {/* Shipment Tracking */}
            {(order.shippingPartner ||
              order.trackingId ||
              order.trackingUrl ||
              order.shippedAt ||
              order.deliveredAt) && (
              <div className="mt-6 rounded-2xl border border-yellow-400/20 bg-black p-6">
                <h3 className="text-xl font-bold">
                  Shipment Tracking 🚚
                </h3>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {order.shippingPartner && (
                    <div>
                      <p className="text-sm text-gray-500">
                        Shipping Partner
                      </p>

                      <p className="mt-1 font-semibold">
                        {order.shippingPartner}
                      </p>
                    </div>
                  )}

                  {order.trackingId && (
                    <div>
                      <p className="text-sm text-gray-500">
                        Tracking ID
                      </p>

                      <p className="mt-1 break-all font-semibold text-yellow-400">
                        {order.trackingId}
                      </p>
                    </div>
                  )}

                  {shippedDate && (
                    <div>
                      <p className="text-sm text-gray-500">
                        Shipped
                      </p>

                      <p className="mt-1 font-semibold">
                        {shippedDate}
                      </p>
                    </div>
                  )}

                  {deliveredDate && (
                    <div>
                      <p className="text-sm text-gray-500">
                        Delivered
                      </p>

                      <p className="mt-1 font-semibold">
                        {deliveredDate}
                      </p>
                    </div>
                  )}
                </div>

                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-yellow-400 px-6 py-4 font-bold text-black transition hover:scale-[1.02] sm:w-auto"
                  >
                    Track Shipment →
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link
              href="/products"
              className="rounded-full bg-yellow-400 py-4 text-center font-bold text-black transition hover:scale-[1.02]"
            >
              Explore More Designs →
            </Link>

            <Link
              href="/"
              className="rounded-full border border-zinc-700 bg-zinc-900 py-4 text-center font-bold text-white transition hover:border-yellow-400"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
