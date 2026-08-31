import { verifyRazorpaySignature } from "@/app/lib/razorpay-verification";

interface VerifyRazorpayPaymentInput {
  razorpayOrderId: unknown;
  razorpayPaymentId: unknown;
  razorpaySignature: unknown;
  expectedAmount: number;
  customerId: string;
  mineNoteOrderId: string;
}

interface RazorpayValidationResult {
  razorpayOrderId: string;
  razorpayPaymentId: string;
}

export async function verifyRazorpayPayment(
  input: VerifyRazorpayPaymentInput
): Promise<RazorpayValidationResult> {
  const razorpayOrderId = String(
    input.razorpayOrderId ?? ""
  );

  const razorpayPaymentId = String(
    input.razorpayPaymentId ?? ""
  );

  const razorpaySignature = String(
    input.razorpaySignature ?? ""
  );

  if (
    !razorpayOrderId ||
    !razorpayPaymentId ||
    !razorpaySignature
  ) {
    throw new Error(
      "Missing Razorpay verification details."
    );
  }

  const verified = verifyRazorpaySignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  });

  if (!verified) {
    throw new Error(
      "Razorpay payment could not be verified."
    );
  }

  const razorpayKeyId =
    process.env.RAZORPAY_KEY_ID;

  const razorpayKeySecret =
    process.env.RAZORPAY_KEY_SECRET;

  if (!razorpayKeyId || !razorpayKeySecret) {
    throw new Error(
      "Payment gateway is not configured."
    );
  }

  const auth = Buffer.from(
    `${razorpayKeyId}:${razorpayKeySecret}`
  ).toString("base64");

  const orderResponse = await fetch(
    `https://api.razorpay.com/v1/orders/${encodeURIComponent(
      razorpayOrderId
    )}`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
      cache: "no-store",
    }
  );

  const orderData =
    await orderResponse.json();

  if (!orderResponse.ok) {
    console.error(
      "RAZORPAY ORDER LOOKUP ERROR:",
      orderData
    );

    throw new Error(
      "Unable to validate the Razorpay order."
    );
  }

  if (
    orderData.id !== razorpayOrderId ||
    orderData.currency !== "INR" ||
    Number(orderData.amount) !==
      input.expectedAmount
  ) {
    throw new Error(
      "Payment amount does not match the order."
    );
  }

  const notes = orderData.notes ?? {};

  if (
    notes.customer_id !== input.customerId ||
    notes.minenote_order_id !==
      input.mineNoteOrderId
  ) {
    throw new Error(
      "Payment order does not match this customer or order."
    );
  }

  const paymentResponse = await fetch(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(
      razorpayPaymentId
    )}`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
      cache: "no-store",
    }
  );

  const paymentData =
    await paymentResponse.json();

  if (!paymentResponse.ok) {
    console.error(
      "RAZORPAY PAYMENT LOOKUP ERROR:",
      paymentData
    );

    throw new Error(
      "Unable to validate the Razorpay payment."
    );
  }

  if (
    paymentData.id !== razorpayPaymentId ||
    paymentData.order_id !== razorpayOrderId ||
    Number(paymentData.amount) !==
      input.expectedAmount ||
    paymentData.currency !== "INR" ||
    paymentData.status !== "captured"
  ) {
    throw new Error(
      "Razorpay payment could not be validated."
    );
  }

  return {
    razorpayOrderId,
    razorpayPaymentId,
  };
}
