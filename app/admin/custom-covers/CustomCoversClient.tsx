 "use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type CoverSide =
  | "front"
  | "insideFront"
  | "insideBack"
  | "back";

type Artwork = {
  side: CoverSide;
  asset: {
    id: string;
    kind: string;
    width: number | null;
    height: number | null;
    mimeType: string;
    url: string | null;
  } | null;
};

type CustomCover = {
  id: string;
  customerId: string | null;
  productId: string | number | null;
  creationMethod: string;
  status: string;
  version: number;
  customerName: string;
  customerText: string | null;
  physicalConfig: {
    size?: string;
    pages?: number;
    paper?: string;
    orientation?: string;
    quantity?: number;
  };
  customerApprovedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string | number;
    name: string;
    image: string | null;
    active: boolean;
  } | null;
  order: {
    id: string;
    orderId: string;
    name: string;
    email: string;
    phone: string;
    total: number;
    paymentStatus: string;
    orderStatus: string;
    createdAt: string;
  } | null;
  artwork: Artwork[];
  artworkComplete: boolean;
};

type Props = {
  items: CustomCover[];
  summary: {
    total: number;
    customerApproved: number;
  };
};

const SIDES: CoverSide[] = [
  "front",
  "insideFront",
  "insideBack",
  "back",
];

