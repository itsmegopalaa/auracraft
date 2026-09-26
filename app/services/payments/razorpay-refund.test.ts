import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./razorpay-auth", () => ({
  getRazorpayAuth: vi.fn(() => "test-auth"),
}));

import { refundRazorpayPayment } from "./razorpay-refund";

const validInput = {
  razorpayPaymentId: "pay_test_123",
  refundAmount: 500,
  mineNoteOrderId: "MN-123",
  orderId: "order-123",
};

describe("refundRazorpayPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("rejects a missing payment ID", async () => {
    await expect(
      refundRazorpayPayment({
        ...validInput,
        razorpayPaymentId: "",
      }),
    ).rejects.toThrow(
      "Invalid Razorpay refund request.",
    );

    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects a non-integer refund amount", async () => {
    await expect(
      refundRazorpayPayment({
        ...validInput,
        refundAmount: 500.5,
      }),
    ).rejects.toThrow(
      "Invalid Razorpay refund request.",
    );
  });

  it("rejects a zero refund", async () => {
    await expect(
      refundRazorpayPayment({
        ...validInput,
        refundAmount: 0,
      }),
    ).rejects.toThrow(
      "Invalid Razorpay refund request.",
    );
  });

  it("rejects a negative refund", async () => {
    await expect(
      refundRazorpayPayment({
        ...validInput,
        refundAmount: -100,
      }),
    ).rejects.toThrow(
      "Invalid Razorpay refund request.",
    );
  });

  it("sends the refund amount in paise", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            id: "rfnd_test_123",
            amount: 50000,
            status: "processed",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      ),
    );

    await expect(
      refundRazorpayPayment(validInput),
    ).resolves.toMatchObject({
      id: "rfnd_test_123",
      amount: 50000,
      status: "processed",
    });

    expect(fetch).toHaveBeenCalledTimes(1);

    const [url, options] = vi.mocked(fetch).mock.calls[0];

    expect(url).toBe(
      "https://api.razorpay.com/v1/payments/pay_test_123/refund",
    );

    expect(options).toMatchObject({
      method: "POST",
      headers: expect.objectContaining({
        Authorization: "Basic test-auth",
        "Content-Type": "application/json",
        "X-Razorpay-Idempotency-Key":
          "minenote-refund-order-123-500",
      }),
    });

    expect(JSON.parse(String(options?.body))).toEqual({
      amount: 50000,
      notes: {
        minenote_order_id: "MN-123",
      },
    });
  });

  it("returns the Razorpay refund response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            id: "rfnd_test_456",
            amount: 10000,
            status: "processed",
            extra: "kept",
          }),
          { status: 200 },
        ),
      ),
    );

    const result =
      await refundRazorpayPayment({
        ...validInput,
        refundAmount: 100,
      });

    expect(result.id).toBe("rfnd_test_456");
    expect(result.amount).toBe(10000);
    expect(result.status).toBe("processed");
    expect(result.raw).toMatchObject({
      extra: "kept",
    });
  });

  it("surfaces Razorpay API errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              description: "Refund not allowed",
            },
          }),
          { status: 400 },
        ),
      ),
    );

    const error = await refundRazorpayPayment(
      validInput,
    ).catch((value) => value);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Refund not allowed");
    expect(error.status).toBe(400);
    expect(error.razorpayData).toEqual({
      error: {
        description: "Refund not allowed",
      },
    });
  });

  it("rejects a successful response without a refund ID", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            amount: 50000,
            status: "processed",
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(
      refundRazorpayPayment(validInput),
    ).rejects.toThrow(
      "Razorpay returned an invalid refund response.",
    );
  });
});
