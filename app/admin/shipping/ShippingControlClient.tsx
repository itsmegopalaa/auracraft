"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type Shipment = {
  id: string;
  order_id: string;
  status: string;
  shipment_id?: string | null;
  courier_name: string | null;
  courier_id: string | null;
  awb: string | null;
  tracking_url: string | null;
  label_url?: string | null;
  shipping_charge: number | null;
  weight_grams?: number | null;
  length_cm?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
  created_at: string;
  updated_at: string;
};

const statusLabel = (status: string) =>
  status.replaceAll("_", " ");

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "ready_for_pickup"
      ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300"
      : status === "delivered"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
        : status === "failed"
          ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
          : "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${tone}`}
    >
      {statusLabel(status)}
    </span>
  );
}

export default function ShippingControlClient({
  initialShipments,
}: {
  initialShipments: Shipment[];
}) {
  const [shipments, setShipments] = useState(initialShipments);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(
        "/api/admin/shipments",
        { cache: "no-store" },
      );

      if (!response.ok) return;

      const data = await response.json();

      setShipments(
        Array.isArray(data.shipments)
          ? data.shipments
          : [],
      );
    } catch (error) {
      console.error("Shipping refresh failed:", error);
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const action = async (
    shipmentId: string,
    endpoint: "pickup" | "tracking",
  ) => {
    setBusy(`${endpoint}:${shipmentId}`);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/admin/shipments/${shipmentId}/${endpoint}`,
        { method: "POST" },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Shipping action failed.",
        );
      }

      if (data.shipment) {
        setShipments((current) =>
          current.map((shipment) =>
            shipment.id === shipmentId
              ? { ...shipment, ...data.shipment }
              : shipment,
          ),
        );
      }

      setMessage(
        endpoint === "pickup"
          ? "Pickup scheduled successfully."
          : "Tracking refreshed successfully.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Shipping action failed.",
      );
    } finally {
      setBusy(null);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return shipments.filter((shipment) => {
      const matchesFilter =
        filter === "all" ||
        shipment.status === filter ||
        (filter === "transit" &&
          ["picked_up", "in_transit", "out_for_delivery"].includes(
            shipment.status,
          ));

      if (!matchesFilter) return false;
      if (!term) return true;

      return [
        shipment.order_id,
        shipment.awb,
        shipment.courier_name,
        shipment.status,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(term),
        );
    });
  }, [shipments, filter, search]);

  const counts = {
    all: shipments.length,
    created: shipments.filter(
      (shipment) => shipment.status === "created",
    ).length,
    ready: shipments.filter(
      (shipment) => shipment.status === "ready_for_pickup",
    ).length,
    transit: shipments.filter((shipment) =>
      ["picked_up", "in_transit", "out_for_delivery"].includes(
        shipment.status,
      ),
    ).length,
    delivered: shipments.filter(
      (shipment) => shipment.status === "delivered",
    ).length,
    failed: shipments.filter(
      (shipment) => shipment.status === "failed",
    ).length,
  };

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {[
          ["All", "all", counts.all],
          ["Created", "created", counts.created],
          ["Ready", "ready_for_pickup", counts.ready],
          ["In Transit", "transit", counts.transit],
          ["Delivered", "delivered", counts.delivered],
          ["Exceptions", "failed", counts.failed],
        ].map(([label, value, count]) => (
          <button
            key={String(value)}
            type="button"
            onClick={() =>
              setFilter(
                value === "transit" ? "transit" : String(value),
              )
            }
            className={`rounded-2xl border p-4 text-left transition ${
              filter === value
                ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20"
                : "border-zinc-200 bg-white hover:border-yellow-300 dark:border-zinc-800 dark:bg-zinc-900"
            }`}
          >
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {label}
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-white">
              {count}
            </p>
          </button>
        ))}
      </section>

      {message && (
        <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
          {message}
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 border-b border-zinc-200 p-5 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
              Shipping Control
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Review shipment state and explicitly authorize courier pickup.
            </p>
          </div>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order, AWB or courier…"
            className="min-h-11 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-yellow-400 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>

        {filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/60">
                <tr>
                  {[
                    "Order",
                    "Courier",
                    "AWB",
                    "Status",
                    "Package",
                    "Charge",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.map((shipment) => {
                  const canPickup =
                    shipment.status === "created";

                  const busyPickup =
                    busy === `pickup:${shipment.id}`;

                  const busyTracking =
                    busy === `tracking:${shipment.id}`;

                  return (
                    <tr
                      key={shipment.id}
                      className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/orders/${shipment.order_id}`}
                          className="font-semibold text-yellow-600 underline-offset-4 hover:underline dark:text-yellow-400"
                        >
                          {shipment.order_id}
                        </Link>
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-700 dark:text-zinc-200">
                        {shipment.courier_name ||
                          shipment.courier_id ||
                          "—"}
                      </td>

                      <td className="px-5 py-4">
                        {shipment.awb ? (
                          <span className="font-mono text-sm text-zinc-800 dark:text-zinc-100">
                            {shipment.awb}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={shipment.status} />
                      </td>

                      <td className="px-5 py-4 text-xs text-zinc-500 dark:text-zinc-400">
                        {shipment.weight_grams
                          ? `${shipment.weight_grams}g`
                          : "—"}
                        {" · "}
                        {shipment.length_cm &&
                        shipment.width_cm &&
                        shipment.height_cm
                          ? `${shipment.length_cm}×${shipment.width_cm}×${shipment.height_cm} cm`
                          : "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-700 dark:text-zinc-200">
                        {shipment.shipping_charge != null
                          ? `₹${Number(
                              shipment.shipping_charge,
                            ).toLocaleString("en-IN")}`
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          {canPickup && (
                            <button
                              type="button"
                              disabled={busy !== null}
                              onClick={() =>
                                action(
                                  shipment.id,
                                  "pickup",
                                )
                              }
                              className="rounded-xl bg-yellow-400 px-3 py-2 text-xs font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {busyPickup
                                ? "Scheduling…"
                                : "Schedule Pickup"}
                            </button>
                          )}

                          {shipment.tracking_url && (
                            <a
                              href={shipment.tracking_url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 underline-offset-4 hover:underline dark:border-zinc-700 dark:text-zinc-200"
                            >
                              Track ↗
                            </a>
                          )}

                          {shipment.label_url && (
                            <a
                              href={shipment.label_url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 underline-offset-4 hover:underline dark:border-zinc-700 dark:text-zinc-200"
                            >
                              Label ↗
                            </a>
                          )}

                          {shipment.awb && (
                            <button
                              type="button"
                              disabled={busy !== null}
                              onClick={() =>
                                action(
                                  shipment.id,
                                  "tracking",
                                )
                              }
                              className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 hover:border-yellow-300 dark:border-zinc-700 dark:text-zinc-200"
                            >
                              {busyTracking
                                ? "Refreshing…"
                                : "Refresh"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-14 text-center">
            <div className="text-3xl">🚚</div>
            <h3 className="mt-3 font-semibold text-zinc-900 dark:text-zinc-100">
              No shipments match this view
            </h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Try another status or search term.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
