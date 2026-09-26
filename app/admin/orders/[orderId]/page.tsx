import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/app/lib/admin-auth";
import { createClient } from "@/utils/supabase/server";
import OrderCommandCenter from "./OrderCommandCenter";

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
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/30 sm:p-6">
            <h1 className="font-semibold text-red-800 dark:text-red-300">
              Unable to load order
            </h1>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-sm text-red-700 dark:text-red-300">
              {JSON.stringify(
                {
                  message: error.message,
                  code: error.code,
                  details: error.details,
                  hint: error.hint,
                },
                null,
                2,
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
      "id, status, courier_name, awb, tracking_url, label_url, shipping_charge",
    )
    .eq("order_id", order.id)
    .maybeSingle();

  const productionChecklist = {
    product_printed: Boolean(order.product_printed),
    cover_verified: Boolean(order.cover_verified),
    notebook_assembled: Boolean(order.notebook_assembled),
    quality_checked: Boolean(order.quality_checked),
    packed: Boolean(order.packed),
  };

  const { data: customCover } = order.custom_cover_id
    ? await supabase
        .from("custom_cover_customizations")
        .select("*")
        .eq("id", order.custom_cover_id)
        .maybeSingle()
    : { data: null };

  const { data: auditTimeline } = await supabase
    .from("admin_audit_logs")
    .select(
      "id, source, action, entity_type, entity_id, before_data, after_data, metadata, created_at, admin_user_id",
    )
    .or(
      `entity_id.eq.${order.order_id},entity_id.eq.${order.id}${
        order.custom_cover_id
          ? `,entity_id.eq.${order.custom_cover_id}`
          : ""
      }`,
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 dark:bg-zinc-950 sm:px-6 sm:py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <OrderCommandCenter
          orderId={order.order_id}
          orderStatus={order.order_status}
          paymentStatus={order.payment_status}
          paymentMethod={
            typeof order.payment_method === "string"
              ? order.payment_method
              : null
          }
          razorpayOrderId={
            typeof order.razorpay_order_id === "string"
              ? order.razorpay_order_id
              : null
          }
          razorpayPaymentId={
            typeof order.razorpay_payment_id === "string"
              ? order.razorpay_payment_id
              : null
          }
          total={Number(order.total)}
          customerName={
            typeof order.name === "string" ? order.name : null
          }
          customerEmail={
            typeof order.email === "string" ? order.email : null
          }
          customerPhone={
            typeof order.phone === "string" ? order.phone : null
          }
          shippingAddress={
            typeof order.address === "string" ? order.address : null
          }
          shippingCity={
            typeof order.city === "string" ? order.city : null
          }
          shippingState={
            typeof order.state === "string" ? order.state : null
          }
          shippingPin={
            typeof order.pin === "string" ? order.pin : null
          }
          deliveryMethod={
            typeof order.delivery === "string" ? order.delivery : null
          }
          shippingPartner={
            typeof order.shipping_partner === "string"
              ? order.shipping_partner
              : null
          }
          trackingId={
            typeof order.tracking_id === "string"
              ? order.tracking_id
              : null
          }
          trackingUrl={
            typeof order.tracking_url === "string"
              ? order.tracking_url
              : null
          }
          shippedAt={
            typeof order.shipped_at === "string"
              ? order.shipped_at
              : null
          }
          deliveredAt={
            typeof order.delivered_at === "string"
              ? order.delivered_at
              : null
          }
          items={
            Array.isArray(order.items)
              ? order.items.map(
                  (item: {
                    id: number | string;
                    name: string;
                    price: number;
                    quantity: number;
                    image?: string | null;
                    pages?: number | null;
                    paper?: string | null;
                    paperGsm?: number | null;
                    paper_gsm?: number | null;
                    size?: string | null;
                    orientation?: string | null;
                    customCoverId?: string | null;
                    custom_cover_id?: string | null;
                  }) => ({
                    id: item.id,
                    name: item.name,
                    price: Number(item.price),
                    quantity: Number(item.quantity),
                    image:
                      typeof item.image === "string" && item.image
                        ? item.image
                        : "/images/notebooks/placeholder.png",
                    pages:
                      item.pages != null &&
                      Number.isFinite(Number(item.pages))
                        ? Number(item.pages)
                        : null,
                    paper:
                      typeof item.paper === "string" && item.paper
                        ? item.paper
                        : null,
                    paperGsm:
                      item.paperGsm != null &&
                      Number.isFinite(Number(item.paperGsm))
                        ? Number(item.paperGsm)
                        : item.paper_gsm != null &&
                            Number.isFinite(Number(item.paper_gsm))
                          ? Number(item.paper_gsm)
                          : null,
                    size:
                      typeof item.size === "string" && item.size
                        ? item.size
                        : null,
                    orientation:
                      typeof item.orientation === "string" &&
                      item.orientation
                        ? item.orientation
                        : null,
                    customCoverId:
                      item.customCoverId ??
                      item.custom_cover_id ??
                      null,
                  }),
                )
              : []
          }
          shipment={
            shipment
              ? {
                  id: shipment.id,
                  status: shipment.status,
                  courier_name: shipment.courier_name,
                  awb: shipment.awb,
                  tracking_url: shipment.tracking_url,
                  label_url: shipment.label_url,
                  shipping_charge:
                    shipment.shipping_charge != null
                      ? Number(shipment.shipping_charge)
                      : null,
                }
              : null
          }
          customCover={
            customCover
              ? {
                  id: customCover.id,
                  status:
                    typeof customCover.status === "string"
                      ? customCover.status
                      : "unknown",
                }
              : null
          }
          productionChecklist={productionChecklist}
          refundStatus={
            typeof order.refund_status === "string"
              ? order.refund_status
              : null
          }
          refundAmount={
            order.refund_amount != null
              ? Number(order.refund_amount)
              : null
          }
          refundId={
            typeof order.refund_id === "string"
              ? order.refund_id
              : null
          }
          timeline={(auditTimeline ?? []).map((event) => ({
            id: event.id,
            source: event.source,
            action: event.action,
            entityType: event.entity_type,
            entityId: event.entity_id,
            metadata:
              event.metadata &&
              typeof event.metadata === "object" &&
              !Array.isArray(event.metadata)
                ? event.metadata as Record<string, unknown>
                : {},
            createdAt: event.created_at,
          }))}
        />
      </div>
    </main>
  );
}
