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

      setMessage("Order status updated successfully.");
      router.refresh();
    } catch (error) {
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
        className="block text-sm font-medium text-zinc-700"
      >
        Update status
      </label>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <select
          id="order-status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          disabled={loading}
          className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-yellow-400"
        >
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={updateStatus}
          disabled={loading || status === currentStatus}
          className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Status"}
        </button>
      </div>

      {message && (
        <p className="mt-3 text-sm text-zinc-600">
          {message}
        </p>
      )}
    </div>
  );
}
