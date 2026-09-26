"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RefundForm from "./RefundForm";
import FulfillmentForm from "./FulfillmentForm";
import {
  OrientationIcon,
  PaperIcon,
  PagesIcon,
  SizeIcon,
} from "@/app/components/PhysicalConfigVisuals";
import NotebookPageFlip, {
  type NotebookFlipPage,
} from "@/app/components/notebook/NotebookPageFlip";
import {
  buildNotebookPrintPairs,
  type NotebookPrintAsset,
} from "@/app/lib/notebook-print-layout";

type Shipment = {
  id: string;
  status: string | null;
  courier_name?: string | null;
  awb?: string | null;
  tracking_url?: string | null;
  label_url?: string | null;
  shipping_charge?: number | null;
};

type OrderItem = {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  pages: number | null;
  paper: "plain" | "ruled" | "dotGrid" | null;
  paperGsm: number | null;
  size: "A4" | "A5" | null;
  orientation: "portrait" | "landscape" | null;
  customCoverId: string | null;
};

type CustomCover = {
  id: string;
  status: string;
  artworkComplete?: boolean;
};

type ProductionChecklist = {
  product_printed: boolean;
  cover_verified: boolean;
  notebook_assembled: boolean;
  quality_checked: boolean;
  packed: boolean;
};

type ProductionCoverAsset = {
  id: string;
  side: "front" | "insideFront" | "insideBack" | "back";
  label: string;
  url: string;
  width?: number | null;
  height?: number | null;
};

