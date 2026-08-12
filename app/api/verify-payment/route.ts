import { NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/app/lib/razorpay-verification";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        {
          error:
            "Missing payment verification fields.",
        },
        { status: 400 }
      );
    }

    const verified = verifyRazorpaySignature({
      orderId: String(razorpay_order_id),
      paymentId: String(razorpay_payment_id),
      signature: String(razorpay_signature),
    });

    if (!verified) {
      return NextResponse.json(
        {
          verified: false,
          error:
            "Invalid payment signature.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      verified: true,
      razorpay_order_id,
      razorpay_payment_id,
    });
  } catch (error) {
    console.error(
      "Razorpay verification error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to verify payment.",
      },
      { status: 500 }
    );
  }
}
