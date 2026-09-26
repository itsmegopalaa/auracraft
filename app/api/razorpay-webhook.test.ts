import { beforeEach, describe, expect, it, vi } from "vitest";
import crypto from "node:crypto";

const {
  mockSingle,
  mockUpdate,
  mockUpdateEq,
  mockFrom,
  mockSupabase,
  mockFinalizePaymentIntent,
} = vi.hoisted(() => {
  const mockSingle = vi.fn();

  const mockUpdateEq = vi.fn().mockResolvedValue({
    error: null,
  });

  const mockUpdate = vi.fn(
    (_payload: Record<string, unknown>) => ({
      eq: mockUpdateEq,
    })
  );

  const mockFrom = vi.fn();

  const mockSupabase = {
    from: mockFrom,
  };

  const mockFinalizePaymentIntent = vi.fn();

  return {
    mockSingle,
    mockUpdate,
    mockUpdateEq,
    mockFrom,
    mockSupabase,
    mockFinalizePaymentIntent,
  };
});

vi.mock("@/app/lib/supabase", () => ({
  createSupabaseAdminClient: vi.fn(() => mockSupabase),
}));

vi.mock("@/app/config", () => ({
  getServerEnv: vi.fn(() => ({
    razorpayWebhookSecret: "test-webhook-secret",
  })),
}));

vi.mock("@/app/services/payments/finalize-payment-intent", () => ({
  finalizePaymentIntent: mockFinalizePaymentIntent,
}));

import { POST } from "@/app/api/razorpay-webhook/route";

