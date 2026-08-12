import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
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
      total,
      razorpayOrderId,
      razorpayPaymentId,
      delivery,
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
      items.length === 0 ||
      total === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required order fields." },
        { status: 400 }
      );
    }

    if (!["COD", "Razorpay"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method." },
        { status: 400 }
      );
    }

    const numericTotal = Number(total);

    if (!Number.isFinite(numericTotal) || numericTotal <= 0) {
      return NextResponse.json(
        { error: "Invalid order total." },
        { status: 400 }
      );
    }

    let paymentStatus = "pending";
    let orderStatus = "placed";

    if (paymentMethod === "Razorpay") {
      if (!razorpayOrderId || !razorpayPaymentId) {
        return NextResponse.json(
          { error: "Missing Razorpay payment details." },
          { status: 400 }
        );
      }

      paymentStatus = "paid";
      orderStatus = "confirmed";
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .insert({
        order_id: String(orderId),
        name: String(name).trim(),
        phone: String(phone).trim(),
        email: String(email).trim(),
        address: String(address).trim(),
        city: String(city).trim(),
        state: String(state).trim(),
        pin: String(pin).trim(),
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        order_status: orderStatus,
        items,
        total: Math.round(numericTotal),
        razorpay_order_id:
          paymentMethod === "Razorpay" ? razorpayOrderId : null,
        razorpay_payment_id:
          paymentMethod === "Razorpay" ? razorpayPaymentId : null,
        delivery: "3-5 Working Days",
      })
      .select()
      .single();

    if (error) {
      console.error("SUPABASE ERROR MESSAGE:", error.message);
      console.error("SUPABASE ERROR CODE:", error.code);
      console.error("SUPABASE ERROR DETAILS:", error.details);
      console.error("SUPABASE ERROR HINT:", error.hint);

      return NextResponse.json(
        { error: "Unable to save order." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: data,
    });
  } catch (error) {
    console.error("ORDER API ERROR:", error);

    return NextResponse.json(
      { error: "Invalid order request." },
      { status: 400 }
    );
  }
}
