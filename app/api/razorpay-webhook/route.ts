import { getServerEnv } from "@/app/config";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createSupabaseAdminClient } from "@/app/lib/supabase";
import { finalizePaymentIntent } from "@/app/services/payments/finalize-payment-intent";

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

export function verifyWebhookSignature(
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
    const webhookSecret =
      getServerEnv().razorpayWebhookSecret;

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

    if (
      !verifyWebhookSignature(
        rawBody,
        signature,
        webhookSecret
      )
    ) {
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
     * Only payment lifecycle events require processing.
     * Everything else is safely acknowledged.
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

    const razorpayOrderId =
      payment?.order_id;

    const razorpayPaymentId =
      payment?.id;

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
     * The payment intent is the recovery source of truth
     * before the real MineNote order exists.
     */
    const { data: intent, error: intentError } =
      await supabaseAdmin
        .from("payment_intents")
        .select(
          "id, customer_id, mine_note_order_id, razorpay_order_id, status, payment_status, amount, currency, razorpay_payment_id, paid_at"
        )
        .eq(
          "razorpay_order_id",
          razorpayOrderId
        )
        .maybeSingle();

    if (intentError) {
      console.error(
        "SUPABASE PAYMENT INTENT LOAD ERROR:",
        intentError
      );

      return NextResponse.json(
        {
          error:
            "Unable to load payment recovery record.",
        },
        { status: 500 }
      );
    }

    if (!intent) {
      /*
       * This should not normally happen because the payment
       * intent is created as part of checkout preparation.
       *
       * Return 500 so Razorpay retries rather than silently
       * losing a legitimate payment event.
       */
      console.error(
        "No payment intent found for Razorpay order:",
        razorpayOrderId
      );

      return NextResponse.json(
        {
          error:
            "Payment recovery record not found. Retry required.",
        },
        { status: 500 }
      );
    }

    /*
     * Verify currency for both captured and failed events
     * whenever Razorpay supplied it.
     */
    if (
      payment?.currency &&
      payment.currency !== "INR"
    ) {
      console.error(
        "Unexpected Razorpay payment currency:",
        payment.currency
      );

      return NextResponse.json(
        {
          error: "Invalid payment currency.",
        },
        { status: 400 }
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
       * Razorpay amount is paise.
       * payment_intents.amount is also stored in paise.
       */
      const expectedAmount =
        Number(intent.amount);

      const receivedAmount =
        Number(payment.amount);

      if (
        !Number.isFinite(expectedAmount) ||
        !Number.isFinite(receivedAmount) ||
        expectedAmount !== receivedAmount
      ) {
        console.error(
          "RAZORPAY PAYMENT AMOUNT MISMATCH:",
          {
            mineNoteOrderId:
              intent.mine_note_order_id,
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
       * If a different payment ID was already attached to
       * this intent, never overwrite it.
       */
      if (
        intent.razorpay_payment_id &&
        intent.razorpay_payment_id !==
          razorpayPaymentId
      ) {
        console.error(
          "RAZORPAY PAYMENT ID MISMATCH:",
          {
            razorpayOrderId,
            existingPaymentId:
              intent.razorpay_payment_id,
            receivedPaymentId:
              razorpayPaymentId,
          }
        );

        return NextResponse.json(
          {
            error:
              "Payment reference mismatch.",
          },
          { status: 400 }
        );
      }

      /*
       * Finalizer handles:
       *
       * 1. Browser already created order
       * 2. Webhook creates order first
       * 3. Browser + webhook race
       * 4. Duplicate webhook
       *
       * Inventory remains protected by the existing atomic
       * order RPC.
       */
      try {
        const result =
          await finalizePaymentIntent({
            razorpayOrderId,
            razorpayPaymentId,
            paidAt:
              intent.paid_at ??
              new Date().toISOString(),
          });

        return NextResponse.json({
          received: true,
          handled: true,
          alreadyProcessed:
            result.alreadyExists,
          paymentStatus: "paid",
          orderId:
            result.order?.order_id ??
            intent.mine_note_order_id,
        });
      } catch (error) {
        console.error(
          "WEBHOOK PAYMENT FINALIZATION ERROR:",
          error
        );

        /*
         * Returning 500 is intentional.
         *
         * If finalization failed before the real order
         * existed, Razorpay should retry the webhook.
         */
        return NextResponse.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "Unable to finalize paid order.",
          },
          { status: 500 }
        );
      }
    }

    /*
     * PAYMENT FAILED
     *
     * No MineNote order is created for a failed payment.
     * The recovery record is marked failed so it remains
     * auditable.
     */
    if (event === "payment.failed") {
      /*
       * Never downgrade a payment intent that is already
       * successfully finalized.
       */
      if (
        intent.payment_status === "paid" ||
        intent.status === "finalized"
      ) {
        return NextResponse.json({
          received: true,
          handled: true,
          ignored: true,
        });
      }

      const updatePayload: {
        status: "failed";
        payment_status: "failed";
        razorpay_payment_id?: string;
      } = {
        status: "failed",
        payment_status: "failed",
      };

      if (razorpayPaymentId) {
        updatePayload.razorpay_payment_id =
          razorpayPaymentId;
      }

      const { error: updateError } =
        await supabaseAdmin
          .from("payment_intents")
          .update(updatePayload)
          .eq("id", intent.id);

      if (updateError) {
        console.error(
          "SUPABASE PAYMENT INTENT FAILED UPDATE ERROR:",
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
      handled: false,
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
