import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Footer from "@/app/components/Footer";

type PageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

type OrderItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type Order = {
  order_id: string;
  customer_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  payment_method: string;
  payment_status: string | null;
  paid_at: string | null;
  order_status: string | null;
  items: unknown;
  total: number;
  delivery: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  shipping_partner: string | null;
  tracking_id: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  refund_status: string | null;
  refund_id: string | null;
  refund_amount: number | null;
  refund_processed_at: string | null;
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

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatStatus(status: string | null) {
  if (!status) return "Placed";

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusClasses(status: string | null) {
  switch (status) {
    case "delivered":
      return "border-green-400/20 bg-green-400/10 text-green-300";

    case "shipped":
      return "border-blue-400/20 bg-blue-400/10 text-blue-300";

    case "cancelled":
      return "border-red-400/20 bg-red-400/10 text-red-300";

    case "confirmed":
    case "processing":
      return "border-yellow-400/20 bg-yellow-400/10 text-yellow-300";

    default:
      return "border-zinc-700 bg-zinc-800 text-zinc-300";
  }
}

function getItems(value: unknown): OrderItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const record =
      typeof item === "object" && item !== null
        ? (item as Record<string, unknown>)
        : {};

    return {
      id:
        typeof record.id === "number"
          ? record.id
          : index + 1,
      name:
        typeof record.name === "string"
          ? record.name
          : "MineNote Product",
      price:
        typeof record.price === "number"
          ? record.price
          : Number(record.price) || 0,
      quantity:
        typeof record.quantity === "number"
          ? record.quantity
          : Number(record.quantity) || 1,
      image:
        typeof record.image === "string" &&
        record.image.length > 0
          ? record.image
          : "/images/notebooks/placeholder.png",
    };
  });
}