type TimelineEvent = {
  id: string;
  source: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

type Props = {
  orderId: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  total: number;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPin: string | null;
  deliveryMethod: string | null;
  shippingPartner: string | null;
  trackingId: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  items: OrderItem[];
  shipment: Shipment | null;
  customCover: CustomCover | null;
  productionChecklist: ProductionChecklist;
  refundStatus: string | null;
  refundAmount: number | null;
  refundId: string | null;
  timeline: TimelineEvent[];
};

type Section =
  | "overview"
  | "payment"
  | "items"
  | "cover"
  | "production"
  | "shipping"
  | "refund"
  | "timeline";

function isProductionReady(orderStatus: string) {
  return ["confirmed", "processing"].includes(orderStatus);
}

function statusLabel(value: string | null | undefined) {
  return value ? value.replaceAll("_", " ") : "Not started";
}

export default function OrderCommandCenter({
  orderId,
  orderStatus,
  paymentStatus,
  paymentMethod,
  razorpayOrderId,
  razorpayPaymentId,
  total,
  customerName,
  customerEmail,
  customerPhone,
  shippingAddress,
  shippingCity,
  shippingState,
  shippingPin,
  deliveryMethod,
  shippingPartner,
  trackingId,
  trackingUrl,
  shippedAt,
  deliveredAt,
  items,
  shipment,
  customCover,
  productionChecklist,
  refundStatus,
  refundAmount,
  refundId,
  timeline,
}: Props) {
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [productionAssets, setProductionAssets] = useState<
    ProductionCoverAsset[]
  >([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [productPreviewOpen, setProductPreviewOpen] = useState(false);

  const sections: Array<{ id: Section; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "payment", label: "Payment" },
    { id: "items", label: "Items" },
    { id: "production", label: "Production" },
    { id: "shipping", label: "Shipping" },
    { id: "timeline", label: "Activity" },
  ];

  const canCreateShipment =
    !shipment &&
    paymentStatus === "paid" &&
    isProductionReady(orderStatus);

  const canSchedulePickup =
    Boolean(shipment) &&
    ["created", "serviceable"].includes(shipment?.status ?? "");

  const canRefreshTracking = Boolean(shipment?.awb);

  async function runAction(
    key: string,
    request: () => Promise<Response>,
    successMessage: string,
  ) {
    setBusy(key);
    setMessage(null);

    try {
      const response = await request();
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || payload?.success === false) {
        throw new Error(
          payload?.error ||
            payload?.message ||
            "The requested action could not be completed.",
        );
      }

      setMessage(successMessage);
      window.location.reload();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "The requested action could not be completed.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function createShipment() {
    if (
      !window.confirm(
        `Prepare a shipping shipment for ${orderId}?\n\nThis will contact the shipping provider and create the shipment. Pickup will NOT be scheduled automatically.`,
      )
    ) {
      return;
    }

    await runAction(
      "create-shipment",
      () =>
        fetch(`/api/admin/orders/${orderId}/shipping`, {
          method: "POST",
        }),
      "Shipment created. Pickup still requires explicit Admin action.",
    );
  }

  async function schedulePickup() {
    if (!shipment) return;

    if (
      !window.confirm(
        `Schedule courier pickup for ${orderId}?\n\nThis is an external shipping-provider action.`,
      )
    ) {
      return;
    }

    await runAction(
      "schedule-pickup",
      () =>
        fetch(`/api/admin/shipments/${shipment.id}/pickup`, {
          method: "POST",
        }),
      "Courier pickup scheduled.",
    );
  }

  async function refreshTracking() {
    if (!shipment) return;

    await runAction(
      "refresh-tracking",
      () =>
        fetch(`/api/admin/shipments/${shipment.id}/tracking`, {
          method: "POST",
        }),
      "Tracking refreshed.",
    );
  }

  function jumpTo(section: Section) {
    setActiveSection(section);

    document
      .getElementById(`order-section-${section}`)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  useEffect(() => {
    const elements = sections
      .map((section) =>
        document.getElementById(`order-section-${section.id}`),
      )
      .filter((element): element is HTMLElement => Boolean(element));

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => b.intersectionRatio - a.intersectionRatio,
          );

        if (!visible[0]) return;

        const sectionId = visible[0].target.id.replace(
          "order-section-",
          "",
        );

        if (sections.some((section) => section.id === sectionId)) {
          setActiveSection(sectionId as Section);
        }
      },
      {
        rootMargin: "-18% 0px -62% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75],
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const productionItems: Array<{
    field: keyof ProductionChecklist;
    label: string;
  }> = [
    { field: "product_printed", label: "Product printed" },
    { field: "cover_verified", label: "Cover verified" },
    { field: "notebook_assembled", label: "Notebook assembled" },
    { field: "quality_checked", label: "Quality checked" },
    { field: "packed", label: "Packed" },
  ];

  const productionCompleted = productionItems.filter(
    ({ field }) => productionChecklist[field],
  ).length;

  const productionComplete =
    productionCompleted === productionItems.length;

  async function updateOrderStatus(nextStatus: string) {
    if (nextStatus === orderStatus) return;

    if (
      nextStatus === "cancelled" &&
      !window.confirm(
        `Cancel order ${orderId}?\n\nCancellation does NOT automatically issue a refund.`,
      )
    ) {
      return;
    }

    if (
      nextStatus !== "cancelled" &&
      !window.confirm(
        `Change order ${orderId} status from ${statusLabel(orderStatus)} to ${statusLabel(nextStatus)}?\n\nThis is an explicit Admin status change.`,
      )
    ) {
      return;
    }

    await runAction(
      `status-${nextStatus}`,
      () =>
        fetch(`/api/admin/orders/${orderId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: nextStatus }),
        }),
      `Order status changed to ${statusLabel(nextStatus)}.`,
    );
  }

  async function toggleProduction(
    field: keyof ProductionChecklist,
  ) {
    const nextValue = !productionChecklist[field];

    await runAction(
      `production-${field}`,
      () =>
        fetch(`/api/admin/orders/${orderId}/production-checklist`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            field,
            value: nextValue,
          }),
        }),
      `${productionItems.find((item) => item.field === field)?.label ?? field} ${
        nextValue ? "completed" : "reopened"
      }.`,
    );
  }

  async function loadProductionAssets() {
    if (!customCover) return false;

    setBusy("production-assets");

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/custom-cover/production-assets`,
        { cache: "no-store" },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(
          data.error ?? "Unable to load production artwork.",
        );
      }

      const assets = Array.isArray(data.assets)
        ? data.assets
        : [];

      setProductionAssets(assets);

      if (!data.ready || assets.length !== 4) {
        throw new Error(
          "Production artwork is not ready. All 4 approved production surfaces are required.",
        );
      }

      return true;
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load production artwork.",
      );
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function openProductionPreview() {
    const ready = await loadProductionAssets();

    if (ready) {
      setPreviewOpen(true);
    }
  }

  async function printProductionSet() {
    const ready =
      productionAssets.length === 4 ||
      (await loadProductionAssets());

    if (!ready) return;

    const productionPrintAssets: NotebookPrintAsset[] =
      productionAssets.map((asset) => ({
        physicalSide: asset.side,
        url: asset.url,
      }));

    const printPairs = buildNotebookPrintPairs(
      productionPrintAssets,
    );

    const hasCompletePrintPairs = printPairs.every(
      (pair) => pair.front.asset && pair.reverse.asset,
    );

    if (!hasCompletePrintPairs) {
      setMessage(
        "Print set is incomplete. Both sides of both physical sheets are required.",
      );
      return;
    }

    const escapeHtml = (value: string) =>
      value
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");

    const pages = printPairs
      .flatMap((pair) => [
        {
          sheetId: pair.sheetId,
          sheetSide: "front" as const,
          specification: pair.front.specification,
          asset: pair.front.asset,
        },
        {
          sheetId: pair.sheetId,
          sheetSide: "reverse" as const,
          specification: pair.reverse.specification,
          asset: pair.reverse.asset,
        },
      ])
      .map(
        ({ sheetId, sheetSide, specification, asset }) => {
          const sourceAsset = productionAssets.find(
            (candidate) =>
              candidate.side === specification.physicalSide,
          );

          const assetLabel =
            sourceAsset?.label ||
            specification.physicalSide;

          return `
          <section class="print-page">
            <div class="meta">
              <strong>MineNote · ${escapeHtml(assetLabel)}</strong>
              <span>Order #${escapeHtml(orderId)}</span>
              <span>${escapeHtml(sheetId)} · ${escapeHtml(sheetSide)}</span>
            </div>

            <div class="production-note">
              <span>Physical sheet</span>
              <strong>${escapeHtml(sheetId)}</strong>
              <span>•</span>
              <span>${escapeHtml(sheetSide)}</span>
              <span>•</span>
              <span>${escapeHtml(specification.physicalSide)}</span>
            </div>

            <img
              src="${escapeHtml(asset!.url)}"
              alt="${escapeHtml(assetLabel)}"
            />
          </section>
        `;
        },
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
              align-items: center;
              page-break-after: always;
              break-after: page;
              padding: 6mm;
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
              margin-bottom: 3mm;
              font-size: 9px;
            }

            .production-note {
              width: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 6px;
              margin-bottom: 6mm;
              padding: 2mm 3mm;
              border: 0.25mm solid #d4d4d4;
              font-size: 8px;
              text-transform: uppercase;
              letter-spacing: 0.08em;
            }

            .production-note strong {
              font-size: 8px;
            }

            .print-page img {
              display: block;
              max-width: 100%;
              max-height: 252mm;
              width: auto;
              height: auto;
              object-fit: contain;
            }

            @media print {
              .print-page {
                page-break-after: always;
                break-after: page;
              }

              .print-page:last-child {
                page-break-after: auto;
                break-after: auto;
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
                if (image.complete) {
                  return Promise.resolve();
                }

                return new Promise((resolve) => {
                  image.addEventListener("load", resolve, {
                    once: true,
                  });

                  image.addEventListener("error", resolve, {
                    once: true,
                  });
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

    // Browser print cannot force the physical printer's duplex mode.
    // The generated sequence is therefore explicitly:
    //
    // Sheet 1 → Front → Inside Front
    // Sheet 2 → Inside Back → Back
    //
    // Admin/printer dialog should use duplex + long-edge binding
    // for the configured notebook physical model.

    if (!productionChecklist.product_printed) {
      await toggleProduction("product_printed");
    }
  }

  const actionRequired =
    paymentStatus !== "paid"
      ? "Payment requires attention"
      : !shipment && isProductionReady(orderStatus)
        ? "Order is eligible for shipment preparation"
        : shipment?.status === "ready_for_pickup"
          ? "Shipment is ready for courier pickup"
          : shipment?.status === "failed"
            ? "Shipment requires attention"
            : null;

  return (
    <section
      aria-label="Order command center"
      className="mt-4 scroll-mt-24"
      id="order-section-overview"
    >
      <div className="overflow-hidden rounded-[20px] border border-[var(--mn-border)] bg-[var(--mn-surface)] shadow-[var(--mn-shadow-sm)]">

        {/* HEADER */}
        <div className="border-b border-[var(--mn-border)] px-3 py-3 sm:px-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--mn-accent)]">
                  Order
                </p>
                <span className="font-mono text-[11px] text-[var(--mn-text-secondary)]">
                  {orderId}
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold tracking-[-0.02em] text-[var(--mn-text)]">
                  {customerName || "Customer order"}
                </h2>

                <span className="rounded-full border border-[var(--mn-border)] bg-[var(--mn-control-bg)] px-2 py-1 text-[10px] font-bold capitalize text-[var(--mn-text-secondary)]">
                  {statusLabel(orderStatus)}
                </span>

                <span className="text-sm font-bold text-[var(--mn-text)]">
                  ₹{Number(total).toLocaleString("en-IN")}
                </span>
              </div>

              <p className="mt-1 text-[11px] text-[var(--mn-text-secondary)]">
                {customerEmail || "No email"} · {customerPhone || "No phone"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {items.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setProductPreviewOpen(true)}
                  className="rounded-lg border border-[var(--mn-border)] bg-[var(--mn-control-bg)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--mn-text)] hover:border-[var(--mn-accent)]"
                >
                  Product Preview
                </button>
              ) : null}

              {customCover ? (
                <>
                  <button
                    type="button"
                    onClick={() => void openProductionPreview()}
                    className="rounded-lg border border-[var(--mn-border)] bg-[var(--mn-control-bg)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--mn-text)] hover:border-[var(--mn-accent)]"
                  >
                    Production Preview
                  </button>

                  <button
                    type="button"
                    onClick={() => void printProductionSet()}
                    className="rounded-lg bg-[var(--mn-text)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--mn-text-inverse)]"
                  >
                    Print
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* ORDER FLOW */}
        <div className="border-b border-[var(--mn-border)] px-3 py-3 sm:px-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            {[
              ["placed", "Placed"],
              ["confirmed", "Confirmed"],
              ["processing", "Processing"],
              ["shipped", "Shipped"],
              ["delivered", "Delivered"],
            ].map(([value, label], index, steps) => {
              const currentIndex = steps.findIndex(([step]) => step === orderStatus);
              const stepIndex = index;
              const complete = currentIndex >= stepIndex && currentIndex >= 0;
              const current = value === orderStatus;

              return (
                <div key={value} className="flex min-w-0 flex-1 items-center">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-black ${
                        current
                          ? "bg-[var(--mn-accent)] text-[var(--mn-accent-contrast)]"
                          : complete
                            ? "bg-emerald-500 text-white"
                            : "border border-[var(--mn-border-strong)] text-[var(--mn-text-muted)]"
                      }`}
                    >
                      {complete ? "✓" : index + 1}
                    </span>

                    <span
                      className={`whitespace-nowrap text-[10px] font-semibold ${
                        current
                          ? "text-[var(--mn-text)]"
                          : "text-[var(--mn-text-muted)]"
                      }`}
                    >
                      {label}
                    </span>
                  </div>

                  {index < steps.length - 1 ? (
                    <span className="mx-2 h-px flex-1 bg-[var(--mn-border)]" />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* CURRENT ACTION */}
        {actionRequired ? (
          <div className="border-b border-[var(--mn-border)] bg-[var(--mn-accent-soft)] px-3 py-3 sm:px-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mn-accent)]">
                  Current action
                </p>
                <p className="mt-0.5 text-sm font-bold text-[var(--mn-text)]">
                  {actionRequired}
                </p>
              </div>

              {!shipment && paymentStatus === "paid" && isProductionReady(orderStatus) ? (
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => void createShipment()}
                  className="rounded-lg bg-[var(--mn-text)] px-3 py-2 text-[11px] font-bold text-[var(--mn-text-inverse)] disabled:opacity-50"
                >
                  {busy === "create-shipment"
                    ? "Preparing…"
                    : "Prepare Shipment"}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* QUICK SECTION NAV */}
        <nav
          aria-label="Order sections"
          className="flex gap-1 overflow-x-auto border-b border-[var(--mn-border)] px-3 py-2 sm:px-4"
        >
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => jumpTo(section.id)}
              className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${
                activeSection === section.id
                  ? "bg-[var(--mn-control-bg)] text-[var(--mn-text)] underline decoration-[var(--mn-accent)] decoration-2 underline-offset-4"
                  : "text-[var(--mn-text-muted)] hover:bg-[var(--mn-control-bg)] hover:text-[var(--mn-text)]"
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-3 sm:px-4 sm:py-4">

          {/* OVERVIEW */}
          {activeSection === "overview" ? (
          <section
            id="order-section-overview-details"
            className="scroll-mt-24"
          >
            <div className="grid gap-2 md:grid-cols-2">
              <div className="rounded-xl border border-[var(--mn-border)] bg-[var(--mn-control-bg)] p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mn-text-muted)]">
                  Customer
                </p>
                <p className="mt-1 text-sm font-bold text-[var(--mn-text)]">
                  {customerName || "—"}
                </p>
                <p className="mt-0.5 break-all text-[11px] text-[var(--mn-text-secondary)]">
                  {customerEmail || "—"}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--mn-text-secondary)]">
                  {customerPhone || "—"}
                </p>
              </div>

              <div className="rounded-xl border border-[var(--mn-border)] bg-[var(--mn-control-bg)] p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mn-text-muted)]">
                  Delivery
                </p>
                <p className="mt-1 text-sm font-bold text-[var(--mn-text)]">
                  {deliveryMethod || "Standard delivery"}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--mn-text-secondary)]">
                  {shippingCity || "—"}, {shippingState || "—"} {shippingPin || ""}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--mn-text-secondary)]">
                  {shippingAddress || "No address"}
                </p>
              </div>
            </div>
          </section>
          ) : null}

          {/* PAYMENT + REFUND */}
          {activeSection === "payment" ? (
          <section
            id="order-section-payment"
            className="mt-3 scroll-mt-24 rounded-xl border border-[var(--mn-border)] p-3"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mn-text-muted)]">
                  Payment
                </p>
                <h3 className="mt-0.5 text-sm font-bold text-[var(--mn-text)]">
                  Payment & refund
                </h3>
              </div>

              <span className={`text-xs font-bold ${
                paymentStatus === "paid"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}>
                {statusLabel(paymentStatus)}
              </span>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg bg-[var(--mn-control-bg)] p-2.5">
                <p className="text-[10px] text-[var(--mn-text-muted)]">Method</p>
                <p className="mt-0.5 text-xs font-semibold capitalize text-[var(--mn-text)]">
                  {paymentMethod || "—"}
                </p>
              </div>

              <div className="rounded-lg bg-[var(--mn-control-bg)] p-2.5">
                <p className="text-[10px] text-[var(--mn-text-muted)]">Razorpay order</p>
                <p className="mt-0.5 break-all text-[10px] font-semibold text-[var(--mn-text)]">
                  {razorpayOrderId || "—"}
                </p>
              </div>

              <div className="rounded-lg bg-[var(--mn-control-bg)] p-2.5">
                <p className="text-[10px] text-[var(--mn-text-muted)]">Payment ID</p>
                <p className="mt-0.5 break-all text-[10px] font-semibold text-[var(--mn-text)]">
                  {razorpayPaymentId || "—"}
                </p>
              </div>
            </div>

            <div className="mt-3 border-t border-[var(--mn-border)] pt-3">
              <RefundForm
                orderId={orderId}
                paymentStatus={paymentStatus}
                refundStatus={refundStatus}
                refundAmount={refundAmount}
                refundId={refundId}
                total={total}
              />
            </div>
          </section>
          ) : null}

          {/* ITEMS */}
          {activeSection === "items" ? (
          <section
            id="order-section-items"
            className="mt-3 scroll-mt-24 rounded-xl border border-[var(--mn-border)] p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mn-text-muted)]">
                  Items
                </p>
                <h3 className="mt-0.5 text-sm font-bold text-[var(--mn-text)]">
                  Ordered products
                </h3>
              </div>

            </div>

            <div className="mt-3 space-y-2">
              {items.length > 0 ? (
                items.map((item) => {
                  const lineTotal =
                    Number(item.price) * Number(item.quantity);

                  return (
                    <article
                      key={`${String(item.id)}-${item.customCoverId ?? "standard"}`}
                      className="rounded-xl border border-[var(--mn-border)] bg-[var(--mn-control-bg)] p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--mn-surface)]">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-contain"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-[var(--mn-text)]">
                                {item.name}
                              </p>

                              <p className="mt-0.5 text-[11px] text-[var(--mn-text-secondary)]">
                                Product ID: {String(item.id)}
                              </p>
                            </div>

                            <p className="shrink-0 text-sm font-bold text-[var(--mn-text)]">
                              ₹{lineTotal.toLocaleString("en-IN")}
                            </p>
                          </div>

                          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                            <div className="rounded-lg bg-[var(--mn-surface)] px-2 py-1.5">
                              <p className="text-[9px] uppercase tracking-wide text-[var(--mn-text-muted)]">
                                Pages
                              </p>
                              <p className="mt-0.5 text-[11px] font-bold text-[var(--mn-text)]">
                                {item.pages != null
                                  ? `${item.pages} pages`
                                  : "Not recorded"}
                              </p>
                            </div>

                            <div className="rounded-lg bg-[var(--mn-surface)] px-2 py-1.5">
                              <p className="text-[9px] uppercase tracking-wide text-[var(--mn-text-muted)]">
                                Quantity
                              </p>
                              <p className="mt-0.5 text-[11px] font-bold text-[var(--mn-text)]">
                                {item.quantity}
                              </p>
                            </div>

                            <div className="rounded-lg bg-[var(--mn-surface)] px-2 py-1.5">
                              <p className="text-[9px] uppercase tracking-wide text-[var(--mn-text-muted)]">
                                Unit price
                              </p>
                              <p className="mt-0.5 text-[11px] font-bold text-[var(--mn-text)]">
                                ₹{Number(item.price).toLocaleString("en-IN")}
                              </p>
                            </div>

                            <div className="rounded-lg bg-[var(--mn-surface)] px-2 py-1.5">
                              <p className="text-[9px] uppercase tracking-wide text-[var(--mn-text-muted)]">
                                Cover
                              </p>
                              <p className="mt-0.5 text-[11px] font-bold text-[var(--mn-text)]">
                                {item.customCoverId ? "Custom" : "Catalog"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                            <div className="rounded-lg bg-[var(--mn-surface)] px-2 py-2">
                              <div className="flex items-center gap-1.5">
                                {item.size ? (
                                  <SizeIcon value={item.size} size="sm" />
                                ) : null}
                                <p className="text-[9px] uppercase tracking-wide text-[var(--mn-text-muted)]">
                                  Size
                                </p>
                              </div>
                              <p className="mt-1 text-[11px] font-bold text-[var(--mn-text)]">
                                {item.size ?? "Not recorded"}
                              </p>
                            </div>

                            <div className="rounded-lg bg-[var(--mn-surface)] px-2 py-2">
                              <div className="flex items-center gap-1.5">
                                {item.orientation ? (
                                  <OrientationIcon
                                    value={item.orientation}
                                    size="sm"
                                  />
                                ) : null}
                                <p className="text-[9px] uppercase tracking-wide text-[var(--mn-text-muted)]">
                                  Orientation
                                </p>
                              </div>
                              <p className="mt-1 text-[11px] font-bold text-[var(--mn-text)]">
                                {item.orientation === "portrait"
                                  ? "Portrait"
                                  : item.orientation === "landscape"
                                    ? "Landscape"
                                    : "Not recorded"}
                              </p>
                            </div>

                            <div className="rounded-lg bg-[var(--mn-surface)] px-2 py-2">
                              <div className="flex items-center gap-1.5">
                                {item.paper ? (
                                  <PaperIcon value={item.paper} size="sm" />
                                ) : null}
                                <p className="text-[9px] uppercase tracking-wide text-[var(--mn-text-muted)]">
                                  Paper
                                </p>
                              </div>
                              <p className="mt-1 text-[11px] font-bold text-[var(--mn-text)]">
                                {item.paper === "plain"
                                  ? `Plain${item.paperGsm ? ` — ${item.paperGsm} GSM` : ""}`
                                  : item.paper === "ruled"
                                    ? `Ruled${item.paperGsm ? ` — ${item.paperGsm} GSM` : ""}`
                                    : item.paper === "dotGrid"
                                      ? `Dot Grid${item.paperGsm ? ` — ${item.paperGsm} GSM` : ""}`
                                      : "Not recorded"}
                              </p>
                            </div>

                            <div className="rounded-lg bg-[var(--mn-surface)] px-2 py-2">
                              <div className="flex items-center gap-1.5">
                                {item.pages != null ? (
                                  <PagesIcon pages={item.pages as 100 | 150 | 200} size="sm" />
                                ) : null}
                                <p className="text-[9px] uppercase tracking-wide text-[var(--mn-text-muted)]">
                                  Pages
                                </p>
                              </div>
                              <p className="mt-1 text-[11px] font-bold text-[var(--mn-text)]">
                                {item.pages != null
                                  ? `${item.pages} pages`
                                  : "Not recorded"}
                              </p>
                            </div>
                          </div>

                          {item.customCoverId ? (
                            <div className="mt-2 rounded-lg border border-[var(--mn-accent)]/20 bg-[var(--mn-accent-soft)] px-2.5 py-2">
                              <p className="text-[10px] font-bold text-[var(--mn-accent)]">
                                Custom cover attached
                              </p>

                              <p className="mt-0.5 break-all text-[10px] text-[var(--mn-text-secondary)]">
                                Customization ID: {item.customCoverId}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-[var(--mn-border-strong)] p-4 text-xs text-[var(--mn-text-secondary)]">
                  No order items were recorded.
                </div>
              )}
            </div>
          </section>
          ) : null}

          {/* PRODUCTION + CUSTOM COVER */}
          {activeSection === "production" ? (
          <section
            id="order-section-production"
            className="mt-3 scroll-mt-24 rounded-xl border border-[var(--mn-border)] p-3"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mn-text-muted)]">
                  Production
                </p>
                <h3 className="mt-0.5 text-sm font-bold text-[var(--mn-text)]">
                  Build, verify and prepare
                </h3>
              </div>

              <span className={`text-xs font-bold ${
                productionComplete
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-[var(--mn-text-secondary)]"
              }`}>
                {productionCompleted}/{productionItems.length} complete
              </span>
            </div>

            {customCover ? (
              <div className="mt-3 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-control-bg)] p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mn-text-muted)]">
                      Custom Cover
                    </p>
                    <p className="mt-0.5 text-sm font-bold capitalize text-[var(--mn-text)]">
                      {statusLabel(customCover.status)}
                    </p>
                  </div>

                </div>
              </div>
            ) : null}

            <div className="mt-3 space-y-1.5">
              {productionItems.map(({ field, label }, index) => {
                const checked = productionChecklist[field];

                return (
                  <button
                    key={field}
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void toggleProduction(field)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${
                      checked
                        ? "border-emerald-500/25 bg-emerald-500/5"
                        : "border-[var(--mn-border)] bg-[var(--mn-control-bg)] hover:border-[var(--mn-border-strong)]"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-black ${
                        checked
                          ? "bg-emerald-500 text-white"
                          : "border border-[var(--mn-border-strong)] text-[var(--mn-text-muted)]"
                      }`}
                    >
                      {checked ? "✓" : index + 1}
                    </span>

                    <span
                      className={`text-xs font-semibold ${
                        checked
                          ? "text-[var(--mn-text-secondary)] line-through"
                          : "text-[var(--mn-text)]"
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            {productionComplete ? (
              <div className="mt-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  Production complete ✓
                </p>
                <p className="mt-0.5 text-[10px] text-[var(--mn-text-secondary)]">
                  Ready for explicit Admin shipment preparation.
                </p>
              </div>
            ) : null}
          </section>
          ) : null}

          {/* SHIPPING */}
          {activeSection === "shipping" ? (
          <section
            id="order-section-shipping"
            className="mt-3 scroll-mt-24 rounded-xl border border-[var(--mn-border)] p-3"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mn-text-muted)]">
                  Shipping
                </p>
                <h3 className="mt-0.5 text-sm font-bold capitalize text-[var(--mn-text)]">
                  {statusLabel(shipment?.status)}
                </h3>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {!shipment && paymentStatus === "paid" && isProductionReady(orderStatus) ? (
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void createShipment()}
                    className="rounded-lg bg-[var(--mn-text)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--mn-text-inverse)] disabled:opacity-50"
                  >
                    {busy === "create-shipment" ? "Creating…" : "Create Shipment"}
                  </button>
                ) : null}

                {canSchedulePickup ? (
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void schedulePickup()}
                    className="rounded-lg bg-[var(--mn-accent)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--mn-accent-contrast)] disabled:opacity-50"
                  >
                    {busy === "schedule-pickup" ? "Scheduling…" : "Schedule Pickup"}
                  </button>
                ) : null}

                {canRefreshTracking ? (
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void refreshTracking()}
                    className="rounded-lg border border-[var(--mn-border)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--mn-text)] disabled:opacity-50"
                  >
                    {busy === "refresh-tracking" ? "Refreshing…" : "Refresh Tracking"}
                  </button>
                ) : null}
              </div>
            </div>

            {shipment ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Courier", shipment.courier_name || "Pending"],
                  ["AWB", shipment.awb || "Pending"],
                  [
                    "Charge",
                    shipment.shipping_charge != null
                      ? `₹${shipment.shipping_charge}`
                      : "Pending",
                  ],
                  ["Tracking", shipment.tracking_url ? "Available" : "Not available"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg bg-[var(--mn-control-bg)] p-2.5"
                  >
                    <p className="text-[10px] text-[var(--mn-text-muted)]">
                      {label}
                    </p>
                    <p className="mt-0.5 break-all text-xs font-semibold capitalize text-[var(--mn-text)]">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            {shipment?.tracking_url ? (
              <a
                href={shipment.tracking_url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex text-xs font-semibold text-[var(--mn-accent)] underline underline-offset-4"
              >
                Track shipment ↗
              </a>
            ) : null}

            <details className="mt-3">
              <summary className="cursor-pointer text-[11px] font-semibold text-[var(--mn-text-secondary)]">
                More fulfillment options
              </summary>

              <div className="mt-3">
                <FulfillmentForm
                  orderId={orderId}
                  shippingPartner={shippingPartner}
                  trackingId={trackingId}
                  trackingUrl={trackingUrl}
                  shippedAt={shippedAt}
                  deliveredAt={deliveredAt}
                />
              </div>
            </details>

            {message ? (
              <p className="mt-3 rounded-xl bg-[var(--mn-control-bg)] px-3 py-2 text-xs text-[var(--mn-text-secondary)]">
                {message}
              </p>
            ) : null}
          </section>
          ) : null}

          {/* ACTIVITY */}
          {activeSection === "timeline" ? (
          <section
            id="order-section-timeline"
            className="mt-3 scroll-mt-24 rounded-xl border border-[var(--mn-border)] p-3"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mn-text-muted)]">
                Activity
              </p>
              <h3 className="mt-0.5 text-sm font-bold text-[var(--mn-text)]">
                Admin audit timeline
              </h3>
            </div>

            {timeline.length > 0 ? (
              <div className="mt-3 space-y-2">
                {timeline.map((event) => (
                  <article
                    key={event.id}
                    className="rounded-xl border border-[var(--mn-border)] bg-[var(--mn-control-bg)] p-3"
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-bold text-[var(--mn-text)]">
                          {event.action.replaceAll("_", " ")}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[var(--mn-text-muted)]">
                          {event.source} · {event.entityType}
                        </p>
                      </div>

                      <time
                        dateTime={event.createdAt}
                        className="text-[10px] text-[var(--mn-text-muted)]"
                      >
                        {new Date(event.createdAt).toLocaleString("en-IN")}
                      </time>
                    </div>

                    {Object.keys(event.metadata).length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <span
                            key={key}
                            className="rounded-lg border border-[var(--mn-border)] bg-[var(--mn-surface)] px-2 py-1 text-[10px] text-[var(--mn-text-secondary)]"
                          >
                            <strong>{key.replaceAll("_", " ")}:</strong>{" "}
                            {typeof value === "string"
                              ? value
                              : JSON.stringify(value)}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-[var(--mn-border-strong)] p-4 text-xs text-[var(--mn-text-secondary)]">
                No recorded Admin activity for this order yet.
              </div>
            )}
          </section>
          ) : null}

        </div>
      </div>
      {productPreviewOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Ordered product preview"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setProductPreviewOpen(false);
            }
          }}
        >
          <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[24px] border border-[var(--mn-border)] bg-[var(--mn-surface)] shadow-2xl">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--mn-border)] px-4 py-3 sm:px-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--mn-accent)]">
                  Product Preview
                </p>
                <p className="mt-0.5 text-sm font-bold text-[var(--mn-text)]">
                  Catalog product ordered by the customer
                </p>
              </div>

              <button
                type="button"
                onClick={() => setProductPreviewOpen(false)}
                aria-label="Close product preview"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--mn-border)] text-[var(--mn-text-secondary)] transition hover:bg-[var(--mn-control-bg)] hover:text-[var(--mn-text)]"
              >
                ×
              </button>
            </div>

            <div className="min-h-0 overflow-y-auto p-3 sm:p-5">
              <div className="space-y-6">
                {items.map((item) => {
                  const catalogPages: NotebookFlipPage[] = [
                    {
                      id: "front",
                      label: "Front",
                      content: (
                        <div className="flex h-full w-full items-center justify-center bg-[var(--mn-surface)] p-5">
                          <img
                            src={item.image}
                            alt={`${item.name} — Front`}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      ),
                    },
                    {
                      id: "insideFront",
                      label: "Inside Front",
                      content: (
                        <div className="flex h-full w-full items-center justify-center bg-white p-8 text-center">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--mn-accent)]">
                              Inside Front
                            </p>
                            <p className="mt-2 text-sm font-semibold text-[var(--mn-text)]">
                              Product production artwork not yet attached
                            </p>
                            <p className="mt-1 text-[11px] text-[var(--mn-text-muted)]">
                              This order snapshot currently records the catalog image only.
                            </p>
                          </div>
                        </div>
                      ),
                    },
                    {
                      id: "insideBack",
                      label: "Inside Back",
                      content: (
                        <div className="flex h-full w-full items-center justify-center bg-white p-8 text-center">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--mn-accent)]">
                              Inside Back
                            </p>
                            <p className="mt-2 text-sm font-semibold text-[var(--mn-text)]">
                              Product production artwork not yet attached
                            </p>
                            <p className="mt-1 text-[11px] text-[var(--mn-text-muted)]">
                              This order snapshot currently records the catalog image only.
                            </p>
                          </div>
                        </div>
                      ),
                    },
                    {
                      id: "back",
                      label: "Back",
                      content: (
                        <div className="flex h-full w-full items-center justify-center bg-white p-8 text-center">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--mn-accent)]">
                              Back
                            </p>
                            <p className="mt-2 text-sm font-semibold text-[var(--mn-text)]">
                              Product production artwork not yet attached
                            </p>
                            <p className="mt-1 text-[11px] text-[var(--mn-text-muted)]">
                              This order snapshot currently records the catalog image only.
                            </p>
                          </div>
                        </div>
                      ),
                    },
                  ];

                  return (
                    <article
                      key={String(item.id)}
                      className="rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-control-bg)] p-3 sm:p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-[var(--mn-text)]">
                            {item.name}
                          </p>
                          <p className="mt-1 text-[11px] text-[var(--mn-text-secondary)]">
                            ₹{Number(item.price).toLocaleString("en-IN")} × {item.quantity}
                          </p>
                        </div>

                        <span className="rounded-full border border-[var(--mn-border)] bg-[var(--mn-surface)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[var(--mn-text-muted)]">
                          4-side preview
                        </span>
                      </div>

                      <NotebookPageFlip
                        pages={catalogPages}
                        aspectRatio="1 / 1.4142"
                        pageClassName="border border-[var(--mn-border)] shadow-xl"
                      />
                    </article>
                  );
                })}
              </div>

              <p className="mt-4 text-center text-[10px] text-[var(--mn-text-muted)]">
                Preview animation is presentation-only. It does not modify the
                immutable order data or production artwork.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {previewOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Custom cover production preview"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPreviewOpen(false);
            }
          }}
        >
          <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[24px] border border-[var(--mn-border)] bg-[var(--mn-surface)] shadow-2xl">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--mn-border)] px-4 py-3 sm:px-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--mn-accent)]">
                  Production Preview
                </p>
                <p className="mt-0.5 text-sm font-bold text-[var(--mn-text)]">
                  Approved artwork · 4 surfaces
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  aria-label="Close preview"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--mn-border)] text-[var(--mn-text-secondary)] transition hover:bg-[var(--mn-control-bg)] hover:text-[var(--mn-text)]"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-3.5 w-3.5"
                  >
                    <path
                      d="m7 7 10 10M17 7 7 17"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="min-h-0 overflow-y-auto p-3 sm:p-5">
              {(() => {
                const orderedSides = [
                  "front",
                  "insideFront",
                  "insideBack",
                  "back",
                ] as const;

                const productionPages: NotebookFlipPage[] = orderedSides
                  .map((side) => productionAssets.find((asset) => asset.side === side))
                  .filter(
                    (asset): asset is ProductionCoverAsset =>
                      Boolean(asset),
                  )
                  .map((asset) => ({
                    id: asset.side,
                    label: asset.label,
                    content: (
                      <div className="flex h-full w-full items-center justify-center bg-white p-3">
                        <a
                          href={asset.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block h-full w-full"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <img
                            src={asset.url}
                            alt={asset.label}
                            className="h-full w-full object-contain"
                          />
                        </a>
                      </div>
                    ),
                  }));

                return productionPages.length === 4 ? (
                  <NotebookPageFlip
                    pages={productionPages}
                    aspectRatio="1 / 1.4142"
                    pageClassName="border border-[var(--mn-border)] shadow-xl"
                  />
                ) : (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-center">
                    <p className="text-sm font-bold text-[var(--mn-text)]">
                      Production preview is incomplete.
                    </p>
                    <p className="mt-1 text-[11px] text-[var(--mn-text-muted)]">
                      All 4 immutable production surfaces are required.
                    </p>
                  </div>
                );
              })()}

              <p className="mt-3 text-center text-[10px] text-[var(--mn-text-muted)]">
                Immutable approved order snapshot · secure production assets
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
