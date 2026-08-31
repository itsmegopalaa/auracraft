import { getServerEnv } from "@/app/config";

import { NextResponse } from "next/server";
import crypto from "crypto";
import { createSupabaseAdminClient } from "@/app/lib/supabase";

const supabaseAdmin = createSupabaseAdminClient();

type RazorpayPaymentEntity = {
  id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
};

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    payment?: {
      entity?: RazorpayPaymentEntity;
    };
  };
};

function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
) {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature.length !== signature.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}

export async function POST(request: Request) {
  try {
    const webhookSecret = getServerEnv().razorpayWebhookSecret;

    if (!webhookSecret) {
      console.error(
        "RAZORPAY_WEBHOOK_SECRET is not configured."
      );

      return NextResponse.json(
        {
          error: "Webhook secret is not configured.",
        },
        { status: 500 }
      );
    }

    const rawBody = await request.text();

    const signature = request.headers.get(
      "x-razorpay-signature"
    );

    if (!signature) {
      return NextResponse.json(
        {
          error: "Missing Razorpay signature.",
        },
        { status: 400 }
      );
    }

    const signaturesMatch = verifyWebhookSignature(
      rawBody,
      signature,
      webhookSecret
    );

    if (!signaturesMatch) {
      console.error(
        "Invalid Razorpay webhook signature."
      );

      return NextResponse.json(
        {
          error: "Invalid webhook signature.",
        },
        { status: 400 }
      );
    }

    let payload: RazorpayWebhookPayload;

    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      console.error(
        "Invalid Razorpay webhook JSON:",
        error
      );

      return NextResponse.json(
        {
          error: "Invalid webhook payload.",
        },
        { status: 400 }
      );
    }

    const event = payload.event;

    
    /*
     * We only need to change order/payment state for
     * these two payment events.
     *
     * Other Razorpay events are acknowledged safely.
     */
    if (
      event !== "payment.captured" &&
      event !== "payment.failed"
    ) {
      return NextResponse.json({
        received: true,
        handled: false,
      });
    }

    const payment =
      payload.payload?.payment?.entity;

    const razorpayOrderId = payment?.order_id;
    const razorpayPaymentId = payment?.id;

    if (!razorpayOrderId) {
      console.error(
        "Razorpay webhook is missing order_id."
      );

      return NextResponse.json(
        {
          error: "Missing Razorpay order ID.",
        },
        { status: 400 }
      );
    }

    /*
     * Load our order using the Razorpay order ID.
     */
    const { data: existingOrder, error: orderLoadError } =
      await supabaseAdmin
        .from("orders")
        .select(
          "order_id, total, payment_status, order_status, razorpay_order_id, razorpay_payment_id, paid_at"
        )
        .eq("razorpay_order_id", razorpayOrderId)
        .maybeSingle();

    if (orderLoadError) {
      console.error(
        "SUPABASE WEBHOOK ORDER LOAD ERROR:",
        orderLoadError
      );

      return NextResponse.json(
        {
          error: "Unable to load order.",
        },
        { status: 500 }
      );
    }

    /*
     * If the browser/payment flow has not created our
     * internal order yet, don't invent an order here.
     *
     * The webhook is acknowledged so Razorpay doesn't
     * endlessly retry a legitimate event.
     */
    if (!existingOrder) {
      console.error(
        "No MineNote order found for Razorpay order:",
        razorpayOrderId
      );

      /*
       * IMPORTANT:
       *
       * Do not acknowledge this webhook as successfully
       * processed. The browser may still be completing the
       * internal MineNote order creation.
       *
       * Returning 500 tells Razorpay to retry the webhook.
       */
      return NextResponse.json(
        {
          error:
            "MineNote order not found yet. Please retry webhook.",
        },
        { status: 500 }
      );
    }

    /*
     * PAYMENT CAPTURED
     */
    if (event === "payment.captured") {
      if (!razorpayPaymentId) {
        console.error(
          "Captured payment is missing payment ID."
        );

        return NextResponse.json(
          {
            error: "Missing Razorpay payment ID.",
          },
          { status: 400 }
        );
      }

      /*
       * Verify currency.
       */
      if (payment?.currency !== "INR") {
        console.error(
          "Unexpected Razorpay payment currency:",
          payment?.currency
        );

        return NextResponse.json(
          {
            error: "Invalid payment currency.",
          },
          { status: 400 }
        );
      }

      /*
       * Verify the captured amount against the
       * amount stored in our order.
       *
       * Our database stores rupees.
       * Razorpay sends amount in paise.
       */
      const expectedAmount =
        Number(existingOrder.total) * 100;

      const receivedAmount = Number(
        payment.amount
      );

      if (
        !Number.isFinite(expectedAmount) ||
        !Number.isFinite(receivedAmount) ||
        expectedAmount !== receivedAmount
      ) {
        console.error(
          "RAZORPAY PAYMENT AMOUNT MISMATCH:",
          {
            orderId: existingOrder.order_id,
            razorpayOrderId,
            expectedAmount,
            receivedAmount,
          }
        );

        return NextResponse.json(
          {
            error: "Payment amount mismatch.",
          },
          { status: 400 }
        );
      }

      /*
       * Idempotency:
       *
       * If the order is already marked paid, do not
       * overwrite paid_at on a repeated webhook.
       */
      if (existingOrder.payment_status === "paid") {
        
        return NextResponse.json({
          received: true,
          handled: true,
          alreadyProcessed: true,
        });
      }

      const paidAt =
        existingOrder.paid_at ??
        new Date().toISOString();

      const { error: updateError } =
        await supabaseAdmin
          .from("orders")
          .update({
            payment_status: "paid",
            order_status: "confirmed",
            razorpay_payment_id:
              razorpayPaymentId,
            paid_at: paidAt,
          })
          .eq(
            "razorpay_order_id",
            razorpayOrderId
          );

      if (updateError) {
        console.error(
          "SUPABASE WEBHOOK CAPTURE UPDATE ERROR:",
          updateError
        );

        return NextResponse.json(
          {
            error: "Unable to update paid order.",
          },
          { status: 500 }
        );
      }

      
      return NextResponse.json({
        received: true,
        handled: true,
        paymentStatus: "paid",
      });
    }

    /*
     * PAYMENT FAILED
     *
     * A failed payment should NOT automatically cancel
     * the customer's order. They may retry payment.
     */
    if (event === "payment.failed") {
      /*
       * If payment is already successfully paid,
       * never downgrade it because of a later/replayed
       * failed event.
       */
      if (existingOrder.payment_status === "paid") {
        
        return NextResponse.json({
          received: true,
          handled: true,
          ignored: true,
        });
      }

      const { error: updateError } =
        await supabaseAdmin
          .from("orders")
          .update({
            payment_status: "failed",
          })
          .eq(
            "razorpay_order_id",
            razorpayOrderId
          );

      if (updateError) {
        console.error(
          "SUPABASE FAILED PAYMENT UPDATE ERROR:",
          updateError
        );

        return NextResponse.json(
          {
            error:
              "Unable to update failed payment.",
          },
          { status: 500 }
        );
      }

      
      return NextResponse.json({
        received: true,
        handled: true,
        paymentStatus: "failed",
      });
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "RAZORPAY WEBHOOK ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Webhook processing failed.",
      },
      { status: 500 }
    );
  }
}