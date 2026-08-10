import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay server credentials are not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const amount = Number(body.amount);
    const receipt = String(body.receipt || `mn_${Date.now()}`);

    if (!Number.isInteger(amount) || amount < 100) {
      return NextResponse.json(
        { error: "Amount must be at least 100 paise." },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt,
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: unknown) {
    console.error("Razorpay create order error:", error);

    const message =
      error instanceof Error ? error.message : "Unable to create Razorpay order.";

    if (/authentication|auth|key_id|credentials/i.test(message)) {
      return NextResponse.json(
        { error: "Razorpay authentication failed." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Unable to create payment order." },
      { status: 500 }
    );
  }
}
