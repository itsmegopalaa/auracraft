"use client";

import { FormEvent, useState } from "react";
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
  order_id: string;
  name: string;
  email: string;
  payment_method: string;
  payment_status: string | null;
  order_status: string | null;
  items: OrderItem[];
  total: number;
  delivery: string;
  razorpay_payment_id?: string | null;
  razorpay_order_id?: string | null;
  paid_at?: string | null;
  shipping_partner?: string | null;
  tracking_id?: string | null;
  tracking_url?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
};

const STATUS_STEPS = [
  {
    id: "placed",
    title: "Order Received",
    icon: "📋",
    description: "We've received your order.",
  },
  {
    id: "confirmed",
    title: "Confirmed",
    icon: "✅",
    description: "Your order has been confirmed.",
  },
  {
    id: "processing",
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
    icon: "🏠",
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

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedOrderId = orderId.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedOrderId || !trimmedEmail) {
      setError("Please enter both your Order ID and email address.");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const response = await fetch(
        `/api/orders/${encodeURIComponent(
          trimmedOrderId
        )}?email=${encodeURIComponent(trimmedEmail)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success || !result.order) {
        throw new Error(
          result?.error || "Unable to find your order."
        );
      }

      setOrder(result.order);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unable to find your order.");
      }
    } finally {
      setLoading(false);
    }
  }

  const currentStatus = order?.order_status || "placed";

  const currentStatusIndex =
    STATUS_ORDER.indexOf(currentStatus);

  const isCancelled = currentStatus === "cancelled";

  const paidDate = formatDate(order?.paid_at);
  const shippedDate = formatDate(order?.shipped_at);
  const deliveredDate = formatDate(order?.delivered_at);

  return (
    <>
      <main className="min-h-screen bg-black px-6 py-24 text-white">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-center">
            <div className="text-5xl">🔎</div>

            <h1 className="mt-5 text-4xl font-extrabold md:text-5xl">
              Track Your Order
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-gray-400">
              Enter your MineNote Order ID and the email address
              used during checkout.
            </p>
          </div>

          {/* Search Form */}
          <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-900 p-7 md:p-9">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="orderId"
                  className="mb-2 block text-sm font-semibold text-gray-300"
                >
                  Order ID
                </label>

                <input
                  id="orderId"
                  type="text"
                  value={orderId}
                  onChange={(event) =>
                    setOrderId(event.target.value)
                  }
                  placeholder="e.g. MN12345678"
                  autoComplete="off"
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-5 py-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-300"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-5 py-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-yellow-400 px-6 py-4 font-bold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Finding Your Order..." : "Track Order →"}
              </button>
            </form>
          </div>

          {/* Order Result */}
          {order && (
            <div className="mt-10 space-y-8">
              {/* Summary */}
              <div className="rounded-3xl border border-yellow-400/30 bg-zinc-900 p-7 shadow-2xl md:p-9">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order ID
                    </p>

                    <h2 className="mt-1 text-2xl font-extrabold text-yellow-400">
                      {order.order_id}
                    </h2>
                  </div>

                  <span className="w-fit rounded-full bg-yellow-400 px-5 py-2 text-sm font-bold capitalize text-black">
                    {currentStatus}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-black p-5">
                    <p className="text-sm text-gray-500">
                      Customer
                    </p>

                    <p className="mt-1 font-semibold">
                      {order.name}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black p-5">
                    <p className="text-sm text-gray-500">
                      Payment
                    </p>

                    <p className="mt-1 font-semibold">
                      {order.payment_method === "COD"
                        ? "💵 Cash on Delivery"
                        : "💳 Online Payment"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black p-5">
                    <p className="text-sm text-gray-500">
                      Total
                    </p>

                    <p className="mt-1 font-bold text-yellow-400">
                      ₹{order.total}
                    </p>
                  </div>
                </div>

                {paidDate && (
                  <p className="mt-5 text-sm text-gray-500">
                    Payment received on {paidDate}
                  </p>
                )}
              </div>

              {/* Status Timeline */}
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-7 md:p-9">
                <h2 className="text-2xl font-bold">
                  Order Progress 📦
                </h2>

                {isCancelled ? (
                  <div className="mt-7 rounded-2xl border border-red-500/30 bg-red-950/40 p-6">
                    <div className="text-4xl">❌</div>

                    <h3 className="mt-4 text-xl font-bold text-red-300">
                      Order Cancelled
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-red-200/80">
                      This order has been cancelled and will not proceed
                      through the normal delivery process.
                    </p>

                    <p className="mt-4 text-sm text-gray-400">
                      Please contact MineNote if you need assistance
                      regarding this order.
                    </p>
                  </div>
                ) : (
                  <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {STATUS_STEPS.map((step) => {
                      const stepIndex =
                        STATUS_ORDER.indexOf(step.id);

                      const completed =
                        currentStatusIndex >= stepIndex;

                      return (
                        <div
                          key={step.id}
                          className={`rounded-2xl p-5 ${
                            completed
                              ? "bg-yellow-400 text-black"
                              : "bg-black text-white"
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
                )}
              </div>

              {/* Shipment */}
              {(order.shipping_partner ||
                order.tracking_id ||
                order.tracking_url ||
                order.shipped_at ||
                order.delivered_at) && (
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-7 md:p-9">
                  <h2 className="text-2xl font-bold">
                    Shipment Tracking 🚚
                  </h2>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    {order.shipping_partner && (
                      <div>
                        <p className="text-sm text-gray-500">
                          Shipping Partner
                        </p>

                        <p className="mt-1 font-semibold">
                          {order.shipping_partner}
                        </p>
                      </div>
                    )}

                    {order.tracking_id && (
                      <div>
                        <p className="text-sm text-gray-500">
                          Tracking ID
                        </p>

                        <p className="mt-1 break-all font-semibold text-yellow-400">
                          {order.tracking_id}
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

                  {order.tracking_url && (
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-yellow-400 px-6 py-4 font-bold text-black transition hover:scale-[1.01] sm:w-auto"
                    >
                      Track Shipment →
                    </a>
                  )}
                </div>
              )}

              {/* Items */}
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-7 md:p-9">
                <h2 className="text-2xl font-bold">
                  Items in This Order 🛍️
                </h2>

                <div className="mt-6 space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 rounded-2xl bg-black p-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {item.name}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          ₹{item.price} × {item.quantity}
                        </p>
                      </div>

                      <p className="shrink-0 font-bold text-yellow-400">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setOrder(null);
                    setError("");
                    setOrderId("");
                    setEmail("");
                  }}
                  className="rounded-full border border-zinc-700 bg-zinc-900 px-8 py-4 font-bold text-white transition hover:border-yellow-400"
                >
                  Track Another Order
                </button>
              </div>
            </div>
          )}

          {/* Back links */}
          {!order && (
            <div className="mt-8 flex flex-col justify-center gap-4 text-center sm:flex-row">
              <Link
                href="/products"
                className="rounded-full bg-yellow-400 px-8 py-4 font-bold text-black transition hover:scale-[1.02]"
              >
                Explore Products →
              </Link>

              <Link
                href="/"
                className="rounded-full border border-zinc-700 bg-zinc-900 px-8 py-4 font-bold text-white transition hover:border-yellow-400"
              >
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}