import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getCustomerOrders } from "@/app/services/orders/order-reader";

type Order = {
  order_id: string;
  payment_method: string;
  payment_status: string | null;
  paid_at: string | null;
  order_status: string | null;
  items: unknown;
  total: number;
  delivery: string | null;
  shipping_partner: string | null;
  tracking_id: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
};

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(status: string | null) {
  if (!status) return "Placed";

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusClasses(status: string | null) {
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

function statusIcon(status: string | null) {
  switch (status) {
    case "delivered":
      return "✓";

    case "shipped":
      return "🚚";

    case "processing":
      return "📦";

    case "confirmed":
      return "✓";

    case "cancelled":
      return "×";

    default:
      return "•";
  }
}

function getItemCount(items: unknown) {
  if (!Array.isArray(items)) return 0;

  return items.reduce((total, item) => {
    if (
      typeof item === "object" &&
      item !== null &&
      typeof (item as Record<string, unknown>).quantity === "number"
    ) {
      return total + Number((item as Record<string, unknown>).quantity);
    }

    return total + 1;
  }, 0);
}

export default async function AccountOrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let customerOrders: Order[] = [];
  let error: Error | null = null;

  try {
    const orders = await getCustomerOrders(user.id);
    customerOrders = orders as Order[];
  } catch (err) {
    console.error("ACCOUNT ORDERS ERROR:", err);
    error = err instanceof Error ? err : new Error("Unable to load orders");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-black px-4 py-10 text-white sm:px-6 sm:py-14 md:py-20">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="flex flex-col gap-5 border-b border-white/[0.06] pb-7 sm:gap-6 sm:pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              href="/account"
              className="text-sm font-semibold text-yellow-400 transition hover:text-yellow-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              ← Back to My Account
            </Link>

            <div className="mt-4 flex flex-wrap items-center gap-3 sm:mt-5">
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                My Orders
              </h1>

              <span className="rounded-full border border-white/[0.07] bg-zinc-900 px-4 min-h-10 py-1 text-xs font-bold text-zinc-500">
                {customerOrders.length}
              </span>
            </div>

            <p className="mt-2.5 max-w-xl text-sm leading-6 text-zinc-500 sm:mt-3 sm:text-base">
              View your MineNote order history, payment details, and
              shipment progress.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:flex sm:w-auto sm:flex-row">
            <Link
              href="/track-order"
              className="rounded-2xl border border-white/[0.08] bg-zinc-950 px-5 py-3 text-center text-sm font-bold text-zinc-300 transition hover:-translate-y-0.5 hover:border-yellow-400/30 hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              🔎 Track as Guest
            </Link>

            <Link
              href="/products"
              className="rounded-2xl bg-yellow-400 px-5 py-3 text-center text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Continue Shopping →
            </Link>
          </div>
        </div>

        {/* Error */}
        {error ? (
          <div className="mt-6 rounded-3xl border border-red-500/20 bg-red-950/20 p-5 sm:mt-8 sm:p-7">
            <div className="text-3xl">⚠️</div>

            <h2 className="mt-4 text-xl font-black">
              Unable to load your orders
            </h2>

            <p className="mt-2 text-sm leading-6 text-red-200/60">
              Something went wrong while loading your order history.
              Please try again later.
            </p>
          </div>
        ) : customerOrders.length === 0 ? (
          /* Empty State */
          <div className="mt-6 rounded-3xl border border-white/[0.07] bg-zinc-900 p-6 text-center sm:mt-8 sm:p-10 md:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-black text-4xl">
              📦
            </div>

            <h2 className="mt-6 text-2xl font-black">
              No orders yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
              Your MineNote purchases will appear here after you
              place your first order.
            </p>

            <Link
              href="/products"
              className="mt-7 inline-flex rounded-2xl bg-yellow-400 px-6 py-3.5 font-black text-black transition hover:-translate-y-0.5 hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Explore Notebooks →
            </Link>
          </div>
        ) : (
          /* Orders */
          <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
            {customerOrders.map((order) => {
              const itemCount = getItemCount(order.items);
              const items = Array.isArray(order.items)
                ? order.items
                : [];

              const firstItem =
                typeof items[0] === "object" &&
                items[0] !== null
                  ? (items[0] as Record<string, unknown>)
                  : {};

              const firstName =
                typeof firstItem.name === "string"
                  ? firstItem.name
                  : "MineNote Product";

              const firstImage =
                typeof firstItem.image === "string" &&
                firstItem.image.length > 0
                  ? firstItem.image
                  : "/images/notebooks/placeholder.png";

              const hasShipment =
                Boolean(order.shipping_partner) ||
                Boolean(order.tracking_id);

              return (
                <article
                  key={order.order_id}
                  className="overflow-hidden rounded-3xl border border-white/[0.07] bg-zinc-900 transition duration-300 hover:border-yellow-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  {/* Order Header */}
                  <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 sm:gap-4 sm:p-6 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-600">
                          Order
                        </p>

                        <span className="text-xs text-zinc-700">
                          •
                        </span>

                        <p className="text-xs text-zinc-500">
                          {formatDate(order.created_at)}
                        </p>
                      </div>

                      <h2 className="mt-1 break-all text-lg font-black text-yellow-400 sm:text-xl">
                        {order.order_id}
                      </h2>
                    </div>

                    <span
                      className={`flex w-fit items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-black ${statusClasses(
                        order.order_status
                      )}`}
                    >
                      <span>
                        {statusIcon(order.order_status)}
                      </span>

                      {statusLabel(order.order_status)}
                    </span>
                  </div>

                  {/* Product Preview */}
                  <div className="p-4 sm:p-6">
                    <div className="flex gap-3 sm:gap-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/[0.06] bg-black sm:h-24 sm:w-24">
                        <Image
                          src={firstImage}
                          alt={firstName}
                          fill
                          sizes="96px"
                          className="object-contain p-1"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-600">
                          Products
                        </p>

                        <h3 className="mt-1 truncate font-bold text-white">
                          {firstName}
                        </h3>

                        <p className="mt-1 text-sm text-zinc-500">
                          {itemCount}{" "}
                          {itemCount === 1 ? "item" : "items"}
                          {items.length > 1
                            ? ` · ${items.length} designs`
                            : ""}
                        </p>

                        {items.length > 1 && (
                          <p className="mt-2 text-xs text-zinc-600">
                            + {items.length - 1} more{" "}
                            {items.length - 1 === 1
                              ? "design"
                              : "designs"}
                          </p>
                        )}
                      </div>

                      <div className="hidden text-right sm:block">
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                          Total
                        </p>

                        <p className="mt-1 text-xl font-black text-yellow-400">
                          ₹
                          {Number(order.total).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Mobile Total */}
                    <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/[0.05] bg-black px-4 py-3 sm:hidden">
                      <span className="text-sm font-semibold text-zinc-500">
                        Order Total
                      </span>

                      <span className="font-black text-yellow-400">
                        ₹
                        {Number(order.total).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white/[0.04] bg-black p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">
                          Payment
                        </p>

                        <p className="mt-1 text-sm font-bold text-zinc-200">
                          {order.payment_method === "COD"
                            ? "Cash on Delivery"
                            : "Online Payment"}
                        </p>

                        <p className="mt-1 text-xs capitalize text-zinc-600">
                          {order.payment_status ?? "pending"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/[0.04] bg-black p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">
                          Delivery
                        </p>

                        <p className="mt-1 text-sm font-bold text-zinc-200">
                          {order.delivery ?? "—"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/[0.04] bg-black p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">
                          Shipment
                        </p>

                        <p className="mt-1 text-sm font-bold text-zinc-200">
                          {hasShipment
                            ? "Tracking available"
                            : "Not shipped yet"}
                        </p>
                      </div>
                    </div>

                    {/* Shipment */}
                    {hasShipment && (
                      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-blue-400/10 bg-blue-400/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-wider text-blue-300/70">
                            🚚 Shipment
                          </p>

                          <p className="mt-1 truncate text-sm font-semibold text-zinc-300">
                            {order.shipping_partner ?? "Shipping Partner"}
                            {order.tracking_id
                              ? ` · ${order.tracking_id}`
                              : ""}
                          </p>
                        </div>

                        {order.tracking_url && (
                          <a
                            href={order.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-sm font-bold text-yellow-400 transition hover:text-yellow-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                          >
                            Track Shipment →
                          </a>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 grid gap-3 sm:mt-5 sm:flex sm:justify-end">
                      <Link
                        href={`/track-order?orderId=${encodeURIComponent(
                          order.order_id
                        )}`}
                        className="rounded-2xl border border-white/[0.08] bg-black px-5 py-3 text-center text-sm font-bold text-zinc-300 transition hover:-translate-y-0.5 hover:border-yellow-400/30 hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      >
                        View Tracking
                      </Link>

                      <Link
                        href={`/account/orders/${encodeURIComponent(
                          order.order_id
                        )}`}
                        className="rounded-2xl bg-yellow-400 px-5 py-3 text-center text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      >
                        View Order →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <p className="mt-6 px-4 text-center text-xs leading-5 text-zinc-700 sm:mt-8">
          Need help with an order? Keep your Order ID ready when
          contacting MineNote support.
        </p>
      </div>
    </main>
  );
}
