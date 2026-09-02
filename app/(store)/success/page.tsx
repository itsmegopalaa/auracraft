"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "@/app/components/Footer";

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
    icon: "✓",
    description: "We&apos;ve received your order.",
  },
  {
    id: "confirmed",
    title: "Preparing",
    icon: "📦",
    description: "Your notebooks are being prepared.",
  },
  {
    id: "shipped",
    title: "Shipped",
    icon: "🚚",
    description: "Your order is on its way.",
  },
  {
    id: "delivered",
    title: "Delivered",
    icon: "✓",
    description: "Your order has arrived.",
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
          )}?email=${encodeURIComponent(
            parsedOrder.email.trim().toLowerCase()
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
        <main className="min-h-screen overflow-x-hidden bg-black px-4 py-16 text-white sm:px-6 sm:py-24">
          <div className="mx-auto flex min-h-[55vh] max-w-xl items-center justify-center sm:min-h-[60vh]">
            <div className="w-full rounded-[1.5rem] border border-white/[0.08] bg-zinc-950 p-6 text-center shadow-2xl sm:rounded-[2rem] sm:p-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400/10 text-2xl">
                ⏳
              </div>

              <h1 className="mt-6 text-2xl font-black">
                Loading your order
              </h1>

              <p className="mt-3 text-sm leading-6 text-zinc-500">
                We&apos;re securely retrieving your MineNote order details.
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
        <main className="min-h-screen overflow-x-hidden bg-black px-4 py-16 text-white sm:px-6 sm:py-24">
          <div className="mx-auto flex min-h-[55vh] max-w-xl items-center justify-center sm:min-h-[60vh]">
            <div className="w-full rounded-[1.5rem] border border-white/[0.08] bg-zinc-950 p-6 text-center shadow-2xl sm:rounded-[2rem] sm:p-10">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-yellow-400/20 bg-yellow-400/[0.06] text-4xl">
                🧾
              </div>

              <h1 className="mt-7 text-3xl font-black">
                Order Details Not Found
              </h1>

              <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-zinc-500">
                We couldn&apos;t find a recent MineNote order on this device.
                Your order may still exist in your account.
              </p>

              <Link
                href="/products"
                className="mt-8 inline-flex rounded-full bg-yellow-400 px-8 py-4 font-black text-black transition-all hover:-translate-y-0.5 hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
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
      ? "Cash on Delivery"
      : "Paid online via Razorpay";

  const paidDate = formatDate(order.paidAt);
  const shippedDate = formatDate(order.shippedAt);
  const deliveredDate = formatDate(order.deliveredAt);

  const itemCount = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <>
      <main className="min-h-screen overflow-x-hidden bg-black px-4 py-12 text-white sm:px-6 md:py-20 sm:px-6 sm:py-16 md:py-24">
        <div className="mx-auto max-w-6xl">

          {/* =========================================================
              HERO / CONFIRMATION
          ========================================================= */}
          <section className="relative overflow-hidden rounded-[1.5rem] border border-yellow-400/20 bg-zinc-950 px-5 py-10 text-center shadow-2xl sm:rounded-[2rem] sm:px-10 sm:py-12 md:py-16">
            <div className="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400 text-3xl font-black text-black shadow-xl shadow-yellow-400/10 sm:h-20 sm:w-20 sm:text-4xl">
                ✓
              </div>

              <div className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-yellow-400 sm:mt-7 sm:text-xs sm:tracking-[0.25em]">
                Order Confirmed
              </div>

              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl md:text-6xl">
                Thank You,{" "}
                <span className="text-yellow-400">
                  {order.name.split(" ")[0]}
                </span>
                .
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-zinc-400 sm:mt-5 sm:text-lg sm:leading-7">
                Your MineNote order has been successfully received.
                We&apos;ll take care of the rest. ✨
              </p>

              <div className="mx-auto mt-7 flex w-full max-w-full flex-col items-center gap-2 rounded-2xl border border-white/[0.08] bg-black/60 px-4 py-3.5 sm:mt-8 sm:w-fit sm:px-6 sm:py-4 sm:flex-row sm:gap-4">
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-600">
                  Order ID
                </span>

                <span className="max-w-full break-all font-mono break-all text-xs font-bold text-yellow-400 sm:text-base">
                  {order.orderId}
                </span>
              </div>

              <p className="mt-5 text-xs text-zinc-600">
                Keep this ID handy for order support and tracking.
              </p>
            </div>
          </section>

          {/* =========================================================
              ORDER OVERVIEW
          ========================================================= */}
          <section className="mt-6 grid gap-6 sm:mt-8 sm:gap-8 lg:grid-cols-[1.15fr_0.85fr]">

            {/* PRODUCTS */}
            <div className="rounded-[1.5rem] border border-white/[0.08] bg-zinc-950 p-5 shadow-2xl sm:rounded-[2rem] sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-600">
                    Order Contents
                  </div>

                  <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                    Your Notebooks 📦
                  </h2>
                </div>

                <span className="rounded-full border border-white/[0.08] bg-black px-4 min-h-10 py-1.5 text-xs font-bold text-zinc-400">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="mt-6 space-y-3 sm:mt-7">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="group flex gap-3 rounded-2xl border border-white/[0.06] bg-black/60 p-3 transition-colors hover:border-yellow-400/20 sm:gap-4 sm:p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-950 sm:h-28 sm:w-24">
                      {item.image &&
                      !imageErrors[item.id] ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="96px"
                          className="object-contain p-2 transition-transform duration-300 group-hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
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
                        <div className="flex h-full items-center justify-center text-2xl">
                          📓
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 py-1">
                      <p className="truncate font-bold text-white">
                        {item.name}
                      </p>

                      <p className="mt-2 text-sm text-zinc-500">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center">
                      <p className="text-base font-black text-yellow-400 sm:text-lg">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="my-7 border-t border-white/[0.08]" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span className="text-zinc-300">
                    ₹{order.total}
                  </span>
                </div>

                <div className="flex justify-between text-zinc-500">
                  <span>Delivery</span>
                  <span className="font-bold text-emerald-400">
                    FREE
                  </span>
                </div>

                <div className="flex justify-between text-zinc-500">
                  <span>Premium Packaging</span>
                  <span className="font-bold text-emerald-400">
                    FREE
                  </span>
                </div>
              </div>

              <div className="my-7 border-t border-white/[0.08]" />

              <div className="flex items-end justify-between">
                <span className="text-lg font-bold">
                  Total Paid
                </span>

                <span className="text-2xl font-black text-yellow-400 sm:text-3xl">
                  ₹{order.total}
                </span>
              </div>
            </div>

            {/* DELIVERY DETAILS */}
            <div className="rounded-[1.5rem] border border-white/[0.08] bg-zinc-950 p-5 shadow-2xl sm:rounded-[2rem] sm:p-8">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-600">
                Delivery
              </div>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Shipping Details 🚚
              </h2>

              <div className="mt-6 space-y-4 sm:mt-7 sm:space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                    Delivering To
                  </p>

                  <p className="mt-2 font-semibold text-white">
                    {order.name}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-zinc-400">
                    {order.address}
                    <br />
                    {order.city}, {order.state} — {order.pin}
                  </p>
                </div>

                <div className="border-t border-white/[0.06] pt-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                    Contact
                  </p>

                  <p className="mt-2 text-sm text-zinc-300">
                    {order.phone}
                  </p>

                  <p className="mt-1 break-all text-sm text-zinc-500">
                    {order.email}
                  </p>
                </div>

                <div className="border-t border-white/[0.06] pt-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                    Payment
                  </p>

                  <p className="mt-2 font-semibold text-white">
                    {paymentLabel}
                  </p>

                  {paidDate && (
                    <p className="mt-1 text-xs text-zinc-600">
                      Paid on {paidDate}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-yellow-400/15 bg-yellow-400/[0.04] p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                    Estimated Delivery
                  </p>

                  <p className="mt-2 font-bold text-yellow-400">
                    {order.delivery}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================
              STATUS
          ========================================================= */}
          <section className="mt-6 rounded-[1.5rem] border border-white/[0.08] bg-zinc-950 p-5 shadow-2xl sm:mt-8 sm:rounded-[2rem] sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-600">
                  Live Order Progress
                </div>

                <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                  Order Status
                </h2>
              </div>

              <span className="w-fit rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-yellow-400">
                {orderStatus}
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:mt-8 md:grid-cols-4">
              {STATUS_STEPS.map((step) => {
                const stepIndex =
                  STATUS_ORDER.indexOf(step.id);

                const completed =
                  currentStatusIndex >= stepIndex;

                const current =
                  currentStatusIndex === stepIndex;

                return (
                  <div
                    key={step.id}
                    className={`relative rounded-2xl border p-4 transition-all sm:p-5 ${
                      completed
                        ? "border-yellow-400/25 bg-yellow-400/[0.06]"
                        : "border-white/[0.06] bg-black/50"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-black ${
                        completed
                          ? "bg-yellow-400 text-black"
                          : "border border-zinc-700 bg-zinc-900 text-zinc-600"
                      }`}
                    >
                      {step.icon}
                    </div>

                    <h3
                      className={`mt-4 font-bold ${
                        completed
                          ? "text-white"
                          : "text-zinc-500"
                      }`}
                    >
                      {step.title}
                    </h3>

                    <p
                      className={`mt-2 text-sm leading-6 ${
                        completed
                          ? "text-zinc-400"
                          : "text-zinc-600"
                      }`}
                    >
                      {step.description}
                    </p>

                    {current && (
                      <span className="mt-4 inline-flex rounded-full bg-yellow-400/10 px-3 min-h-10.5 py-1 text-[10px] font-black uppercase tracking-wider text-yellow-400">
                        Current
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {orderStatus === "cancelled" && (
              <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-950/30 p-4 sm:mt-6 sm:p-5">
                <h3 className="font-bold text-red-300">
                  Order Cancelled
                </h3>

                <p className="mt-2 text-sm leading-6 text-red-200/70">
                  This order has been cancelled. Please contact
                  MineNote if you need assistance.
                </p>
              </div>
            )}

            {/* =====================================================
                SHIPMENT TRACKING
            ===================================================== */}
            {(order.shippingPartner ||
              order.trackingId ||
              order.trackingUrl ||
              order.shippedAt ||
              order.deliveredAt) && (
              <div className="mt-5 overflow-hidden rounded-2xl border border-yellow-400/15 bg-black/70 sm:mt-6">
                <div className="border-b border-white/[0.06] px-5 py-4 sm:px-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">
                        Shipment
                      </p>

                      <h3 className="mt-1 text-xl font-black">
                        Track Your Package
                      </h3>
                    </div>

                    <span className="text-2xl">
                      🚚
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 p-4 sm:gap-5 sm:grid-cols-2 sm:p-6">
                  {order.shippingPartner && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                        Shipping Partner
                      </p>

                      <p className="mt-2 font-semibold text-white">
                        {order.shippingPartner}
                      </p>
                    </div>
                  )}

                  {order.trackingId && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                        Tracking ID
                      </p>

                      <p className="mt-2 break-all font-mono break-all text-sm font-bold text-yellow-400">
                        {order.trackingId}
                      </p>
                    </div>
                  )}

                  {shippedDate && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                        Shipped
                      </p>

                      <p className="mt-2 text-sm font-semibold text-zinc-300">
                        {shippedDate}
                      </p>
                    </div>
                  )}

                  {deliveredDate && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                        Delivered
                      </p>

                      <p className="mt-2 text-sm font-semibold text-emerald-400">
                        {deliveredDate}
                      </p>
                    </div>
                  )}
                </div>

                {order.trackingUrl && (
                  <div className="border-t border-white/[0.06] p-5 sm:p-6">
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-yellow-400 px-6 py-3.5 font-black text-black transition-all hover:-translate-y-0.5 hover:bg-yellow-300 sm:w-auto sm:py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    >
                      Track Shipment →
                    </a>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* =========================================================
              ACTIONS
          ========================================================= */}
          <section className="mt-6 grid gap-3 sm:mt-8 sm:gap-4 sm:grid-cols-2">
            <Link
              href="/products"
              className="flex min-h-12 items-center justify-center rounded-2xl bg-yellow-400 py-3.5 text-center font-black text-black shadow-lg shadow-yellow-400/10 transition-all hover:-translate-y-0.5 hover:bg-yellow-300 sm:py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Explore More Designs →
            </Link>

            <Link
              href="/"
              className="flex min-h-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-zinc-950 py-3.5 text-center font-bold text-white transition-all hover:-translate-y-0.5 hover:border-yellow-400/40 sm:py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Back to Home
            </Link>
          </section>

          <p className="mt-8 text-center text-xs text-zinc-700">
            Need help with your order? Keep your order ID ready when
            contacting MineNote support.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
