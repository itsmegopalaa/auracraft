import { requireAdmin } from "@/app/lib/admin-auth";
import { createSupabaseAdminClient } from "@/app/lib/supabase";
import CustomCoversClient from "./CustomCoversClient";

export default async function AdminCustomCoversPage() {
  await requireAdmin();

  const supabase = createSupabaseAdminClient();

  const { data: customizations } = await supabase
    .from("custom_cover_customizations")
    .select(
      "id, customer_id, product_id, creation_method, status, version, template_id, customer_name, customer_text, physical_config, customer_approved_at, admin_approved_at, admin_approved_by, rejection_reason, created_at, updated_at",
    )
    .order("updated_at", { ascending: false })
    .limit(500);

  const rows = customizations ?? [];

  const productIds = [
    ...new Set(
      rows
        .map((row) => row.product_id)
        .filter((id) => id !== null && id !== undefined),
    ),
  ];

  const [{ data: products }, { data: orders }] = await Promise.all([
    productIds.length
      ? supabase
          .from("products")
          .select("id, name, image, active")
          .in("id", productIds)
      : Promise.resolve({ data: [] }),

    rows.length
      ? supabase
          .from("orders")
          .select(
            "id, order_id, custom_cover_id, name, email, phone, total, payment_status, order_status, created_at",
          )
          .in(
            "custom_cover_id",
            rows.map((row) => row.id),
          )
      : Promise.resolve({ data: [] }),
  ]);

  const productMap = new Map(
    (products ?? []).map((product) => [String(product.id), product]),
  );

  const orderMap = new Map(
    (orders ?? []).map((order) => [String(order.custom_cover_id), order]),
  );

  const items = rows.map((row) => {
    const order = orderMap.get(String(row.id)) ?? null;
    const product = productMap.get(String(row.product_id)) ?? null;

    return {
      id: row.id,
      customerId: row.customer_id,
      productId: row.product_id,
      creationMethod: row.creation_method,
      status: row.status,
      version: row.version,
      customerName:
        row.customer_name || order?.name || "Customer",
      customerText: row.customer_text,
      physicalConfig:
        row.physical_config &&
        typeof row.physical_config === "object" &&
        !Array.isArray(row.physical_config)
          ? row.physical_config
          : {},
      customerApprovedAt: row.customer_approved_at,
      adminApprovedAt: row.admin_approved_at,
      adminApprovedBy: row.admin_approved_by,
      rejectionReason: row.rejection_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      product: product
        ? {
            id: product.id,
            name: product.name,
            image: product.image,
            active: product.active,
          }
        : null,
      order: order
        ? {
            id: order.id,
            orderId: order.order_id,
            name: order.name,
            email: order.email,
            phone: order.phone,
            total: Number(order.total),
            paymentStatus: order.payment_status,
            orderStatus: order.order_status,
            createdAt: order.created_at,
          }
        : null,
      artwork: [],
      artworkComplete: false,
    };
  });

  const summary = {
    total: items.length,
    customerApproved: items.filter(
      (item) => item.status === "customer_approved",
    ).length,
    adminReview: items.filter(
      (item) => item.status === "admin_review",
    ).length,
    approvedForPrint: items.filter(
      (item) => item.status === "approved_for_print",
    ).length,
    rejected: items.filter(
      (item) => item.status === "rejected",
    ).length,
  };

  return (
    <CustomCoversClient
      items={items}
      summary={summary}
    />
  );
}
