import { notFound } from "next/navigation";
import Image from "next/image";
import { requireAdmin } from "@/app/lib/admin-auth";
import { createClient } from "@/utils/supabase/server";
import OrderStatusForm from "./OrderStatusForm";
import FulfillmentForm from "./FulfillmentForm";
import ProductionChecklist from "./ProductionChecklist";
import RefundForm from "./RefundForm";
import Link from "next/link";

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
      <main className="min-h-screen bg-zinc-50 px-4 py-6 dark:bg-zinc-950 sm:px-6 sm:py-8 md:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
            MineNote Admin
          </h1>

          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
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

  const { data: shipment } = await supabase
    .from("shipments")
    .select(
      "id, status, courier_name, awb, tracking_url, label_url, shipping_charge, product_printed, cover_verified, notebook_assembled, quality_checked, packed, handed_over, checklist_updated_at"
    )
    .eq("order_id", order.order_id)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 dark:bg-zinc-950 sm:px-6 sm:py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 sm:mb-8">
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100"
          >
            ← Back to orders
          </Link>

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-bold sm:text-2xl text-zinc-900 dark:text-zinc-100 sm:text-3xl">
                {order.order_id}
              </h1>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {new Date(order.created_at).toLocaleString("en-IN")}
              </p>
            </div>

            <span className="w-fit rounded-full bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {order.order_status}
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
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

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Shipping Address
            </h2>

            <div className="mt-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
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

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
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

              <RefundForm
                orderId={order.order_id}
                total={Number(order.total)}
                paymentStatus={order.payment_status}
                refundStatus={order.refund_status}
                refundAmount={order.refund_amount}
                refundId={order.refund_id}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Order Status
            </h2>

            <p className="mt-5 text-xl font-bold capitalize text-zinc-900 dark:text-zinc-100 sm:text-2xl">
              {order.order_status}
            </p>

            <div className="mt-5 border-t border-zinc-100 dark:border-zinc-800 pt-5">
              <OrderStatusForm
                orderId={order.order_id}
                currentStatus={order.order_status}
              />
            </div>
          </section>
        </div>

        <section className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:mt-6 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Fulfillment
            </h2>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Automated shipping and production workflow.
            </p>
          </div>

          {shipment ? (
            <>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Shipment
                  </p>
                  <p className="mt-1 text-sm font-semibold capitalize text-zinc-900 dark:text-zinc-100">
                    {shipment.status.replaceAll("_", " ")}
                  </p>
                </div>

                <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Courier
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {shipment.courier_name || "Pending"}
                  </p>
                </div>

                <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    AWB
                  </p>
                  <p className="mt-1 break-all text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {shipment.awb || "Pending"}
                  </p>
                </div>

                <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Shipping Charge
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {shipment.shipping_charge != null
                      ? `₹${shipment.shipping_charge}`
                      : "Pending"}
                  </p>
                </div>
              </div>

              {shipment.tracking_url && (
                <div className="mt-4">
                  <a
                    href={shipment.tracking_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-zinc-700 underline underline-offset-4 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
                  >
                    Track Shipment ↗
                  </a>
                </div>
              )}

              {shipment.label_url && (
                <div className="mt-2">
                  <a
                    href={shipment.label_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-zinc-700 underline underline-offset-4 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
                  >
                    Open Shipping Label ↗
                  </a>
                </div>
              )}

              <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">
                <ProductionChecklist
                  orderId={order.order_id}
                  shipmentStatus={shipment.status}
                  checklist={{
                    product_printed: shipment.product_printed,
                    cover_verified: shipment.cover_verified,
                    notebook_assembled: shipment.notebook_assembled,
                    quality_checked: shipment.quality_checked,
                    packed: shipment.packed,
                    handed_over: shipment.handed_over,
                  }}
                />
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-zinc-300 p-5 dark:border-zinc-700">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Automated shipment not created yet.
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                The system will create the shipment automatically after the
                order passes payment and shipping validation.
              </p>
            </div>
          )}

          <details className="mt-6">
            <summary className="cursor-pointer text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              Manual fulfillment fallback
            </summary>

            <div className="mt-4">
              <FulfillmentForm
                orderId={order.order_id}
                shippingPartner={order.shipping_partner}
                trackingId={order.tracking_id}
                trackingUrl={order.tracking_url}
                shippedAt={order.shipped_at}
                deliveredAt={order.delivered_at}
              />
            </div>
          </details>
        </section>

        <section className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:mt-6 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Ordered Items
            </h2>

            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {Array.isArray(order.items) ? order.items.length : 0} item
              {Array.isArray(order.items) && order.items.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-5 divide-y divide-zinc-100">
            {Array.isArray(order.items) && order.items.length > 0 ? (
              order.items.map((item: {
                id: number;
                name: string;
                price: number;
                quantity: number;
                image: string;
              }) => {
                const lineTotal = Number(item.price) * Number(item.quantity);

                return (
                  <div
                    key={item.id}
                    className="flex gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4 sm:py-5"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 sm:h-20 sm:w-20">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        ₹{Number(item.price).toLocaleString("en-IN")} ×{" "}
                        {item.quantity}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        ₹{lineTotal.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="py-5 text-sm text-zinc-500 dark:text-zinc-400">
                No item details available.
              </p>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between gap-4 border-t border-zinc-200 pt-4 dark:border-zinc-800 sm:mt-6 sm:pt-5">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Order Total
            </span>

            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
              ₹{Number(order.total).toLocaleString("en-IN")}
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
