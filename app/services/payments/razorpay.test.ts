import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./razorpay-auth", () => ({
  getRazorpayAuth: vi.fn(() => "test-auth"),
}));

vi.mock("@/app/lib/razorpay-verification", () => ({
  verifyRazorpaySignature: vi.fn(() => true),
}));

import { verifyRazorpayPayment } from "./razorpay";
import { verifyRazorpaySignature } from "@/app/lib/razorpay-verification";

const mockedVerifySignature = vi.mocked(
  verifyRazorpaySignature,
);

function mockFetch(
  orderData: unknown,
  paymentData: unknown,
) {
  vi.stubGlobal(
    "fetch",
    vi.fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(orderData), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(paymentData), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
  );
}

const validInput = {
  razorpayOrderId: "order_test_123",
  razorpayPaymentId: "pay_test_123",
  razorpaySignature: "signature_test",
  expectedAmount: 84900,
  customerId: "customer-123",
  mineNoteOrderId: "MN-123",
};

const validOrder = {
  id: "order_test_123",
  currency: "INR",
  amount: 84900,
  notes: {
    customer_id: "customer-123",
    minenote_order_id: "MN-123",
  },
};

const validPayment = {
  id: "pay_test_123",
  order_id: "order_test_123",
  amount: 84900,
  currency: "INR",
  status: "captured",
};

describe("verifyRazorpayPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubGlobal("fetch", vi.fn());

    mockedVerifySignature.mockReturnValue(true);
  });

  it("accepts a valid captured payment", async () => {
    mockFetch(validOrder, validPayment);

    await expect(
      verifyRazorpayPayment(validInput),
    ).resolves.toEqual({
      razorpayOrderId: "order_test_123",
      razorpayPaymentId: "pay_test_123",
    });
  });

  it("rejects missing verification details", async () => {
    await expect(
      verifyRazorpayPayment({
        ...validInput,
        razorpaySignature: "",
      }),
    ).rejects.toThrow(
      "Missing Razorpay verification details.",
    );
  });

  it("rejects an invalid Razorpay signature", async () => {
    mockedVerifySignature.mockReturnValue(false);

    await expect(
      verifyRazorpayPayment(validInput),
    ).rejects.toThrow(
      "Razorpay payment could not be verified.",
    );

    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects an order amount mismatch", async () => {
    mockFetch(
      {
        ...validOrder,
        amount: 84901,
      },
      validPayment,
    );

    await expect(
      verifyRazorpayPayment(validInput),
    ).rejects.toThrow(
      "Payment amount does not match the order.",
    );
  });

  it("rejects a non-INR Razorpay order", async () => {
    mockFetch(
      {
        ...validOrder,
        currency: "USD",
      },
      validPayment,
    );

    await expect(
      verifyRazorpayPayment(validInput),
    ).rejects.toThrow(
      "Payment amount does not match the order.",
    );
  });

  it("rejects a customer mismatch", async () => {
    mockFetch(
      {
        ...validOrder,
        notes: {
          ...validOrder.notes,
          customer_id: "different-customer",
        },
      },
      validPayment,
    );

    await expect(
      verifyRazorpayPayment(validInput),
    ).rejects.toThrow(
      "Payment order does not match this customer or order.",
    );
  });

  it("rejects a MineNote order mismatch", async () => {
    mockFetch(
      {
        ...validOrder,
        notes: {
          ...validOrder.notes,
          minenote_order_id: "MN-WRONG",
        },
      },
      validPayment,
    );

    await expect(
      verifyRazorpayPayment(validInput),
    ).rejects.toThrow(
      "Payment order does not match this customer or order.",
    );
  });

  it("rejects a payment belonging to another Razorpay order", async () => {
    mockFetch(
      validOrder,
      {
        ...validPayment,
        order_id: "order_other",
      },
    );

    await expect(
      verifyRazorpayPayment(validInput),
    ).rejects.toThrow(
      "Razorpay payment could not be validated.",
    );
  });

  it("rejects a payment amount mismatch", async () => {
    mockFetch(
      validOrder,
      {
        ...validPayment,
        amount: 84800,
      },
    );

    await expect(
      verifyRazorpayPayment(validInput),
    ).rejects.toThrow(
      "Razorpay payment could not be validated.",
    );
  });

  it("rejects a non-captured payment", async () => {
    mockFetch(
      validOrder,
      {
        ...validPayment,
        status: "authorized",
      },
    );

    await expect(
      verifyRazorpayPayment(validInput),
    ).rejects.toThrow(
      "Razorpay payment could not be validated.",
    );
  });

  it("rejects a non-INR payment", async () => {
    mockFetch(
      validOrder,
      {
        ...validPayment,
        currency: "USD",
      },
    );

    await expect(
      verifyRazorpayPayment(validInput),
    ).rejects.toThrow(
      "Razorpay payment could not be validated.",
    );
  });
});
