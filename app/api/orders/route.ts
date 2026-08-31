import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/app/lib/supabase";
import { calculateOrder } from "@/app/lib/order-pricing";
import { verifyRazorpayPayment } from "@/app/services/payments";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { sendOrderConfirmationEmail } from "@/app/services/orders";

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

    if (!["COD", "Razorpay"].includes(paymentMethod)) {
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

    let paymentStatus = "pending";
    let orderStatus = "placed";

    if (paymentMethod === "Razorpay") {
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

      try {
        await verifyRazorpayPayment({
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
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

      paymentStatus = "paid";
      orderStatus = "confirmed";

      /*
       * Idempotency:
       *
       * A successful Razorpay payment may cause the browser
       * callback to be retried. Never create a second
       * MineNote order for the same Razorpay order/payment.
       */
      const { data: existingPaymentOrder, error: existingOrderError } =
        await supabaseAdmin
          .from("orders")
          .select(
            "order_id, customer_id, payment_status, order_status, razorpay_order_id, razorpay_payment_id"
          )
          .eq(
            "razorpay_order_id",
            String(razorpayOrderId)
          )
          .maybeSingle();

      if (existingOrderError) {
        console.error(
          "EXISTING RAZORPAY ORDER LOOKUP ERROR:",
          existingOrderError
        );

        return NextResponse.json(
          {
            error: "Unable to check existing payment order.",
          },
          { status: 500 }
        );
      }

      if (existingPaymentOrder) {
        if (
          existingPaymentOrder.customer_id !== user.id
        ) {
          console.error(
            "RAZORPAY ORDER BELONGS TO ANOTHER CUSTOMER:",
            String(razorpayOrderId)
          );

          return NextResponse.json(
            {
              error: "Unable to process this payment order.",
            },
            { status: 403 }
          );
        }

        if (
          existingPaymentOrder.razorpay_payment_id !==
          String(razorpayPaymentId)
        ) {
          console.error(
            "RAZORPAY PAYMENT ID MISMATCH FOR EXISTING ORDER:",
            {
              razorpayOrderId,
              existingPaymentId:
                existingPaymentOrder.razorpay_payment_id,
              receivedPaymentId:
                razorpayPaymentId,
            }
          );

          return NextResponse.json(
            {
              error: "Payment reference mismatch.",
            },
            { status: 400 }
          );
        }

        console.log(
          "Returning existing MineNote order for repeated Razorpay request:",
          existingPaymentOrder.order_id
        );

        return NextResponse.json({
          success: true,
          alreadyExists: true,
          order: existingPaymentOrder,
          emailSent: false,
        });
      }
    }

    const { data, error } = await supabaseAdmin.rpc(
      "create_order_with_inventory",
      {
        p_customer_id: user.id,
        p_order_id: String(orderId),
        p_name: String(name).trim(),
        p_phone: String(phone).trim(),
        p_email: String(email).trim(),
        p_address: String(address).trim(),
        p_city: String(city).trim(),
        p_state: String(state).trim(),
        p_pin: String(pin).trim(),
        p_payment_method: paymentMethod,
        p_payment_status: paymentStatus,
        p_order_status: orderStatus,
        p_items: calculatedOrder.items,
        p_total: calculatedOrder.total,
        p_razorpay_order_id:
          paymentMethod === "Razorpay"
            ? String(razorpayOrderId)
            : null,
        p_razorpay_payment_id:
          paymentMethod === "Razorpay"
            ? String(razorpayPaymentId)
            : null,
        p_delivery: "3-5 Working Days",
        p_paid_at:
          paymentMethod === "Razorpay"
            ? new Date().toISOString()
            : null,
      }
    );

    if (error) {
      console.error("ATOMIC ORDER RPC ERROR:", error.message);
      console.error("ATOMIC ORDER RPC CODE:", error.code);
      console.error("ATOMIC ORDER RPC DETAILS:", error.details);
      console.error("ATOMIC ORDER RPC HINT:", error.hint);

      return NextResponse.json(
        {
          error:
            error.message ||
            "Unable to save order and update inventory.",
        },
        { status: 500 }
      );
    }

    const emailSent =
      await sendOrderConfirmationEmail({
        orderId: String(orderId),
        name: String(name).trim(),
        email: String(email).trim(),
        address: String(address).trim(),
        city: String(city).trim(),
        state: String(state).trim(),
        pin: String(pin).trim(),
        paymentMethod: String(paymentMethod),
        orderStatus,
        total: calculatedOrder.total,
        items: calculatedOrder.items,
      });

    return NextResponse.json({
      success: true,
      order: data,
      emailSent,
    });
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
