"use client";

import { useEffect, useState } from "react";

type Batch = {
  id: string;
  batch_number: number;
  status: "draft" | "in_progress" | "completed" | "cancelled";
  notes: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string;
};

type ProductionOrder = {
  id: string;
  order_id: string;
  name: string;
  payment_status: string;
  order_status: string;
  total: number;
  custom_cover_id: string | null;
  product_printed: boolean;
  cover_verified: boolean;
  notebook_assembled: boolean;
  quality_checked: boolean;
  packed: boolean;
  production_checklist_updated_at: string | null;
  production_completed_at: string | null;
};

type BatchAssignment = {
  id: string;
  order_id: string;
  added_at: string;
  completed_at: string | null;
  orders: ProductionOrder | ProductionOrder[] | null;
};

type BatchDetails = {
  batch: Batch;
  orders: BatchAssignment[];
};

type QueueOrder = ProductionOrder;

type ProductionCoverAsset = {
  id: string;
  side: "front" | "insideFront" | "insideBack" | "back";
  label: string;
  url: string;
  width: number | null;
  height: number | null;
  mime_type: string | null;
  file_size: number | null;
  created_at: string;
  source: string;
};

type ProductionCoverSet = {
  ready: boolean;
  assets: ProductionCoverAsset[];
};

const statusLabels: Record<Batch["status"], string> = {
  draft: "Draft",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatMoney(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function getOrder(
  value: ProductionOrder | ProductionOrder[] | null,
): ProductionOrder | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function getChecklistCount(order: ProductionOrder) {
  return [
    order.product_printed,
    order.cover_verified,
    order.notebook_assembled,
    order.quality_checked,
    order.packed,
  ].filter(Boolean).length;
}

function isProductionComplete(order: ProductionOrder) {
  return getChecklistCount(order) === 5;
}

export default function ProductionBatchesClient() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<BatchDetails | null>(
    null,
  );

  const [productionOrders, setProductionOrders] = useState<QueueOrder[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [customCoverSets, setCustomCoverSets] = useState<
    Record<string, ProductionCoverSet>
  >({});

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [queueLoading, setQueueLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadBatches() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/production-batches", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load batches");
      }

      setBatches(data.batches ?? []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to load batches",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadProductionQueue() {
    setQueueLoading(true);

    try {
      const response = await fetch("/api/admin/orders/production-queue", {
        cache: "no-store",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to load production queue");
      }

      const data = await response.json();

      setProductionOrders(
        Array.isArray(data.orders) ? data.orders : [],
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to load production queue",
      );
    } finally {
      setQueueLoading(false);
    }
  }

  async function loadCustomCoverProduction(orderId: string) {
    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/custom-cover/production-assets`,
        {
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Failed to load production cover assets",
        );
      }

      setCustomCoverSets((current) => ({
        ...current,
        [orderId]: {
          ready: Boolean(data.ready),
          assets: Array.isArray(data.assets) ? data.assets : [],
        },
      }));
    } catch (error) {
      setCustomCoverSets((current) => ({
        ...current,
        [orderId]: {
          ready: false,
          assets: [],
        },
      }));

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to load production cover assets",
      );
    }
  }

  async function loadBatch(batchId: string) {
    setDetailLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/production-batches/${batchId}`,
        {
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load batch");
      }

      setSelectedBatch(data);

      const customOrders: ProductionOrder[] = (data.orders ?? [])
        .map((assignment: BatchAssignment) =>
          getOrder(assignment.orders),
        )
        .filter(
          (order: ProductionOrder | null): order is ProductionOrder =>
            Boolean(order?.custom_cover_id),
        );

      await Promise.all(
        customOrders.map((order: ProductionOrder) =>
          loadCustomCoverProduction(order.order_id),
        ),
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to load batch",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  async function updateChecklist(
    orderId: string,
    field:
      | "product_printed"
      | "cover_verified"
      | "notebook_assembled"
      | "quality_checked"
      | "packed",
    value: boolean,
  ) {
    setActionLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/production-checklist`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            field,
            value,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Failed to update production checklist",
        );
      }

      if (selectedBatch) {
        await loadBatch(selectedBatch.batch.id);
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to update production checklist",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function createOrRetryShipment(orderId: string) {
    setActionLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/shipping`,
        {
          method: "POST",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Failed to create shipment");
      }

      setMessage(
        data.created
          ? `Shipment created successfully for ${orderId}.`
          : `Shipping checked for ${orderId}: ${
              data.reason ?? "shipment already exists"
            }.`,
      );

      if (selectedBatch) {
        await loadBatch(selectedBatch.batch.id);
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to create shipment",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function updateBatch(status: "in_progress" | "completed" | "cancelled") {
    if (!selectedBatch) return;

    setActionLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/production-batches/${selectedBatch.batch.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to update batch");
      }

      await Promise.all([
        loadBatches(),
        loadProductionQueue(),
        loadBatch(selectedBatch.batch.id),
      ]);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to update batch",
      );
    } finally {
      setActionLoading(false);
    }
  }

  function toggleOrder(orderId: string) {
    setSelectedOrderIds((current) =>
      current.includes(orderId)
        ? current.filter((id) => id !== orderId)
        : [...current, orderId],
    );
  }

  async function createBatch() {
    if (selectedOrderIds.length === 0) {
      setMessage("Select at least one order.");
      return;
    }

    setActionLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/production-batches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes,
          orderIds: selectedOrderIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create production batch");
      }

      setMessage(
        `Batch #${data.batch?.batch_number ?? ""} created successfully.`,
      );
      setNotes("");
      setSelectedOrderIds([]);

      await Promise.all([
        loadBatches(),
        loadProductionQueue(),
      ]);

      if (data.batch?.id) {
        await loadBatch(data.batch.id);
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to create production batch",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteBatch() {
    if (!selectedBatch) return;

    setActionLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/production-batches/${selectedBatch.batch.id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to delete production batch");
      }

      setMessage(
        `Batch #${selectedBatch.batch.batch_number} deleted successfully.`,
      );
      setSelectedBatch(null);

      await Promise.all([
        loadBatches(),
        loadProductionQueue(),
      ]);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete production batch",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function removeOrder(orderId: string) {
    if (!selectedBatch) return;

    setActionLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/production-batches/${selectedBatch.batch.id}/orders/${orderId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.error ?? "Failed to remove order");
      }

      setMessage("Order removed from production batch.");

      await Promise.all([
        loadBatches(),
        loadProductionQueue(),
        loadBatch(selectedBatch.batch.id),
      ]);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to remove order",
      );
    } finally {
      setActionLoading(false);
    }
  }

  function printCustomCoverSet(
    orderId: string,
    coverSet: ProductionCoverSet | undefined,
  ) {
    if (!coverSet?.ready || coverSet.assets.length !== 4) {
      setMessage(
        `Print set for ${orderId} is not ready. All 4 production files are required.`,
      );
      return;
    }

    const orderedSides = [
      "front",
      "insideFront",
      "insideBack",
      "back",
    ] as const;

    const orderedAssets = orderedSides
      .map((side) =>
        coverSet.assets.find((asset) => asset.side === side),
      )
      .filter(
        (asset): asset is ProductionCoverAsset =>
          Boolean(asset),
      );

    if (orderedAssets.length !== 4) {
      setMessage(
        `Print set for ${orderId} is incomplete. All 4 production files are required.`,
      );
      return;
    }

    const escapeHtml = (value: string) =>
      value
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");

    const pages = orderedAssets
      .map(
        (asset, index) => `
          <section class="print-page">
            <div class="meta">
              <strong>${escapeHtml(asset.label)}</strong>
              <span>Order #${escapeHtml(orderId)}</span>
              <span>${asset.width ?? "—"} × ${asset.height ?? "—"} px</span>
            </div>
            <img src="${escapeHtml(asset.url)}" alt="${escapeHtml(asset.label)}" />
          </section>
        `,
      )
      .join("");

    const printWindow = window.open(
      "",
      "_blank",
      "noopener,noreferrer,width=1200,height=900",
    );

    if (!printWindow) {
      setMessage(
        "Print window was blocked. Allow pop-ups for MineNote Admin and try again.",
      );
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>MineNote Print Set — Order #${escapeHtml(orderId)}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
            }

            * {
              box-sizing: border-box;
            }

            html,
            body {
              margin: 0;
              padding: 0;
              background: white;
              color: black;
              font-family: Arial, Helvetica, sans-serif;
            }

            .print-page {
              min-height: calc(297mm - 20mm);
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              align-items: center;
              page-break-after: always;
              break-after: page;
              padding: 8mm;
            }

            .print-page:last-child {
              page-break-after: auto;
              break-after: auto;
            }

            .meta {
              width: 100%;
              display: flex;
              gap: 12px;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8mm;
              font-size: 10px;
            }

            .print-page img {
              display: block;
              max-width: 100%;
              max-height: 245mm;
              width: auto;
              height: auto;
              object-fit: contain;
            }

            @media screen {
              body {
                padding: 20px;
                background: #f4f4f5;
              }

              .print-page {
                background: white;
                margin: 0 auto 24px;
                max-width: 210mm;
                box-shadow: 0 10px 30px rgba(0,0,0,.12);
              }
            }
          </style>
        </head>
        <body>
          ${pages}

          <script>
            const images = Array.from(document.images);
            Promise.all(
              images.map((image) => {
                if (image.complete) return Promise.resolve();
                return new Promise((resolve) => {
                  image.addEventListener("load", resolve, { once: true });
                  image.addEventListener("error", resolve, { once: true });
                });
              })
            ).then(() => {
              setTimeout(() => window.print(), 300);
            });
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadBatches();
      void loadProductionQueue();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6 text-zinc-100">
      <header>
        <p className="text-sm font-medium text-zinc-500">Production</p>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Production Batches
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
          Group paid orders into production runs. Production finishes first;
          shipping automation starts only after the order is fully produced.
        </p>
      </header>

      {message && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-300">
          {message}
        </div>
      )}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-xl">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Production setup
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Create batch
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Select paid orders that are confirmed or processing and ready to
            enter production.
          </p>
        </div>

        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Optional production notes"
          className="mb-4 min-h-24 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-2 focus:ring-white/10"
        />

        {queueLoading ? (
          <p className="text-sm text-zinc-500">
            Loading production queue...
          </p>
        ) : productionOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 p-5">
            <p className="text-sm font-medium text-zinc-300">
              No orders waiting for production.
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Paid and confirmed/processing orders will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {productionOrders.map((order) => {
              const checklistCount = getChecklistCount(order);
              const selected = selectedOrderIds.includes(order.id);

              return (
                <label
                  key={order.id}
                  className={[
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all",
                    selected
                      ? "border-white/25 bg-white/10"
                      : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-white"
                    checked={selected}
                    onChange={() => toggleOrder(order.id)}
                  />

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-zinc-200">
                        Order #{order.order_id}
                      </span>

                      <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-400">
                        {checklistCount}/5 complete
                      </span>
                    </span>

                    <span className="mt-1 block text-xs text-zinc-500">
                      {order.name} · {formatMoney(order.total)} ·{" "}
                      {order.custom_cover_id
                        ? "Custom cover"
                        : "Ready-made product"}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        )}

        <button
          type="button"
          disabled={actionLoading || selectedOrderIds.length === 0}
          onClick={() => void createBatch()}
          className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {actionLoading
            ? "Creating..."
            : `Create Batch${
                selectedOrderIds.length
                  ? ` (${selectedOrderIds.length})`
                  : ""
              }`}
        </button>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Production runs
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Batches
              </h2>
            </div>

            <span className="rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-400">
              {batches.length}
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-zinc-500">Loading batches...</p>
          ) : batches.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 p-5 text-center">
              <p className="text-sm text-zinc-400">
                No production batches yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {batches.map((batch) => {
                const isSelected = selectedBatch?.batch.id === batch.id;

                return (
                  <button
                    key={batch.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => void loadBatch(batch.id)}
                    className={[
                      "group w-full cursor-pointer rounded-xl border p-4 text-left transition-all",
                      "focus:outline-none focus:ring-2 focus:ring-white/20",
                      isSelected
                        ? "border-white/30 bg-white/10 shadow-lg"
                        : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600 hover:bg-zinc-800/80",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={[
                            "flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold",
                            isSelected
                              ? "bg-white text-black"
                              : "bg-zinc-800 text-zinc-300 group-hover:bg-zinc-700",
                          ].join(" ")}
                        >
                          #{batch.batch_number}
                        </span>

                        <div>
                          <p className="font-semibold text-white">
                            Batch #{batch.batch_number}
                          </p>
                          <p className="mt-0.5 text-xs text-zinc-500">
                            Created {formatDate(batch.created_at)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={[
                          "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          batch.status === "draft"
                            ? "bg-zinc-800 text-zinc-300"
                            : batch.status === "in_progress"
                              ? "bg-amber-500/15 text-amber-300"
                              : batch.status === "completed"
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-red-500/15 text-red-300",
                        ].join(" ")}
                      >
                        {statusLabels[batch.status]}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-3 text-xs">
                      <span className="text-zinc-500">
                        Click to manage production
                      </span>
                      <span className="text-zinc-400 transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-xl">
          {!selectedBatch ? (
            <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-zinc-800">
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-300">
                  Select a batch
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  Choose a production batch to manage its orders.
                </p>
              </div>
            </div>
          ) : detailLoading ? (
            <p className="text-sm text-zinc-500">Loading batch...</p>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Production batch
                  </p>

                  <h2 className="mt-1 text-3xl font-bold text-white">
                    #{selectedBatch.batch.batch_number}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Status:{" "}
                    <strong className="text-zinc-300">
                      {statusLabels[selectedBatch.batch.status]}
                    </strong>
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedBatch.batch.status === "draft" && (
                    <>
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => void updateBatch("in_progress")}
                        className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-40"
                      >
                        Start Production
                      </button>

                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => void deleteBatch()}
                        className="rounded-xl border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-950/60 disabled:opacity-40"
                      >
                        Delete
                      </button>
                    </>
                  )}

                  {selectedBatch.batch.status === "in_progress" && (
                    <>
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => void updateBatch("completed")}
                        className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-40"
                      >
                        Complete Batch
                      </button>

                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => void updateBatch("cancelled")}
                        className="rounded-xl border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-950/60 disabled:opacity-40"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <p className="text-sm text-zinc-400">
                  {selectedBatch.batch.notes || "No production notes."}
                </p>
              </div>

              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-white">
                    Orders ({selectedBatch.orders.length})
                  </h3>
                  <span className="text-xs text-zinc-500">
                    Production progress
                  </span>
                </div>

                {selectedBatch.orders.length === 0 ? (
                  <p className="text-sm text-zinc-500">
                    No orders assigned.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedBatch.orders.map((assignment) => {
                      const order = getOrder(assignment.orders);

                      if (!order) return null;

                      const checklistCount = getChecklistCount(order);
                      const checklistComplete =
                        isProductionComplete(order);

                      return (
                        <div
                          key={assignment.id}
                          className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-zinc-200">
                                Order #{order.order_id}
                              </p>

                              <p className="mt-1 text-xs text-zinc-500">
                                {order.name} · {formatMoney(order.total)}
                              </p>

                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                {order.custom_cover_id ? (
                                  <>
                                    <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 font-semibold text-yellow-300">
                                      CUSTOM ORDER
                                    </span>
                                    <span className="text-zinc-600">
                                      Ordered cover
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-zinc-600">
                                    Catalog order
                                  </span>
                                )}
                              </div>
                            </div>

                            <span
                              className={[
                                "rounded-full px-2.5 py-1 text-xs font-semibold",
                                checklistComplete
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : "bg-zinc-800 text-zinc-400",
                              ].join(" ")}
                            >
                              {checklistCount}/5
                            </span>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
                            <ChecklistItem
                              label="Print"
                              complete={order.product_printed}
                              disabled={actionLoading}
                              onClick={() =>
                                void updateChecklist(
                                  order.order_id,
                                  "product_printed",
                                  !order.product_printed,
                                )
                              }
                            />
                            <ChecklistItem
                              label="Cover"
                              complete={order.cover_verified}
                              disabled={actionLoading}
                              onClick={() =>
                                void updateChecklist(
                                  order.order_id,
                                  "cover_verified",
                                  !order.cover_verified,
                                )
                              }
                            />
                            <ChecklistItem
                              label="Assemble"
                              complete={order.notebook_assembled}
                              disabled={actionLoading}
                              onClick={() =>
                                void updateChecklist(
                                  order.order_id,
                                  "notebook_assembled",
                                  !order.notebook_assembled,
                                )
                              }
                            />
                            <ChecklistItem
                              label="QC"
                              complete={order.quality_checked}
                              disabled={actionLoading}
                              onClick={() =>
                                void updateChecklist(
                                  order.order_id,
                                  "quality_checked",
                                  !order.quality_checked,
                                )
                              }
                            />
                            <ChecklistItem
                              label="Pack"
                              complete={order.packed}
                              disabled={actionLoading}
                              onClick={() =>
                                void updateChecklist(
                                  order.order_id,
                                  "packed",
                                  !order.packed,
                                )
                              }
                            />
                          </div>

                          {order.custom_cover_id && (
                            <CustomCoverProductionPanel
                              orderId={order.order_id}
                              coverSet={
                                customCoverSets[order.order_id]
                              }
                              disabled={actionLoading}
                              onPrint={() =>
                                printCustomCoverSet(
                                  order.order_id,
                                  customCoverSets[order.order_id],
                                )
                              }
                            />
                          )}

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs text-zinc-600">
                              {order.production_completed_at
                                ? `Production completed ${formatDate(
                                    order.production_completed_at,
                                  )}`
                                : "Production in progress"}
                            </span>

                            <div className="flex flex-wrap items-center gap-3">
                              {checklistComplete && (
                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() =>
                                    void createOrRetryShipment(order.order_id)
                                  }
                                  className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  🚚 {actionLoading
                                    ? "Processing..."
                                    : "Create / Retry Shipment"}
                                </button>
                              )}

                              {selectedBatch.batch.status === "draft" && (
                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() =>
                                    void removeOrder(order.id)
                                  }
                                  className="text-xs font-medium text-red-400 hover:text-red-300 disabled:opacity-40"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function CustomCoverProductionPanel({
  orderId,
  coverSet,
  disabled,
  onPrint,
}: {
  orderId: string;
  coverSet?: ProductionCoverSet;
  disabled: boolean;
  onPrint: () => void;
}) {
  const orderedSides = [
    "front",
    "insideFront",
    "insideBack",
    "back",
  ] as const;

  const assets = orderedSides
    .map((side) =>
      coverSet?.assets.find((asset) => asset.side === side),
    )
    .filter(
      (asset): asset is ProductionCoverAsset =>
        Boolean(asset),
    );

  const ready = Boolean(
    coverSet?.ready && assets.length === 4,
  );

  return (
    <section className="mt-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.04] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-yellow-300">
              Ordered custom cover
            </p>

            <span
              className={[
                "rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide",
                ready
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "bg-red-500/10 text-red-300",
              ].join(" ")}
            >
              {ready ? "4/4 Print Ready" : "Not Ready"}
            </span>
          </div>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Exact production artwork from this order&apos;s immutable
            approved snapshot. No regenerated or substitute preview.
          </p>
        </div>

        <button
          type="button"
          disabled={disabled || !ready}
          onClick={onPrint}
          className="shrink-0 rounded-xl bg-white px-3 py-2 text-xs font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          🖨️ Print 4-Page Set
        </button>
      </div>

      {assets.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 px-4 py-5 text-center">
          <p className="text-sm font-semibold text-zinc-300">
            Production cover files not ready
          </p>
          <p className="mt-1 text-xs text-zinc-600">
            Generate/verify all four production surfaces before printing.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {orderedSides.map((side) => {
            const asset = coverSet?.assets.find(
              (candidate) => candidate.side === side,
            );

            if (!asset) {
              return (
                <div
                  key={side}
                  className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-red-500/20 bg-zinc-950/40 p-4 text-center"
                >
                  <div>
                    <p className="text-sm font-semibold text-red-300">
                      {side === "front"
                        ? "Front Cover"
                        : side === "insideFront"
                          ? "Inside Front"
                          : side === "insideBack"
                            ? "Inside Back"
                            : "Back Cover"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-600">
                      Production asset missing
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={asset.id}
                className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/70"
              >
                <div className="flex items-center justify-between gap-2 border-b border-zinc-800 px-3 py-2">
                  <div>
                    <p className="text-xs font-bold text-zinc-200">
                      {asset.label}
                    </p>
                    <p className="text-[10px] text-zinc-600">
                      HQ · {asset.width ?? "—"} ×{" "}
                      {asset.height ?? "—"} px
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">
                    PRODUCTION
                  </span>
                </div>

                <a
                  href={asset.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group block bg-white p-3"
                  aria-label={`Open ${asset.label} HQ preview`}
                >
                  <img
                    src={asset.url}
                    alt={`${asset.label} — ordered production artwork`}
                    className="mx-auto max-h-[420px] w-full object-contain transition group-hover:scale-[1.01]"
                    loading="lazy"
                  />
                </a>

                <div className="flex items-center justify-between gap-2 border-t border-zinc-800 px-3 py-2">
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-zinc-300 underline decoration-zinc-700 underline-offset-4 transition hover:text-white hover:decoration-white"
                  >
                    View HQ
                  </a>

                  <a
                    href={asset.url}
                    download={`minenote-${orderId}-${asset.side}.png`}
                    className="text-xs font-semibold text-zinc-300 underline decoration-zinc-700 underline-offset-4 transition hover:text-white hover:decoration-white"
                  >
                    Print-ready ↓
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ChecklistItem({
  label,
  complete,
  disabled = false,
  onClick,
}: {
  label: string;
  complete: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "w-full rounded-lg border px-2 py-2 text-center text-xs font-medium transition",
        complete
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          : "border-zinc-800 bg-zinc-950/50 text-zinc-600 hover:border-zinc-700 hover:bg-zinc-900/70 hover:text-zinc-300",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      ].join(" ")}
    >
      {complete ? "✓" : "○"} {label}
    </button>
  );
}
