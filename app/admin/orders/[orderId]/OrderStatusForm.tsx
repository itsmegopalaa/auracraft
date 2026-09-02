"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = [
  "placed",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

type Props = {
  orderId: string;
  currentStatus: string;
};

export default function OrderStatusForm({
  orderId,
  currentStatus,
}: Props) {
  const router = useRouter();

  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function updateStatus() {
    if (status === currentStatus) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Unable to update order status."
        );
      }

      const savedStatus =
        result.order?.order_status;

      if (!savedStatus) {
        throw new Error(
          "Order status update returned an invalid response."
        );
      }

      setStatus(savedStatus);
      setMessage(
        `Order status updated to ${savedStatus}.`
      );

      router.refresh();
    } catch (error) {
      setStatus(currentStatus);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to update order status."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <label
        htmlFor="order-status"
        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        Update status
      </label>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
        <select
          id="order-status"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
          disabled={loading}
          className="min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-yellow-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 sm:flex-1"
        >
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item.charAt(0).toUpperCase() +
                item.slice(1)}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={updateStatus}
          disabled={
            loading ||
            status === currentStatus
          }
          className="min-h-12 w-full rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          {loading
            ? "Updating..."
            : "Update Status"}
        </button>
      </div>

      {message && (
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          {message}
        </p>
      )}
    </div>
  );
}
