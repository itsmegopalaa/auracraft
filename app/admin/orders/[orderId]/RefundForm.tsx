"use client";

import { useState } from "react";

type RefundFormProps = {
  orderId: string;
  total: number;
  paymentStatus: string | null;
  refundStatus: string | null;
  refundAmount: number | null;
  refundId: string | null;
};

export default function RefundForm({
  orderId,
  total,
  paymentStatus,
  refundStatus,
  refundAmount,
  refundId,
}: RefundFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isRefunded =
    refundStatus === "processed" || refundStatus === "partial";

  async function handleRefund() {
    setError("");

    const confirmed = window.confirm(
      `Refund ₹${Number(total).toLocaleString("en-IN")} for order ${orderId}?\n\nThis will create a REAL Razorpay refund for the full order amount.`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/orders/${encodeURIComponent(orderId)}/refund`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: Number(total),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error || "Refund could not be processed."
        );
      }

      window.location.reload();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unexpected refund error."
      );
    } finally {
      setLoading(false);
    }
  }

  if (isRefunded) {
    return (
      <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
        <p className="font-semibold text-emerald-800 dark:text-emerald-300">
          {refundStatus === "partial"
            ? "Partial refund processed"
            : "Refund processed"}
        </p>

        {refundAmount !== null && (
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
            Refunded: ₹
            {Number(refundAmount).toLocaleString("en-IN")}
          </p>
        )}

        {refundId && (
          <p className="mt-1 break-all text-xs text-emerald-700 dark:text-emerald-400">
            Refund ID: {refundId}
          </p>
        )}
      </div>
    );
  }

  if (refundStatus === "pending") {
    return (
      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
        <p className="font-semibold text-amber-800 dark:text-amber-300">
          Refund pending
        </p>

        <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
          Check Razorpay before attempting another refund.
        </p>
      </div>
    );
  }

  if (refundStatus === "failed") {
    return (
      <div className="mt-5 border-t border-zinc-100 pt-5 dark:border-zinc-800">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
          <p className="font-semibold text-red-800 dark:text-red-300">
            Previous refund attempt failed
          </p>

          <p className="mt-1 text-sm text-red-700 dark:text-red-400">
            Razorpay did not accept the previous refund. You can safely retry
            after verifying the payment state.
          </p>

          <button
            type="button"
            onClick={handleRefund}
            disabled={loading}
            className="mt-4 min-h-12 w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            {loading
              ? "Processing refund..."
              : `Retry refund ₹${Number(total).toLocaleString("en-IN")}`}
          </button>

          {error && (
            <p className="mt-3 text-sm font-medium text-red-700 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (paymentStatus !== "paid") {
    return null;
  }

  return (
    <div className="mt-5 border-t border-zinc-100 pt-5 dark:border-zinc-800">
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
        <p className="font-semibold text-red-800 dark:text-red-300">
          Refund payment
        </p>

        <p className="mt-1 text-sm text-red-700 dark:text-red-400">
          This will issue a real Razorpay refund of ₹
          {Number(total).toLocaleString("en-IN")} for the full order amount.
        </p>

        <button
          type="button"
          onClick={handleRefund}
          disabled={loading}
          className="mt-4 min-h-12 w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          {loading
            ? "Processing refund..."
            : `Refund ₹${Number(total).toLocaleString("en-IN")}`}
        </button>

        {error && (
          <p className="mt-3 text-sm font-medium text-red-700 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
