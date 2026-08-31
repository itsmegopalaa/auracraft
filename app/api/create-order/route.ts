import { NextResponse } from "next/server";
import { calculateOrder } from "@/app/lib/order-pricing";
import { createServerSupabaseClient } from "@/app/lib/supabase";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be signed in to make an online payment.",
        },
        { status: 401 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          error:
            "Razorpay server credentials are not configured.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const { items } = body;

    const mineNoteOrderId = `MN${Date.now()
      .toString()
      .slice(-8)}`;

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

    const amount = Math.round(calculatedOrder.total * 100);
    const safeReceipt = mineNoteOrderId;

    if (!Number.isInteger(amount) || amount < 100) {
      return NextResponse.json(
        { error: "Invalid payment amount." },
        { status: 400 }
      );
    }

    const auth = Buffer.from(
      `${keyId}:${keySecret}`
    ).toString("base64");

    const razorpayResponse = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency: "INR",
          receipt: safeReceipt,
          notes: {
            minenote_order_id: mineNoteOrderId,
            customer_id: user.id,
          },
        }),
      }
    );

    const razorpayData =
      await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error("RAZORPAY API ERROR:", {
        status: razorpayResponse.status,
        code: razorpayData?.error?.code,
        description:
          razorpayData?.error?.description,
        reason: razorpayData?.error?.reason,
        source: razorpayData?.error?.source,
      });

      return NextResponse.json(
        {
          error:
            razorpayData?.error?.description ||
            "Razorpay rejected the order.",
        },
        { status: razorpayResponse.status }
      );
    }

    return NextResponse.json({
      order_id: razorpayData.id,
      amount: razorpayData.amount,
      currency: razorpayData.currency,
      items: calculatedOrder.items,
      total: calculatedOrder.total,
      mineNoteOrderId,
    });
  } catch (error: unknown) {
    console.error(
      "Razorpay create order error:",
      {
        message:
          error instanceof Error
            ? error.message
            : "Unknown error",
        name:
          error instanceof Error
            ? error.name
            : "Unknown",
      }
    );

    return NextResponse.json(
      {
        error:
          "Unable to create payment order.",
      },
      { status: 500 }
    );
  }
}
