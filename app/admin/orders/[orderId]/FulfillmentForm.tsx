"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  orderId: string;
  shippingPartner: string | null;
  trackingId: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
};

export default function FulfillmentForm({
  orderId,
  shippingPartner,
  trackingId,
  trackingUrl,
  shippedAt,
  deliveredAt,
}: Props) {
  const router = useRouter();

  const [partner, setPartner] = useState(shippingPartner ?? "");
  const [tracking, setTracking] = useState(trackingId ?? "");
  const [url, setUrl] = useState(trackingUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setPartner(shippingPartner ?? "");
    setTracking(trackingId ?? "");
    setUrl(trackingUrl ?? "");
  }, [shippingPartner, trackingId, trackingUrl]);

  async function saveFulfillment() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/fulfillment`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shipping_partner: partner,
            tracking_id: tracking,
            tracking_url: url,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Unable to save fulfillment details."
        );
      }

      setMessage("Fulfillment details saved successfully.");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save fulfillment details."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(value: string | null) {
    if (!value) return "Not recorded";

    return new Date(value).toLocaleString("en-IN");
  }

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="shipping-partner"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Shipping Partner
          </label>

          <input
            id="shipping-partner"
            type="text"
            value={partner}
            onChange={(event) => setPartner(event.target.value)}
            placeholder="e.g. Delhivery"
            disabled={loading}
            className="mt-2 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400 focus:border-yellow-400"
          />
        </div>

        <div>
          <label
            htmlFor="tracking-id"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Tracking ID
          </label>

          <input
            id="tracking-id"
            type="text"
            value={tracking}
            onChange={(event) => setTracking(event.target.value)}
            placeholder="e.g. 1234567890"
            disabled={loading}
            className="mt-2 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400 focus:border-yellow-400"
          />
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor="tracking-url"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Tracking URL
        </label>

        <input
          id="tracking-url"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://..."
          disabled={loading}
          className="mt-2 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400 focus:border-yellow-400"
        />
      </div>

      <div className="mt-5 grid gap-3 text-sm md:grid-cols-2">
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-950 p-4">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">Shipped At</p>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">{formatDate(shippedAt)}</p>
        </div>

        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-950 p-4">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">Delivered At</p>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">{formatDate(deliveredAt)}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={saveFulfillment}
          disabled={loading}
          className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Tracking Details"}
        </button>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400 underline underline-offset-4 hover:text-zinc-900 dark:text-zinc-100"
          >
            Open Tracking Link ↗
          </a>
        )}
      </div>

      {message && (
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
      )}
    </div>
  );
}
