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
        <main className="min-h-screen overflow-x-hidden bg-[var(--mn-bg)] px-4 py-16 text-[var(--mn-text)] sm:px-6 sm:py-24">
          <div className="mx-auto flex min-h-[55vh] max-w-xl items-center justify-center sm:min-h-[60vh]">
            <div className="w-full rounded-[1.5rem] border border-[var(--mn-border)] bg-[var(--mn-surface-soft)] p-[var(--mn-space-card)] text-center shadow-[var(--mn-shadow-lg)] sm:rounded-[2rem] sm:p-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[var(--mn-accent)] bg-[var(--mn-accent-soft)] text-2xl">
                ⏳
              </div>

              <h1 className="mt-6 mn-h3">
                Loading your order
              </h1>

              <p className="mt-3 text-sm leading-6 text-[var(--mn-text-muted)]">
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
        <main className="min-h-screen overflow-x-hidden bg-[var(--mn-bg)] px-4 py-16 text-[var(--mn-text)] sm:px-6 sm:py-24">
          <div className="mx-auto flex min-h-[55vh] max-w-xl items-center justify-center sm:min-h-[60vh]">
            <div className="w-full rounded-[1.5rem] border border-[var(--mn-border)] bg-[var(--mn-surface-soft)] p-[var(--mn-space-card)] text-center shadow-[var(--mn-shadow-lg)] sm:rounded-[2rem] sm:p-10">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[var(--mn-accent)] bg-[var(--mn-accent-soft)] text-4xl">
                🧾
              </div>

              <h1 className="mt-7 mn-h2">
                Order Details Not Found
              </h1>

              <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--mn-text-muted)]">
                We couldn&apos;t find a recent MineNote order on this device.
                Your order may still exist in your account.
              </p>

              <Link
                href="/products"
                className="mt-8 inline-flex rounded-full bg-[var(--mn-accent)] px-8 py-4 font-black text-[var(--mn-accent-contrast)] transition-all hover:-translate-y-0.5 hover:bg-[var(--mn-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
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
      <main className="min-h-screen overflow-x-hidden bg-[var(--mn-bg)] px-4 py-12 text-[var(--mn-text)] sm:px-6 md:py-[clamp(5rem,8vw,7.5rem)] sm:px-6 sm:py-16 md:py-24">
        <div className="mx-auto max-w-6xl">

          {/* =========================================================
              HERO / CONFIRMATION
          ========================================================= */}
          <section className="relative overflow-hidden rounded-[1.5rem] border border-[var(--mn-accent)] bg-[var(--mn-surface-soft)] px-5 py-10 text-center shadow-[var(--mn-shadow-lg)] sm:rounded-[2rem] sm:px-10 sm:py-12 md:py-16">
            <div className="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-[var(--mn-accent-soft)] blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[var(--mn-accent)] bg-[var(--mn-accent)] mn-h2 text-[var(--mn-accent-contrast)] shadow-[var(--mn-shadow-sm)] sm:h-20 sm:w-20 sm:text-4xl">
                ✓
              </div>

              <div className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--mn-accent)] sm:mt-7 sm:text-xs sm:tracking-[0.25em]">
                Order Confirmed
              </div>

              <h1 className="mt-3 mn-h2 tracking-tight sm:text-5xl md:text-6xl">
                Thank You,{" "}
                <span className="text-[var(--mn-accent)]">
                  {order.name.split(" ")[0]}
                </span>
                .
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[var(--mn-text-secondary)] sm:mt-5 sm:text-lg sm:leading-7">
                Your MineNote order has been successfully received.
                We&apos;ll take care of the rest. ✨
              </p>

              <div className="mx-auto mt-7 flex w-full max-w-full flex-col items-center gap-2 rounded-[1.5rem] border border-[var(--mn-border)] bg-[var(--mn-bg)]/60 px-4 py-3.5 sm:mt-8 sm:w-fit sm:px-6 sm:py-4 sm:flex-row sm:gap-4">
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--mn-text-muted)]">
                  Order ID
                </span>

                <span className="max-w-full break-all font-mono break-all text-xs font-bold text-[var(--mn-accent)] sm:text-base">
                  {order.orderId}
                </span>
              </div>

              <p className="mt-5 text-xs text-[var(--mn-text-muted)]">
                Keep this ID handy for order support and tracking.
              </p>
            </div>
          </section>

          {/* =========================================================
              ORDER OVERVIEW
          ========================================================= */}
          <section className="mt-6 grid gap-[var(--mn-space-card)] sm:mt-8 sm:gap-8 lg:grid-cols-[1.15fr_0.85fr]">

            {/* PRODUCTS */}
            <div className="rounded-[1.5rem] border border-[var(--mn-border)] bg-[var(--mn-surface-soft)] p-5 shadow-[var(--mn-shadow-lg)] sm:rounded-[2rem] sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--mn-text-muted)]">
                    Order Contents
                  </div>

                  <h2 className="mt-2 mn-h3 sm:text-3xl">
                    Your Notebooks 📦
                  </h2>
                </div>

                <span className="rounded-full border border-[var(--mn-border)] bg-[var(--mn-bg)] px-4 min-h-10 py-1.5 text-xs font-bold text-[var(--mn-text-secondary)]">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="mt-6 space-y-3 sm:mt-7">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="group flex gap-3 rounded-[1.5rem] border border-[var(--mn-border)] bg-[var(--mn-bg)]/60 p-3 transition-colors hover:border-[var(--mn-accent)] sm:gap-4 sm:p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
                  >
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--mn-surface-soft)] sm:h-28 sm:w-24">
                      {item.image &&
                      !imageErrors[item.id] ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="96px"
                          className="object-contain p-2 transition-transform duration-300 group-hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
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
                      <p className="truncate font-bold text-[var(--mn-text)]">
                        {item.name}
                      </p>

                      <p className="mt-2 text-[15px] text-[var(--mn-text-secondary)]">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center">
                      <p className="text-base font-black text-[var(--mn-accent)] sm:text-lg">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="my-7 border-t border-[var(--mn-border)]" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[var(--mn-text-muted)]">
                  <span>Subtotal</span>
                  <span className="text-[var(--mn-text-secondary)]">
                    ₹{order.total}
                  </span>
                </div>

                <div className="flex justify-between text-[var(--mn-text-muted)]">
                  <span>Delivery</span>
                  <span className="font-bold text-[var(--mn-success)]">
                    FREE
                  </span>
                </div>

                <div className="flex justify-between text-[var(--mn-text-muted)]">
                  <span>Premium packaging</span>
                  <span className="font-bold text-[var(--mn-success)]">
                    FREE
                  </span>
                </div>
              </div>

              <div className="my-7 border-t border-[var(--mn-border)]" />

              <div className="flex items-end justify-between">
                <span className="text-lg font-bold">
                  Total Paid
                </span>

                <span className="mn-h3 text-[var(--mn-accent)] sm:text-3xl">
                  ₹{order.total}
                </span>
              </div>
            </div>

            {/* DELIVERY DETAILS */}
            <div className="rounded-[1.5rem] border border-[var(--mn-border)] bg-[var(--mn-surface-soft)] p-5 shadow-[var(--mn-shadow-lg)] sm:rounded-[2rem] sm:p-8">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--mn-text-muted)]">
                Delivery
              </div>

              <h2 className="mt-2 mn-h3 sm:text-3xl">
                Shipping Details 🚚
              </h2>

              <div className="mt-6 space-y-4 sm:mt-7 sm:space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--mn-text-muted)]">
                    Delivering To
                  </p>

                  <p className="mt-2 font-semibold text-[var(--mn-text)]">
                    {order.name}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[var(--mn-text-secondary)]">
                    {order.address}
                    <br />
                    {order.city}, {order.state} — {order.pin}
                  </p>
                </div>

                <div className="border-t border-[var(--mn-border)] pt-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--mn-text-muted)]">
                    Contact
                  </p>

                  <p className="mt-2 text-sm text-[var(--mn-text-secondary)]">
                    {order.phone}
                  </p>

                  <p className="mt-1 break-all text-[15px] text-[var(--mn-text-secondary)]">
                    {order.email}
                  </p>
                </div>

                <div className="border-t border-[var(--mn-border)] pt-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--mn-text-muted)]">
                    Payment
                  </p>

                  <p className="mt-2 font-semibold text-[var(--mn-text)]">
                    {paymentLabel}
                  </p>

                  {paidDate && (
                    <p className="mt-1 text-[12px] text-[var(--mn-text-secondary)]">
                      Paid on {paidDate}
                    </p>
                  )}
                </div>

                <div className="rounded-[1.5rem] border border-[var(--mn-accent)] bg-[var(--mn-accent-soft)] p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--mn-text-muted)]">
                    Estimated Delivery
                  </p>

                  <p className="mt-2 font-bold text-[var(--mn-accent)]">
                    {order.delivery}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================
              STATUS
          ========================================================= */}
          <section className="mt-6 rounded-[1.5rem] border border-[var(--mn-border)] bg-[var(--mn-surface-soft)] p-5 shadow-[var(--mn-shadow-lg)] sm:mt-8 sm:rounded-[2rem] sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--mn-text-muted)]">
                  Live Order Progress
                </div>

                <h2 className="mt-2 mn-h3 sm:text-3xl">
                  Order Status
                </h2>
              </div>

              <span className="w-fit rounded-full border border-[var(--mn-accent)] bg-[var(--mn-accent-soft)] px-4 py-2 text-xs font-black uppercase tracking-wider text-[var(--mn-accent)]">
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
                    className={`relative rounded-[1.5rem] border p-4 transition-all sm:p-5 ${
                      completed
                        ? "border-[var(--mn-accent)] bg-[var(--mn-accent-soft)]"
                        : "border-[var(--mn-border)] bg-[var(--mn-bg)]/50"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-black ${
                        completed
                          ? "bg-[var(--mn-accent)] text-[var(--mn-accent-contrast)]"
                          : "border border-[var(--mn-border-strong)] bg-[var(--mn-surface)] text-[var(--mn-text-muted)]"
                      }`}
                    >
                      {step.icon}
                    </div>

                    <h3
                      className={`mt-4 font-bold ${
                        completed
                          ? "text-[var(--mn-text)]"
                          : "text-[var(--mn-text-muted)]"
                      }`}
                    >
                      {step.title}
                    </h3>

                    <p
                      className={`mt-2 text-sm leading-6 ${
                        completed
                          ? "text-[var(--mn-text-secondary)]"
                          : "text-[var(--mn-text-muted)]"
                      }`}
                    >
                      {step.description}
                    </p>

                    {current && (
                      <span className="mt-4 inline-flex rounded-full bg-[var(--mn-accent-soft)] px-3 min-h-10.5 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--mn-accent)]">
                        Current
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {orderStatus === "cancelled" && (
              <div className="mt-5 rounded-[1.5rem] border border-[color-mix(in_srgb,var(--mn-danger)_20%,transparent)] bg-[color-mix(in_srgb,var(--mn-danger)_10%,var(--mn-surface))] p-4 sm:mt-6 sm:p-5">
                <h3 className="font-bold text-[var(--mn-danger)]">
                  Order Cancelled
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--mn-danger)]">
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
              <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-[var(--mn-accent)] bg-[var(--mn-bg)]/70 sm:mt-6">
                <div className="border-b border-[var(--mn-border)] px-5 py-4 sm:px-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--mn-accent)]">
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

                <div className="grid gap-4 p-4 sm:gap-5 sm:grid-cols-2 sm:p-[var(--mn-space-card)]">
                  {order.shippingPartner && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--mn-text-muted)]">
                        Shipping Partner
                      </p>

                      <p className="mt-2 font-semibold text-[var(--mn-text)]">
                        {order.shippingPartner}
                      </p>
                    </div>
                  )}

                  {order.trackingId && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--mn-text-muted)]">
                        Tracking ID
                      </p>

                      <p className="mt-2 break-all font-mono break-all text-sm font-bold text-[var(--mn-accent)]">
                        {order.trackingId}
                      </p>
                    </div>
                  )}

                  {shippedDate && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--mn-text-muted)]">
                        Shipped
                      </p>

                      <p className="mt-2 text-sm font-semibold text-[var(--mn-text-secondary)]">
                        {shippedDate}
                      </p>
                    </div>
                  )}

                  {deliveredDate && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--mn-text-muted)]">
                        Delivered
                      </p>

                      <p className="mt-2 text-sm font-semibold text-[var(--mn-success)]">
                        {deliveredDate}
                      </p>
                    </div>
                  )}
                </div>

                {order.trackingUrl && (
                  <div className="border-t border-[var(--mn-border)] p-5 sm:p-[var(--mn-space-card)]">
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--mn-accent)] px-6 py-3.5 font-black text-[var(--mn-accent-contrast)] transition-all hover:-translate-y-0.5 hover:bg-[var(--mn-accent-hover)] sm:w-auto sm:py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
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
              className="flex min-h-12 items-center justify-center rounded-[1.5rem] bg-[var(--mn-accent)] py-3.5 text-center font-black text-[var(--mn-accent-contrast)] shadow-[var(--mn-shadow-sm)] transition-all hover:-translate-y-0.5 hover:bg-[var(--mn-accent-hover)] sm:py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
            >
              Explore More Designs →
            </Link>

            <Link
              href="/"
              className="flex min-h-12 items-center justify-center rounded-[1.5rem] border border-[var(--mn-border)] bg-[var(--mn-surface-soft)] py-3.5 text-center font-bold text-[var(--mn-text)] transition-all hover:-translate-y-0.5 hover:border-[var(--mn-accent)] sm:py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
            >
              Back to Home
            </Link>
          </section>

          <p className="mt-8 text-center text-xs text-[var(--mn-text-muted)]">
            Need help with your order? Keep your order ID ready when
            contacting MineNote support.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
