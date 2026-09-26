import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockIntentSingle,
  mockOrderSingle,
  mockRpc,
  mockUpdate,
  mockUpdateEq,
  mockFrom,
  mockSupabase,
  mockSendOrderConfirmationEmail,
} = vi.hoisted(() => {
  const mockIntentSingle = vi.fn();
  const mockOrderSingle = vi.fn();
  const mockRpc = vi.fn();
  const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });

  const mockUpdate = vi.fn(
    (_payload: Record<string, unknown>) => ({
      eq: mockUpdateEq,
    })
  );

  const mockFrom = vi.fn();

  const mockSupabase = {
    from: mockFrom,
    rpc: mockRpc,
  };

  const mockSendOrderConfirmationEmail = vi.fn();

  return {
    mockIntentSingle,
    mockOrderSingle,
    mockRpc,
    mockUpdate,
    mockUpdateEq,
    mockFrom,
    mockSupabase,
    mockSendOrderConfirmationEmail,
  };
});

vi.mock("@/app/lib/supabase", () => ({
  createSupabaseAdminClient: vi.fn(() => mockSupabase),
}));

vi.mock("@/app/services/orders", () => ({
  sendOrderConfirmationEmail: mockSendOrderConfirmationEmail,
}));

import { finalizePaymentIntent } from "./finalize-payment-intent";

const intent = {
  id: "intent_test_123",
  razorpay_order_id: "order_test_123",
  mine_note_order_id: "MN12345678",
  customer_id: "customer_test_123",
  status: "created",
  payment_status: "pending",
  amount: 84900,
  currency: "INR",
  name: "Test Customer",
  phone: "9999999999",
  email: "test@example.com",
  address: "123 Test Street",
  city: "Indore",
  state: "Madhya Pradesh",
  pin: "452001",
  payment_method: "Razorpay",
  items: [
    {
      id: "product_test_123",
      quantity: 1,
      pages: 200,
      customCoverId: null,
    },
  ],
  total: 849,
  custom_cover_id: null,
  custom_cover_snapshot: null,
  delivery: "3-5 Working Days",
  razorpay_payment_id: null,
};

const createdOrder = {
  id: "order_test_123",
  mine_note_order_id: "MN12345678",
  customer_id: "customer_test_123",
  razorpay_order_id: "order_test_123",
  razorpay_payment_id: "pay_test_123",
};

describe("finalizePaymentIntent", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockImplementation((table: string) => {
      if (table === "payment_intents") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: mockIntentSingle,
            })),
          })),
          update: mockUpdate,
        };
      }

      if (table === "orders") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: mockOrderSingle,
            })),
          })),
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    mockIntentSingle.mockResolvedValue({
      data: intent,
      error: null,
    });

    mockOrderSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    mockRpc.mockResolvedValue({
      data: [createdOrder],
      error: null,
    });

    mockSendOrderConfirmationEmail.mockResolvedValue(true);
  });

  it("creates and finalizes a paid order from the immutable payment intent", async () => {
    const result = await finalizePaymentIntent({
      razorpayOrderId: "order_test_123",
      razorpayPaymentId: "pay_test_123",
      paidAt: "2026-09-26T10:00:00.000Z",
    });

    expect(mockRpc).toHaveBeenCalledTimes(1);
    expect(mockRpc.mock.calls[0][0]).toBe("create_order_with_inventory");

    const rpcArgs = mockRpc.mock.calls[0][1];

    expect(rpcArgs).toMatchObject({
      p_customer_id: intent.customer_id,
      p_name: intent.name,
      p_phone: intent.phone,
      p_email: intent.email,
      p_address: intent.address,
      p_city: intent.city,
      p_state: intent.state,
      p_pin: intent.pin,
      p_payment_method: "Razorpay",
      p_payment_status: "paid",
      p_razorpay_order_id: "order_test_123",
      p_razorpay_payment_id: "pay_test_123",
      p_total: intent.total,
      p_delivery: intent.delivery,
    });

    expect(mockSendOrderConfirmationEmail).toHaveBeenCalledTimes(1);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "finalized",
        payment_status: "paid",
        razorpay_payment_id: "pay_test_123",
      })
    );

    expect(result).toEqual({
      order: [createdOrder],
      alreadyExists: false,
      emailSent: true,
    });
  });

  it("returns the existing order instead of creating a duplicate", async () => {
    mockIntentSingle.mockResolvedValue({
      data: {
        ...intent,
        razorpay_payment_id: "pay_test_123",
        status: "finalized",
        payment_status: "paid",
      },
      error: null,
    });

    mockOrderSingle.mockResolvedValue({
      data: createdOrder,
      error: null,
    });

    const result = await finalizePaymentIntent({
      razorpayOrderId: "order_test_123",
      razorpayPaymentId: "pay_test_123",
      paidAt: "2026-09-26T10:00:00.000Z",
    });

    expect(mockRpc).not.toHaveBeenCalled();
    expect(mockSendOrderConfirmationEmail).not.toHaveBeenCalled();

    expect(result).toEqual({
      order: createdOrder,
      alreadyExists: true,
      emailSent: false,
    });
  });

  it("recovers from an order-insert race by loading the order created by the other finalizer", async () => {
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: {
        message: "duplicate key value violates unique constraint",
      },
    });

    mockOrderSingle
      .mockResolvedValueOnce({
        data: null,
        error: null,
      })
      .mockResolvedValueOnce({
        data: createdOrder,
        error: null,
      });

    const result = await finalizePaymentIntent({
      razorpayOrderId: "order_test_123",
      razorpayPaymentId: "pay_test_123",
      paidAt: "2026-09-26T10:00:00.000Z",
    });

    expect(mockRpc).toHaveBeenCalledTimes(1);
    expect(mockSendOrderConfirmationEmail).not.toHaveBeenCalled();

    expect(result).toEqual({
      order: createdOrder,
      alreadyExists: true,
      emailSent: false,
    });
  });
});
