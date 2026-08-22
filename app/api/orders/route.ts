import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { calculateOrder } from "@/app/lib/order-pricing";
import { verifyRazorpaySignature } from "@/app/lib/razorpay-verification";
import { createClient as createServerClient } from "@/utils/supabase/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

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

      const verified = verifyRazorpaySignature({
        orderId: String(razorpayOrderId),
        paymentId: String(razorpayPaymentId),
        signature: String(razorpaySignature),
      });

      if (!verified) {
        return NextResponse.json(
          {
            error: "Razorpay payment could not be verified.",
          },
          { status: 400 }
        );
      }

      const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
      const razorpayKeySecret =
        process.env.RAZORPAY_KEY_SECRET;

      if (!razorpayKeyId || !razorpayKeySecret) {
        console.error(
          "RAZORPAY SERVER CREDENTIALS ARE NOT CONFIGURED."
        );

        return NextResponse.json(
          {
            error: "Payment gateway is not configured.",
          },
          { status: 500 }
        );
      }

      const razorpayAuth = Buffer.from(
        `${razorpayKeyId}:${razorpayKeySecret}`
      ).toString("base64");

      const razorpayOrderResponse = await fetch(
        `https://api.razorpay.com/v1/orders/${encodeURIComponent(
          String(razorpayOrderId)
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${razorpayAuth}`,
          },
          cache: "no-store",
        }
      );

      const razorpayOrderData =
        await razorpayOrderResponse.json();

      if (!razorpayOrderResponse.ok) {
        console.error(
          "RAZORPAY ORDER LOOKUP ERROR:",
          razorpayOrderData
        );

        return NextResponse.json(
          {
            error:
              "Unable to validate the Razorpay order.",
          },
          { status: 502 }
        );
      }

      const expectedAmount =
        Math.round(calculatedOrder.total * 100);

      if (
        razorpayOrderData.id !== String(razorpayOrderId) ||
        razorpayOrderData.currency !== "INR" ||
        Number(razorpayOrderData.amount) !== expectedAmount
      ) {
        console.error(
          "RAZORPAY ORDER MISMATCH:",
          {
            expectedAmount,
            razorpayAmount:
              razorpayOrderData.amount,
            currency:
              razorpayOrderData.currency,
          }
        );

        return NextResponse.json(
          {
            error:
              "Payment amount does not match the order.",
          },
          { status: 400 }
        );
      }

      const razorpayPaymentResponse = await fetch(
        `https://api.razorpay.com/v1/payments/${encodeURIComponent(
          String(razorpayPaymentId)
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${razorpayAuth}`,
          },
          cache: "no-store",
        }
      );

      const razorpayPaymentData =
        await razorpayPaymentResponse.json();

      if (!razorpayPaymentResponse.ok) {
        console.error(
          "RAZORPAY PAYMENT LOOKUP ERROR:",
          razorpayPaymentData
        );

        return NextResponse.json(
          {
            error:
              "Unable to validate the Razorpay payment.",
          },
          { status: 502 }
        );
      }

      if (
        razorpayPaymentData.id !== String(razorpayPaymentId) ||
        razorpayPaymentData.order_id !==
          String(razorpayOrderId) ||
        Number(razorpayPaymentData.amount) !==
          expectedAmount ||
        razorpayPaymentData.currency !== "INR" ||
        razorpayPaymentData.status !== "captured"
      ) {
        console.error(
          "RAZORPAY PAYMENT MISMATCH:",
          {
            paymentId:
              razorpayPaymentData.id,
            orderId:
              razorpayPaymentData.order_id,
            amount:
              razorpayPaymentData.amount,
            currency:
              razorpayPaymentData.currency,
            status:
              razorpayPaymentData.status,
          }
        );

        return NextResponse.json(
          {
            error:
              "Razorpay payment could not be validated.",
          },
          { status: 400 }
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

    const paymentLabel =
      paymentMethod === "Razorpay"
        ? "Paid online via Razorpay"
        : "Cash on Delivery";

    const { error: emailError } = await resend.emails.send({
      from: "MineNote <orders@minenote.in>",
      to: [String(email).trim()],
      subject: `MineNote Order Confirmed — ${String(orderId)}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #18181b; max-width: 640px; margin: 0 auto; padding: 24px;">
          <h1 style="margin-bottom: 8px;">Order Confirmed 🎉</h1>

          <p>Hi ${String(name).trim()},</p>

          <p>
            Thank you for ordering from <strong>MineNote</strong>.
            Your order has been successfully placed.
          </p>

          <div style="background: #f4f4f5; padding: 16px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Order ID:</strong> ${String(orderId)}</p>
            <p style="margin: 4px 0;"><strong>Payment:</strong> ${paymentLabel}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> ${orderStatus}</p>
            <p style="margin: 4px 0;"><strong>Total:</strong> ₹${calculatedOrder.total}</p>
            <p style="margin: 4px 0;"><strong>Delivery:</strong> 3-5 Working Days</p>
          </div>

          <h2>Items</h2>

          <ul>
            ${calculatedOrder.items
              .map(
                (item) =>
                  `<li>${item.name} × ${item.quantity} — ₹${item.price * item.quantity}</li>`
              )
              .join("")}
          </ul>

          <h2>Delivery Address</h2>

          <p>
            ${String(address).trim()}<br />
            ${String(city).trim()}, ${String(state).trim()}<br />
            PIN: ${String(pin).trim()}
          </p>

          <p style="margin-top: 28px;">
            We’ll keep you updated about your order.
          </p>

          <p>
            — Team MineNote ❤️
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error("RESEND ORDER EMAIL ERROR:", emailError);
    }

    return NextResponse.json({
      success: true,
      order: data,
      emailSent: !emailError,
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
