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
      paymentStatus,
      orderStatus,
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
      !items ||
      total === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required order fields." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .insert({
        order_id: orderId,
        name,
        phone,
        email,
        address,
        city,
        state,
        pin,
        payment_method: paymentMethod,
        payment_status: paymentStatus || "pending",
        order_status: orderStatus || "pending",
        items,
        total,
        razorpay_order_id: razorpayOrderId || null,
        razorpay_payment_id: razorpayPaymentId || null,
        delivery: delivery || "3-5 Working Days",
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
      { status: 500 }
    );
  }
}