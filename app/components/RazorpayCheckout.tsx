"use client";

import { useState } from "react";
import Script from "next/script";
import toast from "react-hot-toast";
import { Notebook } from "../data/notebooks";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (
    event: string,
    callback: (response: unknown) => void
  ) => void;
}

interface RazorpayCheckoutProps {
  amount: number;
  name: string;
  email: string;
  phone: string;
  items: Array<Notebook & { quantity: number }>;
  onSuccess: (response: RazorpayResponse) => void;
}

export default function RazorpayCheckout({
  amount,
  name,
  email,
  phone,
  items,
  onSuccess,
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);

  const openCheckout = async () => {
    if (!window.Razorpay) {
      toast.error(
        "Payment gateway is still loading. Please try again."
      );
      return;
    }

    if (amount < 1) {
      toast.error("Invalid payment amount.");
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    const keyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (!keyId) {
      toast.error(
        "Razorpay key is not configured."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: items.map((item) => ({
              id: item.id,
              quantity: item.quantity,
            })),
            receipt: `MN_${Date.now()}`,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to create payment order."
        );
      }

      const razorpay = new window.Razorpay({
        key: keyId,
        amount: data.amount,
        currency: data.currency,
        name: "MineNote",
        description:
          "MineNote Notebook Order",
        order_id: data.order_id,
        prefill: {
          name,
          email,
          contact: phone,
        },
        theme: {
          color: "#facc15",
        },
        handler: async (
          paymentResponse
        ) => {
          try {
            const verifyResponse =
              await fetch(
                "/api/verify-payment",
                {
                  method: "POST",
                  headers: {
                    "Content-Type":
                      "application/json",
                  },
                  body: JSON.stringify(
                    paymentResponse
                  ),
                }
              );

            const verification =
              await verifyResponse.json();

            if (
              !verifyResponse.ok ||
              !verification.verified
            ) {
              toast.error(
                "Payment verification failed."
              );
              return;
            }

            toast.success(
              "Payment verified successfully!"
            );

            onSuccess(paymentResponse);
          } catch {
            toast.error(
              "Unable to verify payment."
            );
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error(
              "Payment cancelled."
            );
          },
        },
      });

      razorpay.on(
        "payment.failed",
        () => {
          setLoading(false);
          toast.error(
            "Payment failed. Please try again."
          );
        }
      );

      razorpay.open();
    } catch (error) {
      setLoading(false);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to start payment."
      );
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <button
        type="button"
        onClick={openCheckout}
        disabled={loading}
        className="mt-8 w-full rounded-full bg-yellow-400 px-6 py-4 font-bold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Processing Payment..."
          : `Pay ₹${amount.toFixed(2)} Securely`}
      </button>
    </>
  );
}
