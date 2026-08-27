import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

type PageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

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

function statusClasses(status: string | null) {
  switch (status) {
    case "delivered":
      return "border-green-400/20 bg-green-400/10 text-green-300";

    case "shipped":
      return "border-blue-400/20 bg-blue-400/10 text-blue-300";

    case "cancelled":
      return "border-red-400/20 bg-red-400/10 text-red-300";

    default:
      return "border-yellow-400/20 bg-yellow-400/10 text-yellow-300";
  }
}

function statusLabel(status: string | null) {
  if (!status) return "Placed";

  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default async function CustomerOrderPage({
  params,
}: PageProps) {
  const { orderId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
        order_id,
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
        shipping_partner,
        tracking_id,
        tracking_url,
        shipped_at,
        delivered_at,
        created_at
      `
    )
    .eq("order_id", orderId)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("CUSTOMER ORDER PAGE ERROR:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    notFound();
  }

  if (!order) {
    notFound();
  }

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white md:py-24">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/account/orders"
          className="text-sm font-semibold text-yellow-400 hover:underline"
        >
          ← Back to My Orders
        </Link>

        <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm text-zinc-500">
              Order ID
            </p>

            <h1 className="mt-1 text-3xl font-extrabold text-yellow-400 md:text-4xl">
              {order.order_id}
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>

          <span
            className={`w-fit rounded-full border px-5 py-2 text-sm font-bold ${statusClasses(
              order.order_status
            )}`}
          >
            {statusLabel(order.order_status)}
          </span>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-7 lg:col-span-2">
            <h2 className="text-2xl font-bold">
              Items 📦
            </h2>

            <div className="mt-6 space-y-4">
              {items.map((item, index) => {
                const itemRecord =
                  typeof item === "object" &&
                  item !== null
                    ? (item as Record<string, unknown>)
                    : {};

                const name =
                  typeof itemRecord.name === "string"
                    ? itemRecord.name
                    : "Item";

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
                    key={`${name}-${index}`}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-black p-5"
                  >
                    <div>
                      <p className="font-semibold">
                        {name}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        Quantity: {quantity}
                      </p>
                    </div>

                    <p className="font-bold text-yellow-400">
                      ₹{price * quantity}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-6">
              <span className="font-semibold text-zinc-400">
                Order Total
              </span>

              <span className="text-2xl font-extrabold text-yellow-400">
                ₹{order.total}
              </span>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-7">
            <h2 className="text-2xl font-bold">
              Payment
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm text-zinc-500">
                  Method
                </p>

                <p className="mt-1 font-semibold">
                  {order.payment_method === "COD"
                    ? "💵 Cash on Delivery"
                    : "💳 Online Payment"}
                </p>
              </div>

              <div>
                <p className="text-sm text-zinc-500">
                  Status
                </p>

                <p className="mt-1 font-semibold capitalize">
                  {order.payment_status ?? "pending"}
                </p>
              </div>

              {order.paid_at && (
                <div>
                  <p className="text-sm text-zinc-500">
                    Paid On
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {formatDate(order.paid_at)}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-7">
          <h2 className="text-2xl font-bold">
            Delivery 🚚
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-black p-5">
              <p className="text-sm text-zinc-500">
                Expected Delivery
              </p>

              <p className="mt-1 font-semibold">
                {order.delivery ?? "—"}
              </p>
            </div>

            <div className="rounded-2xl bg-black p-5">
              <p className="text-sm text-zinc-500">
                Shipping Partner
              </p>

              <p className="mt-1 font-semibold">
                {order.shipping_partner ?? "Not shipped yet"}
              </p>
            </div>

            <div className="rounded-2xl bg-black p-5">
              <p className="text-sm text-zinc-500">
                Tracking ID
              </p>

              <p className="mt-1 break-all font-semibold">
                {order.tracking_id ?? "Not available yet"}
              </p>
            </div>

            <div className="rounded-2xl bg-black p-5">
              <p className="text-sm text-zinc-500">
                Shipped
              </p>

              <p className="mt-1 font-semibold">
                {formatDate(order.shipped_at)}
              </p>
            </div>

            <div className="rounded-2xl bg-black p-5 md:col-span-2">
              <p className="text-sm text-zinc-500">
                Delivered
              </p>

              <p className="mt-1 font-semibold">
                {formatDate(order.delivered_at)}
              </p>
            </div>
          </div>

          {order.tracking_url && (
            <a
              href={order.tracking_url}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-full bg-yellow-400 px-6 py-3 font-bold text-black transition hover:bg-yellow-300"
            >
              Track Shipment →
            </a>
          )}
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-7">
          <h2 className="text-2xl font-bold">
            Delivery Address
          </h2>

          <div className="mt-5 rounded-2xl bg-black p-5 leading-relaxed text-zinc-300">
            {order.address}
            <br />
            {order.city}, {order.state}
            <br />
            PIN: {order.pin}
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/account/orders"
            className="rounded-full border border-zinc-700 px-6 py-3 font-semibold transition hover:border-yellow-400 hover:text-yellow-300"
          >
            ← All Orders
          </Link>

          <Link
            href="/products"
            className="rounded-full bg-yellow-400 px-6 py-3 font-bold text-black transition hover:bg-yellow-300"
          >
            Continue Shopping →
          </Link>
        </div>
      </div>
    </main>
  );
}
