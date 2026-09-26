import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const auth = await requireAdminApi();

  if (auth.error) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status },
    );
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q")?.trim().toLowerCase() ?? "";

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_id, customer_id, name, email, phone, total, payment_method, payment_status, razorpay_order_id, razorpay_payment_id, refund_status, refund_id, refund_amount, refund_processed_at, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(2000);

  if (error) {
    console.error("Admin payments query failed:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load payments." },
      { status: 500 },
    );
  }

  const allPayments = (data ?? []).map((order) => ({
    ...order,
    total: Number(order.total ?? 0),
    refund_amount:
      order.refund_amount == null
        ? null
        : Number(order.refund_amount),
  }));

  const summary = {
    total: allPayments.length,
    paid: allPayments.filter((p) => p.payment_status === "paid").length,
    pending: allPayments.filter(
      (p) => p.payment_status === "pending",
    ).length,
    failed: allPayments.filter(
      (p) => p.payment_status === "failed",
    ).length,
    refunded: allPayments.filter(
      (p) =>
        p.refund_status === "processed" ||
        p.refund_status === "partial",
    ).length,
    paid_value: allPayments
      .filter((p) => p.payment_status === "paid")
      .reduce((sum, p) => sum + p.total, 0),
  };

  let payments = allPayments;

  if (search) {
    payments = payments.filter((payment) =>
      [
        payment.order_id,
        payment.name,
        payment.email,
        payment.phone,
        payment.payment_method,
        payment.payment_status,
        payment.razorpay_order_id,
        payment.razorpay_payment_id,
        payment.refund_id,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search),
    );
  }

  return NextResponse.json({
    success: true,
    payments: payments.slice(0, 500),
    result_count: payments.length,
    summary,
  });
}