export default async function CustomerOrderDetailPage({
  params,
}: PageProps) {
  const { orderId } = await params;

  if (!orderId?.trim()) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(
        `/account/orders/${orderId}`
      )}`
    );
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      order_id,
      customer_id,
      name,
      email,
      phone,
      address,
      city,
      state,
      pin,
      payment_method,
      payment_status,
      paid_at,
      order_status,
      items,
      total,
      delivery,
      razorpay_order_id,
      razorpay_payment_id,
      shipping_partner,
      tracking_id,
      tracking_url,
      shipped_at,
      delivered_at,
      created_at,
      refund_status,
      refund_id,
      refund_amount,
      refund_processed_at
    `)
    .eq("order_id", orderId)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("CUSTOMER ORDER DETAIL ERROR:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    return (
      <>
        <main className="min-h-screen overflow-x-hidden bg-black px-6 py-20 text-white md:py-28">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-3xl border border-red-500/20 bg-zinc-900 p-8 text-center md:p-12">
              <div className="text-5xl">⚠️</div>

              <h1 className="mt-6 text-3xl font-extrabold">
                Unable to Load Order
              </h1>

              <p className="mx-auto mt-3 max-w-lg text-zinc-400">
                Something went wrong while loading this order.
                Please try again later.
              </p>

              <Link
                href="/account/orders"
                className="mt-8 inline-flex rounded-full bg-yellow-400 px-7 py-4 font-bold text-black transition hover:-translate-y-0.5 hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                ← Back to My Orders
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  if (!order) {
    notFound();
  }

  const typedOrder = order as Order;
  const items = getItems(typedOrder.items);

  const currentStatus =
    typedOrder.order_status || "placed";

  const currentStatusIndex =
    STATUS_ORDER.indexOf(currentStatus);

  const isCancelled =
    currentStatus === "cancelled";

  const paymentIsCod =
    typedOrder.payment_method === "COD";

  return (
    <>
      <main className="min-h-screen overflow-x-hidden bg-black px-4 py-10 text-white sm:px-6 sm:py-14 md:py-24">
        <div className="mx-auto w-full max-w-6xl">
          {/* Header */}
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <Link
                href="/account/orders"
                className="text-sm font-semibold text-yellow-400 transition hover:text-yellow-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                ← Back to My Orders
              </Link>

              <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:items-center">
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Order Details
                </h1>

                <span
                  className={`w-fit rounded-full border px-4 py-2 text-sm font-bold ${getStatusClasses(
                    currentStatus
                  )}`}
                >
                  {formatStatus(currentStatus)}
                </span>
              </div>

              <p className="mt-2 break-all text-sm text-zinc-500">
                {typedOrder.order_id}
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-600">
                Placed
              </p>

              <p className="mt-1 text-sm font-semibold text-zinc-400">
                {formatDate(typedOrder.created_at)}
              </p>
            </div>
          </div>

          {/* Status */}
          <section className="mt-6 rounded-3xl border border-yellow-400/20 bg-zinc-900 p-5 shadow-2xl shadow-black/30 sm:mt-8 sm:p-6 md:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-600">
                  Order Progress
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {isCancelled
                    ? "Order Cancelled"
                    : currentStatus === "delivered"
                      ? "Your order has arrived 🎉"
                      : "Your order is on its way ✨"}
                </h2>
              </div>

              <div className="text-3xl">
                {isCancelled
                  ? "❌"
                  : currentStatus === "delivered"
                    ? "🏠"
                    : "📦"}
              </div>
            </div>

            {isCancelled ? (
              <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-950/30 p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-xl">
                    ❌
                  </div>

                  <div>
                    <p className="font-bold text-red-300">
                      This order has been cancelled.
                    </p>

                    <p className="mt-1.5 text-sm leading-6 text-red-200/70">
                      If you believe this was unexpected, please contact
                      MineNote support with your Order ID.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 sm:mt-7">
                <div className="relative">
                  <div className="absolute left-[19px] top-5 hidden h-[calc(100%-40px)] w-px bg-white/[0.08] sm:block" />

                  <div className="space-y-5 sm:space-y-0">
                    {STATUS_STEPS.map((step) => {
                      const stepIndex =
                        STATUS_ORDER.indexOf(step.id);

                      const completed =
                        currentStatusIndex >= stepIndex;

                      const current =
                        currentStatus === step.id;

                      return (
                        <div
                          key={step.id}
                          className="relative flex gap-4 sm:min-h-[74px]"
                        >
                          <div
                            className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-lg transition ${
                              completed
                                ? "border-yellow-400 bg-yellow-400 text-black shadow-lg shadow-yellow-400/10"
                                : "border-white/[0.08] bg-black text-zinc-600"
                            } ${
                              current
                                ? "ring-4 ring-yellow-400/10"
                                : ""
                            }`}
                          >
                            {completed ? "✓" : step.icon}
                          </div>

                          <div className="min-w-0 pb-5 sm:pb-6">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3
                                className={`font-bold ${
                                  completed
                                    ? "text-white"
                                    : "text-zinc-500"
                                }`}
                              >
                                {step.title}
                              </h3>

                              {current && (
                                <span className="rounded-full bg-yellow-400/10 px-3 min-h-10.5 py-1 text-[10px] font-black uppercase tracking-wider text-yellow-400">
                                  Current
                                </span>
                              )}
                            </div>

                            <p
                              className={`mt-1 text-sm ${
                                completed
                                  ? "text-zinc-400"
                                  : "text-zinc-600"
                              }`}
                            >
                              {step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Main grid */}
          <div className="mt-5 grid gap-5 sm:mt-6 sm:gap-6 lg:grid-cols-[1.2fr_0.8fr] xl:gap-8">
            {/* Items */}
            <section className="rounded-3xl border border-white/[0.07] bg-zinc-900 p-4 shadow-xl shadow-black/10 sm:p-6 md:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-600">
                    Your Purchase
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    Ordered Items 🛍️
                  </h2>
                </div>

                <span className="rounded-full bg-black px-4 min-h-10 py-2 text-xs font-bold text-zinc-500">
                  {items.length}{" "}
                  {items.length === 1 ? "item" : "items"}
                </span>
              </div>

              {items.length > 0 ? (
                <div className="mt-7 space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 rounded-2xl border border-white/[0.06] bg-black p-3.5 sm:gap-5 sm:p-4"
                    >
                      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-950 sm:h-28 sm:w-24">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="96px"
                          className="object-contain p-1"
                        />
                      </div>

                      <div className="min-w-0 flex-1 py-1">
                        <h3 className="font-bold text-white">
                          {item.name}
                        </h3>

                        <p className="mt-2 text-sm text-zinc-500">
                          ₹
                          {item.price.toLocaleString(
                            "en-IN"
                          )}{" "}
                          × {item.quantity}
                        </p>

                        <p className="mt-3 text-sm font-bold text-yellow-400">
                          ₹
                          {(
                            item.price *
                            item.quantity
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-7 rounded-2xl bg-black p-6 text-sm text-zinc-500">
                  No item details are available for this order.
                </div>
              )}

              <div className="mt-7 flex items-center justify-between border-t border-white/[0.07] pt-6">
                <span className="font-semibold text-zinc-400">
                  Order Total
                </span>

                <span className="text-2xl font-black text-yellow-400">
                  ₹
                  {Number(typedOrder.total).toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-3xl border border-white/[0.07] bg-zinc-900 p-4 shadow-xl shadow-black/10 sm:p-6 md:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-600">
                Payment
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Payment Details 💳
              </h2>

              <div className="mt-6 space-y-3">
                {typedOrder.refund_status && (
                  <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-lg">
                        ↩️
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-300/70">
                          Refund Information
                        </p>

                        <p className="mt-1 font-bold text-emerald-200">
                          {typedOrder.refund_status === "processed"
                            ? "Refund Processed"
                            : typedOrder.refund_status}
                        </p>

                        {typedOrder.refund_amount != null && (
                          <p className="mt-1 text-sm text-emerald-200/70">
                            ₹
                            {Number(
                              typedOrder.refund_amount
                            ).toLocaleString("en-IN")}{" "}
                            refunded
                          </p>
                        )}

                        {typedOrder.refund_processed_at && (
                          <p className="mt-2 text-xs text-emerald-200/50">
                            Processed on{" "}
                            {formatDate(
                              typedOrder.refund_processed_at
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}


                <div className="rounded-2xl border border-white/[0.05] bg-black/70 p-4 sm:p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                    Method
                  </p>

                  <p className="mt-2 font-bold">
                    {paymentIsCod
                      ? "💵 Cash on Delivery"
                      : "💳 Online Payment"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.05] bg-black/70 p-4 sm:p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                    Payment Status
                  </p>

                  <p className="mt-2 font-bold capitalize">
                    {typedOrder.payment_status ||
                      "Pending"}
                  </p>

                  {typedOrder.paid_at && (
                    <p className="mt-1 text-xs text-zinc-600">
                      Received {formatDate(typedOrder.paid_at)}
                    </p>
                  )}
                </div>

                {!paymentIsCod &&
                  typedOrder.razorpay_payment_id && (
                    <div className="rounded-2xl border border-white/[0.05] bg-black/70 p-4 sm:p-5">
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                        Payment ID
                      </p>

                      <p className="mt-2 break-all font-mono break-all text-xs text-zinc-400">
                        {typedOrder.razorpay_payment_id}
                      </p>
                    </div>
                  )}
              </div>
            </section>
          </div>

          {/* Delivery + shipment */}
          <div className="mt-5 grid gap-5 sm:mt-6 sm:gap-6 md:grid-cols-2 lg:gap-8">
            <section className="rounded-3xl border border-white/[0.07] bg-zinc-900 p-4 shadow-xl shadow-black/10 sm:p-6 md:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-600">
                Delivery
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Delivery Details 📍
              </h2>

              <div className="mt-6 space-y-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                    Customer
                  </p>

                  <p className="mt-1 font-semibold">
                    {typedOrder.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                    Phone
                  </p>

                  <p className="mt-1 font-semibold">
                    {typedOrder.phone}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                    Email
                  </p>

                  <p className="mt-1 break-all font-semibold">
                    {typedOrder.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                    Address
                  </p>

                  <p className="mt-1 font-semibold leading-6">
                    {typedOrder.address}
                    <br />
                    {typedOrder.city}, {typedOrder.state}
                    <br />
                    {typedOrder.pin}
                  </p>
                </div>

                <div className="rounded-2xl border border-yellow-400/10 bg-yellow-400/[0.03] p-4 sm:p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                    Estimated Delivery
                  </p>

                  <p className="mt-2 font-bold text-yellow-400">
                    {typedOrder.delivery || "Will be updated soon"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/[0.07] bg-zinc-900 p-4 shadow-xl shadow-black/10 sm:p-6 md:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-600">
                Fulfillment
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Shipment Tracking 🚚
              </h2>

              {typedOrder.shipping_partner ||
              typedOrder.tracking_id ||
              typedOrder.shipped_at ||
              typedOrder.delivered_at ? (
                <div className="mt-6 space-y-3">
                  {typedOrder.shipping_partner && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                        Shipping Partner
                      </p>

                      <p className="mt-1 font-semibold">
                        {typedOrder.shipping_partner}
                      </p>
                    </div>
                  )}

                  {typedOrder.tracking_id && (
                    <div className="rounded-2xl border border-white/[0.05] bg-black/70 p-4 sm:p-5">
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                        Tracking ID
                      </p>

                      <p className="mt-2 break-all font-mono break-all font-bold text-yellow-400">
                        {typedOrder.tracking_id}
                      </p>
                    </div>
                  )}

                  {typedOrder.shipped_at && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                        Shipped
                      </p>

                      <p className="mt-1 font-semibold">
                        {formatDate(typedOrder.shipped_at)}
                      </p>
                    </div>
                  )}

                  {typedOrder.delivered_at && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                        Delivered
                      </p>

                      <p className="mt-1 font-semibold">
                        {formatDate(typedOrder.delivered_at)}
                      </p>
                    </div>
                  )}

                  {typedOrder.tracking_url && (
                    <a
                      href={typedOrder.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-yellow-400 px-6 py-4 font-black text-black transition-all hover:-translate-y-0.5 hover:bg-yellow-300 sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    >
                      Track Shipment →
                    </a>
                  )}
                </div>
              ) : (
                <div className="mt-7 rounded-2xl border border-white/[0.05] bg-black p-6">
                  <div className="text-3xl">📦</div>

                  <p className="mt-4 font-bold">
                    Shipment details coming soon
                  </p>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Tracking information will appear here once your
                    order has been handed over to the shipping partner.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Actions */}
          <section className="mt-5 rounded-3xl border border-white/[0.07] bg-zinc-900 p-4 sm:mt-6 sm:p-6 md:p-7">
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <Link
                href="/account/orders"
                className="rounded-2xl border border-white/[0.08] bg-black py-4 text-center font-bold text-white transition-all hover:-translate-y-0.5 hover:border-yellow-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                ← Back to My Orders
              </Link>

              <Link
                href="/products"
                className="rounded-2xl bg-yellow-400 py-4 text-center font-black text-black shadow-lg shadow-yellow-400/10 transition-all hover:-translate-y-0.5 hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Explore More Designs →
              </Link>
            </div>
          </section>

          <p className="mt-6 px-4 text-center text-xs leading-5 text-zinc-700 sm:mt-8">
            Need help with your order? Keep your Order ID ready when
            contacting MineNote support.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