const SIDE_LABELS: Record<CoverSide, string> = {
  front: "Front",
  insideFront: "Inside Front",
  insideBack: "Inside Back",
  back: "Back",
};

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function statusClass(status: string) {
  if (status === "customer_approved") {
    return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";
  }

  return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";
}

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function CustomCoversClient({
  items: initialItems,
  summary: initialSummary,
}: Props) {
  const [items, setItems] = useState(initialItems);
  const [summary, setSummary] = useState(initialSummary);
  const [filter, setFilter] = useState<
    "all" | "customer_approved"
  >("customer_approved");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return items.filter((item) => {
      if (filter !== "all" && item.status !== filter) {
        return false;
      }

      if (!needle) return true;

      return [
        item.id,
        item.customerName,
        item.order?.orderId,
        item.order?.email,
        item.order?.phone,
        item.product?.name,
        item.creationMethod,
        item.status,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(needle),
        );
    });
  }, [filter, items, search]);

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
              MineNote • Production
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Custom Covers
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              Monitor customer-approved artwork, production readiness, and
              order linkage. Customer approval is the normal release point;
              Admin handles operational exceptions rather than routine cover
              approval.
            </p>
          </div>

          <Link
            href="/admin/production-batches"
            className="w-fit rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
          >
            ← Production
          </Link>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Customer approved", summary.customerApproved, "customer_approved"],
            ["Production ready", items.filter(
              (item) =>
                item.status === "customer_approved" && item.artworkComplete,
            ).length, "customer_approved"],
            ["All", summary.total, "all"],
          ].map(([label, value, key]) => (
            <button
              key={label}
              type="button"
              onClick={() =>
                setFilter(key as "all" | "customer_approved")
              }
              className={`rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm dark:bg-zinc-900 ${
                filter === key
                  ? "border-zinc-900 dark:border-zinc-100"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {label}
              </p>
              <p className="mt-2 text-2xl font-bold">{value}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search customer, order, product or customization ID…"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
          />
        </div>

        <div className="mt-5 space-y-4">
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="font-semibold">No custom covers found</p>
              <p className="mt-1 text-sm text-zinc-500">
                Try another status filter or search term.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isOpen = expanded === item.id;

              return (
                <section
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded(isOpen ? null : item.id)
                    }
                    className="block w-full p-5 text-left sm:p-6"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${statusClass(
                              item.status,
                            )}`}
                          >
                            {statusLabel(item.status)}
                          </span>

                          <span className="text-xs text-zinc-400">
                            {item.creationMethod}
                          </span>
                        </div>

                        <h2 className="mt-3 text-lg font-bold">
                          {item.customerName}
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                          {item.product?.name || "Product unavailable"}
                          {" • "}
                          {item.physicalConfig.pages
                            ? `${item.physicalConfig.pages} pages`
                            : "Pages unavailable"}
                          {" • "}
                          Qty {item.physicalConfig.quantity ?? 1}
                        </p>

                        <p className="mt-1 text-xs text-zinc-400">
                          {item.order?.orderId
                            ? `Order ${item.order.orderId}`
                            : `Customization ${item.id}`}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {item.order?.orderId ? (
                          <Link
                            href={`/admin/orders/${item.order.orderId}`}
                            onClick={(event) => event.stopPropagation()}
                            className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold hover:border-zinc-400 dark:border-zinc-800"
                          >
                            View order
                          </Link>
                        ) : null}

                        <span className="rounded-xl bg-zinc-100 px-3 py-2 text-xs font-semibold dark:bg-zinc-800">
                          {isOpen ? "Close" : "Inspect"}
                        </span>
                      </div>
                    </div>
                  </button>

                  {isOpen ? (
                    <div className="border-t border-zinc-200 p-5 dark:border-zinc-800 sm:p-6">
                      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                        <div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {SIDES.map((side) => {
                              const artwork = item.artwork.find(
                                (candidate) =>
                                  candidate.side === side,
                              );

                              return (
                                <div
                                  key={side}
                                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
                                >
                                  <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
                                    <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                                      {SIDE_LABELS[side]}
                                    </span>

                                    {artwork?.asset ? (
                                      <span className="text-[10px] font-semibold text-emerald-600">
                                        Available
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-semibold text-red-500">
                                        Missing
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex min-h-72 items-center justify-center p-3">
                                    {artwork?.asset?.url ? (
                                      <img
                                        src={artwork.asset.url}
                                        alt={`${SIDE_LABELS[side]} custom cover`}
                                        className="max-h-80 w-full rounded-xl object-contain"
                                      />
                                    ) : (
                                      <div className="text-center">
                                        <p className="text-sm font-semibold text-red-500">
                                          Artwork unavailable
                                        </p>
                                        <p className="mt-1 text-xs text-zinc-500">
                                          This surface cannot be reviewed.
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="mt-5 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
                            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                              Customer text
                            </p>
                            <p className="mt-2 text-sm leading-6">
                              {item.customerText || "No customer text"}
                            </p>
                          </div>
                        </div>

                        <aside className="space-y-4">
                          <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                              Review information
                            </p>

                            <dl className="mt-4 space-y-3 text-sm">
                              <div>
                                <dt className="text-zinc-400">Customer</dt>
                                <dd className="font-semibold">
                                  {item.order?.name || item.customerName}
                                </dd>
                              </div>

                              <div>
                                <dt className="text-zinc-400">Email</dt>
                                <dd className="break-all">
                                  {item.order?.email || "—"}
                                </dd>
                              </div>

                              <div>
                                <dt className="text-zinc-400">Order</dt>
                                <dd className="font-semibold">
                                  {item.order?.orderId || "Not ordered"}
                                </dd>
                              </div>

                              <div>
                                <dt className="text-zinc-400">Physical config</dt>
                                <dd>
                                  {item.physicalConfig.size || "A4"} •{" "}
                                  {item.physicalConfig.pages || "—"} pages •{" "}
                                  Qty {item.physicalConfig.quantity || 1}
                                </dd>
                              </div>

                              <div>
                                <dt className="text-zinc-400">Artwork</dt>
                                <dd
                                  className={
                                    item.artworkComplete
                                      ? "font-semibold text-emerald-600"
                                      : "font-semibold text-red-500"
                                  }
                                >
                                  {item.artworkComplete
                                    ? "4/4 surfaces available"
                                    : "Incomplete"}
                                </dd>
                              </div>

                              <div>
                                <dt className="text-zinc-400">Last updated</dt>
                                <dd>{formatDate(item.updatedAt)}</dd>
                              </div>
                            </dl>
                          </div>

                          {item.rejectionReason ? (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
                              <p className="text-xs font-bold uppercase tracking-wide text-red-500">
                                Rejection reason
                              </p>
                              <p className="mt-2 text-sm leading-6 text-red-700 dark:text-red-300">
                                {item.rejectionReason}
                              </p>
                            </div>
                          ) : null}

                          {item.status === "approved_for_print" ? (
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                ✅ Approved for print
                              </p>
                              <p className="mt-1 text-xs leading-5 text-emerald-700/80 dark:text-emerald-300/80">
                                Admin approval recorded. Production can use
                                the immutable order snapshot.
                              </p>
                            </div>
                          ) : null}
                        </aside>
                      </div>
                    </div>
                  ) : null}
                </section>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
