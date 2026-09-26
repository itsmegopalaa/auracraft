import { createSupabaseAdminClient } from "@/app/lib/supabase";
import { sendOrderConfirmationEmail } from "@/app/services/orders";

const supabaseAdmin = createSupabaseAdminClient();

type FinalizePaymentIntentInput = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  paidAt?: string;
};

export async function finalizePaymentIntent({
  razorpayOrderId,
  razorpayPaymentId,
  paidAt,
}: FinalizePaymentIntentInput) {
  const orderId = String(razorpayOrderId).trim();
  const paymentId = String(razorpayPaymentId).trim();

  if (!orderId || !paymentId) {
    throw new Error("Payment identifiers are required.");
  }

  const { data: intent, error: intentError } =
    await supabaseAdmin
      .from("payment_intents")
      .select("*")
      .eq("razorpay_order_id", orderId)
      .maybeSingle();

  if (intentError) {
    console.error("PAYMENT INTENT LOOKUP ERROR:", intentError);
    throw new Error("Unable to load payment recovery record.");
  }

  if (!intent) {
    throw new Error("Payment recovery record was not found.");
  }

  if (
    intent.razorpay_payment_id &&
    intent.razorpay_payment_id !== paymentId
  ) {
    throw new Error("Payment reference mismatch.");
  }

  /*
   * First check whether another finalizer already created
   * the real MineNote order.
   */
  const { data: existingOrder, error: existingOrderError } =
    await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("razorpay_order_id", orderId)
      .maybeSingle();

  if (existingOrderError) {
    console.error(
      "FINALIZE EXISTING ORDER LOOKUP ERROR:",
      existingOrderError
    );
    throw new Error("Unable to check existing order.");
  }

  if (existingOrder) {
    if (existingOrder.customer_id !== intent.customer_id) {
      throw new Error(
        "Payment order belongs to another customer."
      );
    }

    if (
      existingOrder.razorpay_payment_id &&
      existingOrder.razorpay_payment_id !== paymentId
    ) {
      throw new Error("Payment reference mismatch.");
    }

    await supabaseAdmin
      .from("payment_intents")
      .update({
        status: "finalized",
        payment_status: "paid",
        razorpay_payment_id: paymentId,
        paid_at:
          existingOrder.paid_at ??
          paidAt ??
          new Date().toISOString(),
        finalized_at: new Date().toISOString(),
      })
      .eq("id", intent.id);

    return {
      order: existingOrder,
      alreadyExists: true,
      emailSent: false,
    };
  }

  const finalPaidAt =
    paidAt ??
    intent.paid_at ??
    new Date().toISOString();

  /*
   * IMPORTANT:
   * Inventory is still modified ONLY inside the existing
   * atomic order RPC.
   */
  const { data, error } = await supabaseAdmin.rpc(
    intent.custom_cover_id
      ? "create_order_with_custom_cover"
      : "create_order_with_inventory",
    {
      p_customer_id: intent.customer_id,
      p_order_id: intent.mine_note_order_id,
      p_name: intent.name,
      p_phone: intent.phone,
      p_email: intent.email,
      p_address: intent.address,
      p_city: intent.city,
      p_state: intent.state,
      p_pin: intent.pin,
      p_payment_method: "Razorpay",
      p_payment_status: "paid",
      p_order_status: "confirmed",
      p_items: intent.items,
      p_total: intent.total,
      p_razorpay_order_id: intent.razorpay_order_id,
      p_razorpay_payment_id: paymentId,
      p_delivery: intent.delivery,
      p_paid_at: finalPaidAt,

      ...(intent.custom_cover_id
        ? {
            p_custom_cover_id: intent.custom_cover_id,
            p_custom_cover_snapshot:
              intent.custom_cover_snapshot,
          }
        : {}),
    }
  );

  if (error) {
    /*
     * Browser callback and webhook can race.
     * If the other transaction won, recover by reading
     * the already-created order.
     */
    const { data: concurrentOrder } =
      await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("razorpay_order_id", orderId)
        .maybeSingle();

    if (concurrentOrder) {
      await supabaseAdmin
        .from("payment_intents")
        .update({
          status: "finalized",
          payment_status: "paid",
          razorpay_payment_id: paymentId,
          paid_at:
            concurrentOrder.paid_at ??
            finalPaidAt,
          finalized_at: new Date().toISOString(),
        })
        .eq("id", intent.id);

      return {
        order: concurrentOrder,
        alreadyExists: true,
        emailSent: false,
      };
    }

    console.error(
      "PAYMENT INTENT FINALIZATION RPC ERROR:",
      error.message
    );
    console.error(
      "PAYMENT INTENT FINALIZATION RPC CODE:",
      error.code
    );
    console.error(
      "PAYMENT INTENT FINALIZATION RPC DETAILS:",
      error.details
    );

    throw new Error(
      error.message ||
        "Unable to finalize paid order."
    );
  }

  const emailSent =
    await sendOrderConfirmationEmail({
      orderId: intent.mine_note_order_id,
      name: intent.name,
      email: intent.email,
      address: intent.address,
      city: intent.city,
      state: intent.state,
      pin: intent.pin,
      paymentMethod: "Razorpay",
      orderStatus: "confirmed",
      total: intent.total,
      items: intent.items,
    });

  const { error: finalizeError } =
    await supabaseAdmin
      .from("payment_intents")
      .update({
        status: "finalized",
        payment_status: "paid",
        razorpay_payment_id: paymentId,
        paid_at: finalPaidAt,
        finalized_at: new Date().toISOString(),
      })
      .eq("id", intent.id);

  if (finalizeError) {
    console.error(
      "PAYMENT INTENT FINAL STATUS UPDATE ERROR:",
      finalizeError
    );
  }

  return {
    order: data,
    alreadyExists: false,
    emailSent,
  };
}
