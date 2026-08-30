import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

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
      return "bg-green-400/10 text-green-300 border-green-400/20";

    case "shipped":
      return "bg-blue-400/10 text-blue-300 border-blue-400/20";

    case "cancelled":
      return "bg-red-400/10 text-red-300 border-red-400/20";

    case "confirmed":
    case "processing":
      return "bg-yellow-400/10 text-yellow-300 border-yellow-400/20";

    default:
      return "bg-zinc-800 text-zinc-300 border-zinc-700";
  }
}

export default async function AccountOrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
        order_id,
        payment_method,
        payment_status,
        paid_at,
        order_status,
        items,
        total,
        delivery,
        shipping_partner,
        tracking_id,
        tracking_url,
        shipped_at,
        delivered_at,
        created_at
      `
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("ACCOUNT ORDERS ERROR:", error);
  }

  const customerOrders = (orders ?? []) as Order[];

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              href="/account"
              className="text-sm font-semibold text-yellow-400 hover:underline"
            >
              ← Back to My Account
            </Link>

            <h1 className="mt-5 text-4xl font-extrabold md:text-5xl">
              My Orders 📦
            </h1>

            <p className="mt-3 text-zinc-400">
              View your MineNote order history and track your purchases.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/track-order"
              className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold transition hover:border-yellow-400 hover:text-yellow-300"
            >
              🔎 Track as Guest
            </Link>

            <Link
              href="/products"
              className="w-fit rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold transition hover:border-yellow-400 hover:text-yellow-300"
            >
              Continue Shopping →
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mt-10 rounded-3xl border border-red-500/30 bg-red-950/30 p-7 text-red-200">
            Unable to load your orders right now. Please try again later.
          </div>
        ) : customerOrders.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center">
            <div className="text-5xl">📦</div>

            <h2 className="mt-5 text-2xl font-bold">
              No orders yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-zinc-400">
              Your MineNote purchases will appear here after you place
              your first order.
            </p>

            <Link
              href="/products"
              className="mt-7 inline-flex rounded-full bg-yellow-400 px-6 py-3 font-bold text-black transition hover:bg-yellow-300"
            >
              Explore Notebooks
            </Link>
          </div>
        ) : (
          <div className="mt-10 space-y-5">
            {customerOrders.map((order) => (
              <article
                key={order.order_id}
                className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-yellow-400/30 md:p-7"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Order ID
                    </p>

                    <h2 className="mt-1 text-xl font-extrabold text-yellow-400">
                      {order.order_id}
                    </h2>

                    <p className="mt-2 text-sm text-zinc-500">
                      Placed on {formatDate(order.created_at)}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full border px-4 py-2 text-sm font-bold ${statusClasses(
                      order.order_status
                    )}`}
                  >
                    {statusLabel(order.order_status)}
                  </span>
                </div>

                <div className="mt-6 rounded-2xl border border-zinc-800 bg-black p-5">
                  <p className="text-sm font-semibold text-zinc-400">
                    Products
                  </p>

                  <div className="mt-4 space-y-3">
                    {(Array.isArray(order.items) ? order.items : []).map(
                      (item, index) => {
                        const itemRecord =
                          typeof item === "object" &&
                          item !== null
                            ? (item as Record<string, unknown>)
                            : {};

                        const name =
                          typeof itemRecord.name === "string"
                            ? itemRecord.name
                            : "MineNote Product";

                        const image =
                          typeof itemRecord.image === "string" &&
                          itemRecord.image.length > 0
                            ? itemRecord.image
                            : "/images/notebooks/placeholder.png";

                        const quantity =
                          typeof itemRecord.quantity === "number"
                            ? itemRecord.quantity
                            : 1;

                        const price =
                          typeof itemRecord.price === "number"
                            ? itemRecord.price
                            : 0;

                        return (
                          <div
                            key={`${order.order_id}-${name}-${index}`}
                            className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-3"
                          >
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
                              <Image
                                src={image}
                                alt={name}
                                fill
                                sizes="80px"
                                className="object-cover transition duration-300 hover:scale-105"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold text-white">
                                {name}
                              </p>

                              <p className="mt-1 text-sm text-zinc-500">
                                Quantity: {quantity}
                              </p>

                              <p className="mt-1 text-sm font-semibold text-yellow-400">
                                ₹{price * quantity}
                              </p>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-black p-5">
                    <p className="text-sm text-zinc-500">
                      Total
                    </p>

                    <p className="mt-1 text-xl font-extrabold text-yellow-400">
                      ₹{order.total}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black p-5">
                    <p className="text-sm text-zinc-500">
                      Payment
                    </p>

                    <p className="mt-1 font-semibold">
                      {order.payment_method === "COD"
                        ? "Cash on Delivery"
                        : "Online Payment"}
                    </p>

                    <p className="mt-1 text-xs capitalize text-zinc-500">
                      {order.payment_status ?? "pending"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black p-5">
                    <p className="text-sm text-zinc-500">
                      Delivery
                    </p>

                    <p className="mt-1 font-semibold">
                      {order.delivery ?? "—"}
                    </p>
                  </div>
                </div>

                {order.shipping_partner && order.tracking_id && (
                  <div className="mt-5 rounded-2xl border border-blue-400/20 bg-blue-400/5 p-5">
                    <p className="text-sm font-semibold text-blue-300">
                      🚚 Shipment
                    </p>

                    <p className="mt-2 text-sm text-zinc-300">
                      {order.shipping_partner} · {order.tracking_id}
                    </p>

                    {order.tracking_url && (
                      <a
                        href={order.tracking_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-sm font-semibold text-yellow-400 hover:underline"
                      >
                        Track Shipment →
                      </a>
                    )}
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/track-order?orderId=${encodeURIComponent(
                      order.order_id
                    )}`}
                    className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold transition hover:border-yellow-400 hover:text-yellow-300"
                  >
                    View Tracking
                  </Link>

                  <Link
                    href={`/account/orders/${encodeURIComponent(
                      order.order_id
                    )}`}
                    className="rounded-full bg-yellow-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-yellow-300"
                  >
                    View Order →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