describe("Razorpay webhook", () => {
  const secret = "test-webhook-secret";

  function makePayload(
    event: string,
    payment: Record<string, unknown> = {}
  ) {
    return JSON.stringify({
      event,
      payload: {
        payment: {
          entity: {
            id: "pay_test_123",
            order_id: "order_test_123",
            amount: 84900,
            currency: "INR",
            status:
              event === "payment.failed"
                ? "failed"
                : "captured",
            ...payment,
          },
        },
      },
    });
  }

  function sign(body: string) {
    return crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");
  }

  function request(
    body: string,
    signature = sign(body)
  ) {
    return new Request(
      "http://localhost/api/razorpay-webhook",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-razorpay-signature": signature,
        },
        body,
      }
    );
  }

  const pendingIntent = {
    id: "intent_test_123",
    razorpay_order_id: "order_test_123",
    mine_note_order_id: "MN12345678",
    customer_id: "customer_test_123",
    status: "created",
    payment_status: "pending",
    amount: 84900,
    currency: "INR",
    razorpay_payment_id: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockImplementation(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: mockSingle,
        })),
      })),
      update: mockUpdate,
    }));

    mockSingle.mockResolvedValue({
      data: pendingIntent,
      error: null,
    });

    mockUpdate.mockReturnValue({
      eq: mockUpdateEq,
    });

    mockFinalizePaymentIntent.mockResolvedValue({
      order: {
        id: "order_test_123",
      },
      alreadyExists: false,
      emailSent: true,
    });
  });

  it("rejects a missing webhook signature", async () => {
    const body = makePayload("payment.captured");

    const response = await POST(
      new Request(
        "http://localhost/api/razorpay-webhook",
        {
          method: "POST",
          body,
        }
      )
    );

    expect(response.status).toBe(400);
    expect(mockFrom).not.toHaveBeenCalled();
    expect(
      mockFinalizePaymentIntent
    ).not.toHaveBeenCalled();
  });

  it("rejects an invalid webhook signature", async () => {
    const body = makePayload("payment.captured");

    const response = await POST(
      request(body, "invalid-signature")
    );

    expect(response.status).toBe(400);
    expect(mockFrom).not.toHaveBeenCalled();
    expect(
      mockFinalizePaymentIntent
    ).not.toHaveBeenCalled();
  });

  it("acknowledges unknown events without changing payment state", async () => {
    const body = makePayload("some.unknown.event");

    const response = await POST(request(body));

    expect(response.status).toBe(200);
    expect(mockFrom).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(
      mockFinalizePaymentIntent
    ).not.toHaveBeenCalled();
  });

  it("rejects a captured payment with the wrong amount", async () => {
    const body = makePayload(
      "payment.captured",
      {
        amount: 99900,
      }
    );

    const response = await POST(request(body));

    expect(response.status).toBe(400);
    expect(
      mockFinalizePaymentIntent
    ).not.toHaveBeenCalled();
  });

  it("rejects a captured payment with non-INR currency", async () => {
    const body = makePayload(
      "payment.captured",
      {
        currency: "USD",
      }
    );

    const response = await POST(request(body));

    expect(response.status).toBe(400);
    expect(
      mockFinalizePaymentIntent
    ).not.toHaveBeenCalled();
  });

  it("finalizes a valid captured payment through the payment intent", async () => {
    const body = makePayload("payment.captured");

    const response = await POST(request(body));

    expect(response.status).toBe(200);

    expect(
      mockFinalizePaymentIntent
    ).toHaveBeenCalledWith({
      razorpayOrderId: "order_test_123",
      razorpayPaymentId: "pay_test_123",
      paidAt: expect.any(String),
    });
  });

  it("handles an already-finalized payment idempotently", async () => {
    mockFinalizePaymentIntent.mockResolvedValue({
      order: {
        id: "order_test_123",
      },
      alreadyExists: true,
      emailSent: false,
    });

    const body = makePayload("payment.captured");

    const response = await POST(request(body));

    expect(response.status).toBe(200);
    expect(
      mockFinalizePaymentIntent
    ).toHaveBeenCalledTimes(1);
  });

  it("returns 500 when the payment intent cannot be found", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const body = makePayload("payment.captured");

    const response = await POST(request(body));

    expect(response.status).toBe(500);
    expect(
      mockFinalizePaymentIntent
    ).not.toHaveBeenCalled();
  });

  it("returns 500 when the payment intent lookup fails", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: {
        message: "database unavailable",
      },
    });

    const body = makePayload("payment.captured");

    const response = await POST(request(body));

    expect(response.status).toBe(500);
    expect(
      mockFinalizePaymentIntent
    ).not.toHaveBeenCalled();
  });

  it("returns 500 when finalization fails", async () => {
    mockFinalizePaymentIntent.mockRejectedValue(
      new Error("Unable to finalize paid order.")
    );

    const body = makePayload("payment.captured");

    const response = await POST(request(body));

    expect(response.status).toBe(500);
    expect(
      mockFinalizePaymentIntent
    ).toHaveBeenCalledTimes(1);
  });

  it("marks an unpaid failed payment as failed", async () => {
    const body = makePayload(
      "payment.failed",
      {
        status: "failed",
      }
    );

    const response = await POST(request(body));

    expect(response.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalled();

    const updatePayload =
      mockUpdate.mock.calls[0][0];

    expect(updatePayload.payment_status).toBe(
      "failed"
    );
    expect(updatePayload.status).toBe("failed");
    expect(
      updatePayload.razorpay_payment_id
    ).toBe("pay_test_123");

    expect(
      mockFinalizePaymentIntent
    ).not.toHaveBeenCalled();
  });

  it("does not downgrade an already-paid payment intent", async () => {
    mockSingle.mockResolvedValue({
      data: {
        ...pendingIntent,
        status: "finalized",
        payment_status: "paid",
        razorpay_payment_id: "pay_existing",
      },
      error: null,
    });

    const body = makePayload(
      "payment.failed",
      {
        status: "failed",
      }
    );

    const response = await POST(request(body));

    expect(response.status).toBe(200);
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(
      mockFinalizePaymentIntent
    ).not.toHaveBeenCalled();
  });

  it("accepts a failed payment without a currency field", async () => {
    const body = JSON.stringify({
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: "pay_test_123",
            order_id: "order_test_123",
            amount: 84900,
            status: "failed",
          },
        },
      },
    });

    const response = await POST(request(body));

    expect(response.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalled();
  });
});
