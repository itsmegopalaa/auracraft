import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { logAdminAction } from "@/app/lib/admin-audit";
import { createServerSupabaseClient } from "@/app/lib/supabase";
import { refundRazorpayPayment } from "@/app/services/payments";

type RefundRequestBody = {
  amount?: unknown;
};

function isPositiveInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value > 0
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const adminAuth = await requireAdminApi();

    if (adminAuth.error) {
      return NextResponse.json(
        {
          success: false,
          error: adminAuth.error,
        },
        { status: adminAuth.status }
      );
    }

    const { orderId } = await context.params;

    let body: RefundRequestBody = {};

    try {
      body = (await request.json()) as RefundRequestBody;
    } catch {
      body = {};
    }

    const requestedAmount =
      body.amount === undefined || body.amount === null
        ? null
        : Number(body.amount);

    if (
      requestedAmount !== null &&
      !isPositiveInteger(requestedAmount)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Refund amount must be a positive integer in rupees.",
        },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        [
          "order_id",
          "order_status",
          "total",
          "payment_method",
          "payment_status",
          "razorpay_order_id",
          "razorpay_payment_id",
          "refund_status",
          "refund_id",
          "refund_amount",
          "refund_processed_at",
        ].join(", ")
      )
      .eq("order_id", orderId)
      .maybeSingle();

    if (orderError) {
      console.error("ADMIN REFUND ORDER LOAD ERROR:", {
        message: orderError.message,
        code: orderError.code,
        details: orderError.details,
        hint: orderError.hint,
      });

      return NextResponse.json(
        {
          success: false,
          error: "Unable to load order.",
        },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    const refundOrder = order as unknown as {
      order_id: string;
      order_status: string | null;
      total: number | string | null;
      payment_method: string | null;
      payment_status: string | null;
      razorpay_order_id: string | null;
      razorpay_payment_id: string | null;
      refund_status: string | null;
      refund_id: string | null;
      refund_amount: number | null;
      refund_processed_at: string | null;
    };

    if (refundOrder.order_status !== "cancelled") {
      return NextResponse.json(
        {
          success: false,
          error:
            `Order cannot be refunded because its status is "${refundOrder.order_status}". Cancel the order before processing a refund.`,
        },
        { status: 409 }
      );
    }

    if (refundOrder.payment_method !== "Razorpay") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only Razorpay payments can be refunded through this endpoint.",
        },
        { status: 400 }
      );
    }

    if (refundOrder.payment_status !== "paid") {
      return NextResponse.json(
        {
          success: false,
          error:
            `Payment is not refundable because payment status is "${refundOrder.payment_status}".`,
        },
        { status: 400 }
      );
    }

    if (!refundOrder.razorpay_payment_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Razorpay payment ID is missing.",
        },
        { status: 400 }
      );
    }

    if (refundOrder.refund_status === "processed") {
      return NextResponse.json(
        {
          success: false,
          error: "This order has already been fully refunded.",
          refundId: refundOrder.refund_id,
          refundAmount: refundOrder.refund_amount,
        },
        { status: 409 }
      );
    }

    if (refundOrder.refund_status === "pending") {
      return NextResponse.json(
        {
          success: false,
          error:
            "A refund is already marked as pending for this order. Check Razorpay before retrying.",
        },
        { status: 409 }
      );
    }

    const totalAmount = Number(refundOrder.total);

    if (!isPositiveInteger(totalAmount)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid order total.",
        },
        { status: 500 }
      );
    }

    const previouslyRefundedAmount =
      refundOrder.refund_amount === null
        ? 0
        : Number(refundOrder.refund_amount);

    if (!Number.isInteger(previouslyRefundedAmount) || previouslyRefundedAmount < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid existing refund amount.",
        },
        { status: 500 }
      );
    }

    if (previouslyRefundedAmount >= totalAmount) {
      return NextResponse.json(
        {
          success: false,
          error: "The full refundable amount has already been refunded.",
          refundAmount: previouslyRefundedAmount,
        },
        { status: 409 }
      );
    }

    const remainingRefundableAmount =
      totalAmount - previouslyRefundedAmount;

    const refundAmount =
      requestedAmount ?? remainingRefundableAmount;

    if (refundAmount > remainingRefundableAmount) {
      return NextResponse.json(
        {
          success: false,
          error:
            `Refund amount cannot exceed the remaining refundable amount of ₹${remainingRefundableAmount}.`,
          remainingRefundableAmount,
        },
        { status: 400 }
      );
    }

    const cumulativeRefundAmount =
      previouslyRefundedAmount + refundAmount;

    /*
     * Mark the refund as pending before calling Razorpay.
     * This prevents a second admin request from blindly
     * starting another refund while the first one is running.
     */
    const { data: pendingOrder, error: pendingError } = await supabase
      .from("orders")
      .update({
        refund_status: "pending",
      })
      .eq("order_id", refundOrder.order_id)
      .or(
        "refund_status.is.null,refund_status.eq.failed,refund_status.eq.partial"
      )
      .select("order_id, refund_status")
      .maybeSingle();

    if (pendingError) {
      console.error(
        "ADMIN REFUND PENDING UPDATE ERROR:",
        pendingError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to lock the order for refund processing.",
        },
        { status: 500 }
      );
    }

    if (!pendingOrder) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Refund state changed before processing. Please refresh the order and try again.",
        },
        { status: 409 }
      );
    }

    let refundResult;

    try {
      refundResult = await refundRazorpayPayment({
        razorpayPaymentId:
          refundOrder.razorpay_payment_id,
        refundAmount,
        mineNoteOrderId: refundOrder.order_id,
        orderId: refundOrder.order_id,
      });
    } catch (error) {
      console.error("RAZORPAY REFUND SERVICE ERROR:", error);

      await supabase
        .from("orders")
        .update({
          refund_status: "failed",
        })
        .eq("order_id", refundOrder.order_id)
        .eq("refund_status", "pending");

      const status =
        error &&
        typeof error === "object" &&
        "status" in error &&
        typeof error.status === "number"
          ? error.status
          : 502;

      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Razorpay refund failed.",
        },
        { status: status >= 400 && status < 600 ? status : 502 }
      );
    }

    const refundId = refundResult.id;
    const refundData = refundResult.raw;

    const finalRefundStatus =
      cumulativeRefundAmount === totalAmount
        ? "processed"
        : "partial";

    const refundProcessedAt = new Date().toISOString();

    const { data: updatedOrder, error: updateError } =
      await supabase
        .from("orders")
        .update({
          refund_status: finalRefundStatus,
          refund_id: refundId,
          refund_amount: cumulativeRefundAmount,
          refund_processed_at: refundProcessedAt,
        })
        .eq("order_id", refundOrder.order_id)
        .eq("refund_status", "pending")
        .select(
          [
            "order_id",
            "payment_status",
            "refund_status",
            "refund_id",
            "refund_amount",
            "refund_processed_at",
          ].join(", ")
        )
        .single();

    if (updateError) {
      /*
       * IMPORTANT:
       * At this point Razorpay has already accepted the refund.
       * We deliberately do NOT call Razorpay again.
       */
      console.error(
        "ADMIN REFUND DATABASE UPDATE ERROR AFTER RAZORPAY SUCCESS:",
        {
          message: updateError.message,
          code: updateError.code,
          details: updateError.details,
          hint: updateError.hint,
          refundId,
          orderId: refundOrder.order_id,
        }
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Refund was created at Razorpay, but MineNote could not save the refund record. Do not retry blindly; verify the Razorpay refund first.",
          refundId,
        },
        { status: 500 }
      );
    }

    await logAdminAction({
      adminUserId: adminAuth.user?.id ?? null,
      source: "admin",
      action: "order.refund_processed",
      entityType: "order",
      entityId: refundOrder.order_id,
      beforeData: {
        refund_status: refundOrder.refund_status,
        refund_amount: refundOrder.refund_amount,
        refund_processed_at: refundOrder.refund_processed_at,
      },
      afterData: {
        refund_status: finalRefundStatus,
        refund_amount: cumulativeRefundAmount,
        refund_processed_at: refundProcessedAt,
      },
      metadata: {
        refund_type:
          finalRefundStatus === "processed"
            ? "full"
            : "partial",
        amount_rupees: refundAmount,
        cumulative_refund_amount_rupees: cumulativeRefundAmount,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        finalRefundStatus === "processed"
          ? "Refund processed successfully."
          : "Partial refund processed successfully.",
      order: updatedOrder,
      razorpayRefund: {
        id: refundId,
        amount: refundAmount,
        amountPaise: refundAmount * 100,
        cumulativeAmount: cumulativeRefundAmount,
        cumulativeAmountPaise: cumulativeRefundAmount * 100,
        status:
          typeof refundData === "object" &&
          refundData !== null &&
          "status" in refundData
            ? String(refundData.status ?? "")
            : null,
      },
    });
  } catch (error) {
    console.error("ADMIN REFUND API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unexpected refund error.",
      },
      { status: 500 }
    );
  }
}
