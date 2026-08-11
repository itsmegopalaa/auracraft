import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not configured.");

      return NextResponse.json(
        { error: "Webhook secret is not configured." },
        { status: 500 }
      );
    }

    const rawBody = await request.text();

    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing Razorpay signature." },
        { status: 400 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const signaturesMatch =
      expectedSignature.length === signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature)
      );

    if (!signaturesMatch) {
      console.error("Invalid Razorpay webhook signature.");

      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 400 }
      );
    }

    const payload = JSON.parse(rawBody);

    const event = payload.event;

    console.log("RAZORPAY WEBHOOK EVENT:", event);

    if (event === "payment.captured") {
      const payment = payload.payload?.payment?.entity;

      const razorpayOrderId = payment?.order_id;
      const razorpayPaymentId = payment?.id;

      if (!razorpayOrderId || !razorpayPaymentId) {
        return NextResponse.json(
          { error: "Missing payment information." },
          { status: 400 }
        );
      }

      const { error } = await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "paid",
          order_status: "confirmed",
          razorpay_payment_id: razorpayPaymentId,
        })
        .eq("razorpay_order_id", razorpayOrderId);

      if (error) {
        console.error("SUPABASE WEBHOOK UPDATE ERROR:", error);

        return NextResponse.json(
          { error: "Unable to update order." },
          { status: 500 }
        );
      }
    }

    if (event === "payment.failed") {
      const payment = payload.payload?.payment?.entity;

      const razorpayOrderId = payment?.order_id;

      if (razorpayOrderId) {
        const { error } = await supabaseAdmin
          .from("orders")
          .update({
            payment_status: "failed",
            order_status: "pending",
          })
          .eq("razorpay_order_id", razorpayOrderId);

        if (error) {
          console.error(
            "SUPABASE FAILED PAYMENT UPDATE ERROR:",
            error
          );

          return NextResponse.json(
            { error: "Unable to update failed payment." },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("RAZORPAY WEBHOOK ERROR:", error);

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}
