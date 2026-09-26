import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/app/lib/supabase";
import { calculateOrder } from "@/app/lib/order-pricing";
import { verifyRazorpayPayment } from "@/app/services/payments";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { finalizePaymentIntent } from "@/app/services/payments/finalize-payment-intent";

const supabaseAdmin = createSupabaseAdminClient();

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be signed in to place an order.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      orderId,
      name,
      phone,
      email,
      address,
      city,
      state,
      pin,
      paymentMethod,
      items,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body;

    if (
      !orderId ||
      !name ||
      !phone ||
      !email ||
      !address ||
      !city ||
      !state ||
      !pin ||
      !paymentMethod ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Missing required order fields.",
        },
        { status: 400 }
      );
    }

    if (paymentMethod !== "Razorpay") {
      return NextResponse.json(
        {
          error: "Invalid payment method.",
        },
        { status: 400 }
      );
    }

    let calculatedOrder;

    try {
      calculatedOrder = await calculateOrder(items);
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Invalid cart.",
        },
        { status: 400 }
      );
    }

    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return NextResponse.json(
        {
          error: "Missing Razorpay verification details.",
        },
        { status: 400 }
      );
    }

    /*
     * The browser callback must prove the payment is genuine.
     * The final order itself is reconstructed from payment_intents.
     */
    try {
      await verifyRazorpayPayment({
        razorpayOrderId: String(razorpayOrderId),
        razorpayPaymentId: String(razorpayPaymentId),
        razorpaySignature: String(razorpaySignature),
        expectedAmount: Math.round(
          calculatedOrder.total * 100
        ),
        customerId: user.id,
        mineNoteOrderId: String(orderId),
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Razorpay payment could not be validated.";

      const status =
        message ===
        "Payment order does not match this customer or order."
          ? 403
          : message ===
              "Unable to validate the Razorpay order." ||
            message ===
              "Unable to validate the Razorpay payment."
            ? 502
            : message ===
                "Payment gateway is not configured."
              ? 500
              : 400;

      return NextResponse.json(
        { error: message },
        { status }
      );
    }

    /*
     * Verify that this payment intent belongs to the
     * authenticated customer and the MineNote order reference.
     */
    const { data: intent, error: intentError } =
      await supabaseAdmin
        .from("payment_intents")
        .select(
          "id, customer_id, mine_note_order_id, razorpay_order_id, amount, currency"
        )
        .eq(
          "razorpay_order_id",
          String(razorpayOrderId)
        )
        .maybeSingle();

    if (intentError) {
      console.error(
        "PAYMENT INTENT LOOKUP ERROR:",
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
      return NextResponse.json(
        {
          error:
            "Payment recovery record was not found.",
        },
        { status: 409 }
      );
    }

    if (intent.customer_id !== user.id) {
      return NextResponse.json(
        {
          error:
            "Payment order belongs to another customer.",
        },
        { status: 403 }
      );
    }

    if (
      intent.mine_note_order_id !==
      String(orderId)
    ) {
      return NextResponse.json(
        {
          error:
            "Payment order reference mismatch.",
        },
        { status: 400 }
      );
    }

    if (
      intent.currency !== "INR" ||
      intent.amount !==
        Math.round(calculatedOrder.total * 100)
    ) {
      console.error(
        "PAYMENT INTENT AMOUNT MISMATCH:",
        {
          intentAmount: intent.amount,
          calculatedAmount:
            Math.round(
              calculatedOrder.total * 100
            ),
        }
      );

      return NextResponse.json(
        {
          error:
            "Payment amount does not match the checkout.",
        },
        { status: 400 }
      );
    }

    try {
      const result =
        await finalizePaymentIntent({
          razorpayOrderId:
            String(razorpayOrderId),
          razorpayPaymentId:
            String(razorpayPaymentId),
          paidAt: new Date().toISOString(),
        });

      return NextResponse.json({
        success: true,
        alreadyExists: result.alreadyExists,
        order: result.order,
        emailSent: result.emailSent,
      });
    } catch (error) {
      console.error(
        "PAYMENT INTENT FINALIZATION ERROR:",
        error
      );

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
  } catch (error) {
    console.error("ORDER API ERROR:", error);

    return NextResponse.json(
      {
        error: "Invalid order request.",
      },
      { status: 400 }
    );
  }
}
