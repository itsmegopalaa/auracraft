import { getRazorpayAuth } from "./razorpay-auth";

interface RefundRazorpayPaymentInput {
  razorpayPaymentId: string;
  refundAmount: number;
  mineNoteOrderId: string;
  orderId: string;
}

interface RefundRazorpayPaymentResult {
  id: string;
  amount: number;
  status: string | null;
  raw: unknown;
}

export async function refundRazorpayPayment(
  input: RefundRazorpayPaymentInput
): Promise<RefundRazorpayPaymentResult> {
  if (
    !input.razorpayPaymentId ||
    !Number.isInteger(input.refundAmount) ||
    input.refundAmount <= 0
  ) {
    throw new Error("Invalid Razorpay refund request.");
  }

  const auth = getRazorpayAuth();

  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(
      input.razorpayPaymentId
    )}/refund`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        "X-Razorpay-Idempotency-Key":
          `minenote-refund-${input.orderId}-${input.refundAmount}`,
      },
      body: JSON.stringify({
        amount: input.refundAmount * 100,
        notes: {
          minenote_order_id: input.mineNoteOrderId,
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("RAZORPAY REFUND ERROR:", {
      status: response.status,
      data,
      orderId: input.orderId,
    });

    const error = new Error(
      data?.error?.description ||
        "Razorpay refund failed."
    ) as Error & {
      status?: number;
      razorpayData?: unknown;
    };

    error.status = response.status;
    error.razorpayData = data;

    throw error;
  }

  const refundId = data?.id;

  if (
    typeof refundId !== "string" ||
    refundId.trim().length === 0
  ) {
    throw new Error(
      "Razorpay returned an invalid refund response."
    );
  }

  return {
    id: refundId,
    amount: Number(data.amount ?? input.refundAmount * 100),
    status: data.status ?? null,
    raw: data,
  };
}
