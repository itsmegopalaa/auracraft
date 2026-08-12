import { notFound } from "next/navigation";
import { requireAdmin } from "@/app/lib/admin-auth";
import { createClient } from "@/utils/supabase/server";
import OrderStatusForm from "./OrderStatusForm";

type PageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function AdminOrderDetailPage({
  params,
}: PageProps) {
  await requireAdmin();

  const { orderId } = await params;

  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) {
    console.error("ADMIN ORDER DETAIL ERROR:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    return (
      <main className="min-h-screen bg-zinc-50 p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-zinc-900">
            MineNote Admin
          </h1>

          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-800">
              Unable to load order
            </h2>

            <pre className="mt-4 whitespace-pre-wrap text-sm text-red-700">
              {JSON.stringify(
                {
                  message: error.message,
                  code: error.code,
                  details: error.details,
                  hint: error.hint,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-6 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <a
            href="/admin/orders"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
          >
            ← Back to orders
          </a>

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900">
                {order.order_id}
              </h1>

              <p className="mt-1 text-sm text-zinc-500">
                {new Date(order.created_at).toLocaleString("en-IN")}
              </p>
            </div>

            <span className="w-fit rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700">
              {order.order_status}
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">
              Customer
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <p>
                <span className="font-medium">Name:</span>{" "}
                {order.name}
              </p>

              <p>
                <span className="font-medium">Email:</span>{" "}
                {order.email}
              </p>

              <p>
                <span className="font-medium">Phone:</span>{" "}
                {order.phone}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">
              Shipping Address
            </h2>

            <div className="mt-5 text-sm leading-6 text-zinc-600">
              <p>{order.address}</p>
              <p>
                {order.city}, {order.state}
              </p>
              <p>PIN: {order.pin}</p>
            </div>

            <p className="mt-4 text-sm">
              <span className="font-medium">Delivery:</span>{" "}
              {order.delivery}
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">
              Payment
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <p>
                <span className="font-medium">Method:</span>{" "}
                {order.payment_method}
              </p>

              <p>
                <span className="font-medium">Status:</span>{" "}
                {order.payment_status}
              </p>

              <p>
                <span className="font-medium">Total:</span>{" "}
                ₹{order.total}
              </p>

              {order.razorpay_order_id && (
                <p className="break-all">
                  <span className="font-medium">
                    Razorpay Order:
                  </span>{" "}
                  {order.razorpay_order_id}
                </p>
              )}

              {order.razorpay_payment_id && (
                <p className="break-all">
                  <span className="font-medium">
                    Razorpay Payment:
                  </span>{" "}
                  {order.razorpay_payment_id}
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">
              Order Status
            </h2>

            <p className="mt-5 text-2xl font-bold capitalize text-zinc-900">
              {order.order_status}
            </p>

            <div className="mt-5 border-t border-zinc-100 pt-5">
              <OrderStatusForm
                orderId={order.order_id}
                currentStatus={order.order_status}
              />
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">
            Ordered Items
          </h2>

          <pre className="mt-5 overflow-x-auto rounded-xl bg-zinc-950 p-5 text-sm text-zinc-100">
            {JSON.stringify(order.items, null, 2)}
          </pre>
        </section>
      </div>
    </main>
  );
}
