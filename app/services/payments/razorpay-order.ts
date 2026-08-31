import { getRazorpayAuth } from "./razorpay-auth";

interface CreateRazorpayOrderInput {
  amount: number;
  receipt: string;
  customerId: string;
  mineNoteOrderId: string;
}

export async function createRazorpayOrder(
  input: CreateRazorpayOrderInput
) {
  const auth = getRazorpayAuth();

  const response = await fetch(
    "https://api.razorpay.com/v1/orders",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: input.amount,
        currency: "INR",
        receipt: input.receipt,
        notes: {
          minenote_order_id: input.mineNoteOrderId,
          customer_id: input.customerId,
        },
      }),
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("RAZORPAY CREATE ORDER ERROR:", {
      status: response.status,
      code: data?.error?.code,
      description: data?.error?.description,
      reason: data?.error?.reason,
      source: data?.error?.source,
    });

    throw new Error(
      data?.error?.description ||
        "Razorpay rejected the order."
    );
  }

  if (
    typeof data?.id !== "string" ||
    !Number.isInteger(Number(data?.amount)) ||
    data?.currency !== "INR"
  ) {
    throw new Error(
      "Razorpay returned an invalid order response."
    );
  }

  return {
    order_id: data.id,
    amount: Number(data.amount),
    currency: data.currency,
  };
}
