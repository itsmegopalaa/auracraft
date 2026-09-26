import { beforeEach, describe, expect, it, vi } from "vitest";
import crypto from "node:crypto";

const {
  mockSingle,
  mockUpdate,
  mockFrom,
  mockSupabase,
} = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockUpdateEq = vi.fn();
  const mockUpdate = vi.fn((_payload: Record<string, unknown>) => ({
    eq: mockUpdateEq,
  }));
  const mockFrom = vi.fn();
  const mockSupabase = {
    from: mockFrom,
  };

  return {
    mockSingle,
    mockUpdate,
    mockUpdateEq,
    mockFrom,
    mockSupabase,
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
            status: "captured",
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

  function request(body: string, signature = sign(body)) {
    return new Request("http://localhost/api/razorpay-webhook", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-razorpay-signature": signature,
      },
      body,
    });
  }

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
      data: {
        id: "order_test_123",
        total: 849,
        payment_status: "pending",
        order_status: "placed",
        razorpay_order_id: "order_test_123",
        razorpay_payment_id: null,
      },
      error: null,
    });

    mockUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        error: null,
      }),
    });
  });

  it("rejects a missing webhook signature", async () => {
    const body = makePayload("payment.captured");

    const response = await POST(
      new Request("http://localhost/api/razorpay-webhook", {
        method: "POST",
        body,
      })
    );

    expect(response.status).toBe(400);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("rejects an invalid webhook signature", async () => {
    const body = makePayload("payment.captured");

    const response = await POST(request(body, "invalid-signature"));

    expect(response.status).toBe(400);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("acknowledges unknown events without changing an order", async () => {
    const body = makePayload("some.unknown.event");

    const response = await POST(request(body));

    expect(response.status).toBe(200);
    expect(mockFrom).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("rejects a captured payment with the wrong amount", async () => {
    const body = makePayload("payment.captured", {
      amount: 99900,
    });

    const response = await POST(request(body));

    expect(response.status).toBe(400);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("rejects a captured payment with non-INR currency", async () => {
    const body = makePayload("payment.captured", {
      currency: "USD",
    });

    const response = await POST(request(body));

    expect(response.status).toBe(400);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("marks a valid captured payment as paid and confirmed", async () => {
    const body = makePayload("payment.captured");

    const response = await POST(request(body));

    expect(response.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalled();

    const updatePayload = mockUpdate.mock.calls[0][0];

    expect(updatePayload.payment_status).toBe("paid");
    expect(updatePayload.order_status).toBe("confirmed");
    expect(updatePayload.razorpay_payment_id).toBe("pay_test_123");
    expect(updatePayload.paid_at).toBeTruthy();
  });

  it("does not downgrade an already-paid order", async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: "order_test_123",
        total: 849,
        payment_status: "paid",
        order_status: "confirmed",
        razorpay_order_id: "order_test_123",
        razorpay_payment_id: "pay_existing",
        paid_at: "2026-09-26T10:00:00.000Z",
      },
      error: null,
    });

    const body = makePayload("payment.failed", {
      status: "failed",
    });

    const response = await POST(request(body));

    expect(response.status).toBe(200);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("marks an unpaid failed payment as failed", async () => {
    const body = makePayload("payment.failed", {
      status: "failed",
    });

    const response = await POST(request(body));

    expect(response.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalled();

    const updatePayload = mockUpdate.mock.calls[0][0];

    expect(updatePayload.payment_status).toBe("failed");
  });

  it("returns 500 when the internal order cannot be found", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const body = makePayload("payment.captured");

    const response = await POST(request(body));

    expect(response.status).toBe(500);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns 500 when Supabase order lookup fails", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: {
        message: "database unavailable",
      },
    });

    const body = makePayload("payment.captured");

    const response = await POST(request(body));

    expect(response.status).toBe(500);
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
