import { NextResponse } from "next/server";
import { calculateOrder } from "@/app/lib/order-pricing";
import { createServerSupabaseClient } from "@/app/lib/supabase";
import { createRazorpayOrder } from "@/app/services/payments";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "You must be signed in to make an online payment.",
        },
        { status: 401 }
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

    const amount = Math.round(
      calculatedOrder.total * 100
    );

    const safeReceipt = mineNoteOrderId;

    if (!Number.isInteger(amount) || amount < 100) {
      return NextResponse.json(
        { error: "Invalid payment amount." },
        { status: 400 }
      );
    }

    let razorpayOrder;

    try {
      razorpayOrder = await createRazorpayOrder({
        amount,
        receipt: safeReceipt,
        customerId: user.id,
        mineNoteOrderId,
      });
    } catch (error) {
      console.error(
        "Razorpay create order service error:",
        error
      );

      const status =
        error &&
        typeof error === "object" &&
        "status" in error &&
        typeof error.status === "number"
          ? error.status
          : 502;

      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Unable to create Razorpay order.",
        },
        {
          status:
            status >= 400 && status < 600
              ? status
              : 502,
        }
      );
    }

    return NextResponse.json({
      order_id: razorpayOrder.order_id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
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
