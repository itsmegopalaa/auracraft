"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/app/components/Footer";
import {
  OrientationIcon,
  PaperIcon,
  PagesIcon,
  SizeIcon,
} from "@/app/components/PhysicalConfigVisuals";

type StartOption = "blank" | "existing";
type Size = "A4" | "A5";
type Orientation = "portrait" | "landscape";
type Paper = "plain" | "ruled" | "dotGrid";

type Product = {
  id: string;
  name?: string;
  title?: string;
  price?: number;
  image?: string;
  image_url?: string;
};

type Props = {
  product?: Product | null;
  products?: Product[];
  createYourOwn?: boolean;
};

const START_OPTIONS = [
  {
    id: "blank" as const,
    title: "Blank Sheet",
    description: "Start completely from scratch.",
  },
  {
    id: "existing" as const,
    title: "Existing Product",
    description: "Customize a notebook from our catalogue.",
  },
];

const SIZES = [
  {
    id: "A4" as const,
    title: "A4",
    meta: "210 × 297 mm",
    badge: "Recommended",
  },
  {
    id: "A5" as const,
    title: "A5",
    meta: "148 × 210 mm",
  },
];

const ORIENTATIONS = [
  {
    id: "portrait" as const,
    title: "Portrait",
    description: "Standard upright notebook format",
  },
  {
    id: "landscape" as const,
    title: "Landscape",
    description: "Wide horizontal notebook format",
  },
];

const PAGES = [100, 150, 200] as const;

const PAPERS = [
  {
    id: "plain" as const,
    title: "Plain",
    description: "Clean blank pages",
  },
  {
    id: "ruled" as const,
    title: "Ruled",
    description: "Classic writing lines",
  },
  {
    id: "dotGrid" as const,
    title: "Dot Grid",
    description: "Flexible creative layout",
  },
];

export default function CustomCoverBuilder({
  product,
  products = [],
}: Props) {
  const router = useRouter();
  const productScrollRef = useRef<HTMLDivElement | null>(null);

  const [selectedOption, setSelectedOption] = useState<StartOption>(
    product ? "existing" : "blank"
  );

  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    product?.id ?? null
  );

  const [size, setSize] = useState<Size>("A4");
  const [orientation, setOrientation] =
    useState<Orientation>("portrait");
  const [pageCount, setPageCount] = useState(100);
  const [paper, setPaper] = useState<Paper>("plain");
  const [quantity, setQuantity] = useState(1);
  const [bulkOrder, setBulkOrder] = useState(false);
  const [bulkQuantity, setBulkQuantity] = useState("10");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const selectedProduct = useMemo(
    () =>
      products.find((item) => item.id === selectedProductId) ??
      product ??
      null,
    [products, selectedProductId, product]
  );

  const productName =
    selectedProduct?.name ?? selectedProduct?.title ?? "Blank notebook";

  const scrollProducts = (direction: "left" | "right") => {
    const container = productScrollRef.current;

    if (!container) return;

    container.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  const handleProductSelect = (item: Product) => {
    setSelectedProductId(item.id);
    setSelectedOption("existing");
  };

  const handleContinue = async () => {
    setCreating(true);
    setError("");

    try {
      const quantityValue = bulkOrder
        ? Math.max(2, Number(bulkQuantity) || 2)
        : quantity;

      // Resume the customer's unfinished custom-cover draft.
      // This prevents Setup -> Editor -> Back -> Setup -> Editor
      // from silently creating a second customization.
      const existingDraftId = window.localStorage.getItem(
        "minenote-custom-cover-draft-id",
      );

      if (existingDraftId) {
        const draftResponse = await fetch(
          `/api/custom-cover/${existingDraftId}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const draftText = await draftResponse.text();

        let draftData: any = {};

        try {
          draftData = draftText ? JSON.parse(draftText) : {};
        } catch {
          draftData = {};
        }

        const draft = draftData?.customization;

        // An unfinished custom-cover project is resumable until the
        // customer explicitly deletes it or completes the cart flow.
        // Do not invalidate the project just because Setup values changed.
        if (draft?.status === "draft") {
          router.push(`/custom-cover/${existingDraftId}`);
          return;
        }

        // Only clear the resume pointer when the saved project is no
        // longer an active draft.
        window.localStorage.removeItem(
          "minenote-custom-cover-draft-id",
        );
      }

      const response = await fetch("/api/custom-cover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: selectedProductId,
          creationMethod: "upload",
          size,
          pages: pageCount,
          paper,
          orientation,
          quantity: quantityValue,
          bulkOrder,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.customization?.id) {
        throw new Error(
          data?.error || "Unable to create your customization."
        );
      }

      const customizationId = data.customization.id;

      window.localStorage.setItem(
        "minenote-custom-cover-draft-id",
        customizationId,
      );

      router.push(`/custom-cover/${customizationId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--mn-bg)] text-[var(--mn-text)]">
      <div className="mn-container-wide mx-auto px-5 py-10 sm:px-6 lg:py-13">
        {/* 01 */}
        <section>
          <SectionHeading number="01" title="Start with" />

          <p className="mb-5 text-sm text-[var(--mn-text-secondary)]">
            Start fresh or personalize an existing notebook.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {START_OPTIONS.map((option) => {
              const active = selectedOption === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setSelectedOption(option.id);

                    if (option.id === "blank") {
                      setSelectedProductId(null);
                    }
                  }}
                  className={[
                    "mn-transition rounded-2xl border p-5 text-left",
                    active
                      ? "border-[var(--mn-accent)] bg-[var(--mn-accent-soft)] shadow-[var(--mn-shadow-sm)]"
                      : "border-[var(--mn-border)] bg-[var(--mn-surface)] hover:border-[var(--mn-border-strong)]",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold">
                        {option.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-[var(--mn-text-secondary)]">
                        {option.description}
                      </p>
                    </div>

                    {active && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--mn-accent)] text-xs text-white">
                        ✓
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 02 */}
        <section className="mt-12 border-t border-[var(--mn-border)] pt-12">
          <SectionHeading number="02" title="Notebook Format" />

          <p className="mb-6 text-sm text-[var(--mn-text-secondary)]">
            Choose the notebook you want to create and its physical format.
          </p>

          {/* Existing product catalogue */}
          <div>
            <div className="mb-3 flex items-center justify-between gap-4">
              <Label>Product</Label>

              {products.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => scrollProducts("left")}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--mn-border)] bg-[var(--mn-surface)] text-sm transition hover:border-[var(--mn-border-strong)] hover:bg-[var(--mn-surface-soft)]"
                    aria-label="Scroll products left"
                  >
                    ←
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollProducts("right")}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--mn-border)] bg-[var(--mn-surface)] text-sm transition hover:border-[var(--mn-border-strong)] hover:bg-[var(--mn-surface-soft)]"
                    aria-label="Scroll products right"
                  >
                    →
                  </button>
                </div>
              )}
            </div>

            {products.length > 0 ? (
              <div
                ref={productScrollRef}
                className="flex gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {products.map((item) => {
                  const active = selectedProductId === item.id;
                  const itemName = item.name ?? item.title ?? "Notebook";
                  const image = item.image_url ?? item.image;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleProductSelect(item)}
                      className={[
                        "mn-transition min-w-[180px] shrink-0 rounded-2xl border p-3 text-left",
                        active
                          ? "border-[var(--mn-accent)] bg-[var(--mn-accent-soft)] shadow-[var(--mn-shadow-sm)]"
                          : "border-[var(--mn-border)] bg-[var(--mn-surface)] hover:border-[var(--mn-border-strong)]",
                      ].join(" ")}
                    >
                      <div className="h-[105px] overflow-hidden rounded-lg bg-[var(--mn-surface-soft)] sm:h-[110px]">
                        {image ? (
                          <img
                            src={image}
                            alt={itemName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-[var(--mn-text-muted)]">
                            MineNote
                          </div>
                        )}
                      </div>

                      <div className="mt-2 flex items-start justify-between gap-1.5">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold sm:text-sm">
                            {itemName}
                          </p>

                          {typeof item.price === "number" && (
                            <p className="mt-0.5 text-[11px] text-[var(--mn-text-secondary)]">
                              ₹{item.price}
                            </p>
                          )}
                        </div>

                        {active && (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--mn-accent)] text-[10px] text-white">
                            ✓
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-5 text-sm text-[var(--mn-text-secondary)]">
                Blank notebook
              </div>
            )}
          </div>

          {/* Size */}
          <div className="mt-8">
            <Label>Size</Label>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {SIZES.map((item) => {
                const active = size === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSize(item.id)}
                    className={[
                      "mn-transition rounded-2xl border p-4 text-left",
                      active
                        ? "border-[var(--mn-accent)] bg-[var(--mn-accent-soft)] shadow-[var(--mn-shadow-sm)]"
                        : "border-[var(--mn-border)] bg-[var(--mn-surface)] hover:border-[var(--mn-border-strong)]",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <SizeIcon value={item.id} size="md" />

                        <div>
                          <p className="font-semibold">{item.title}</p>
                          <p className="mt-0.5 text-[11px] text-[var(--mn-text-secondary)]">
                            {item.meta}
                          </p>
                        </div>
                      </div>

                      {item.badge && (
                        <span className="rounded-full bg-[var(--mn-accent-soft)] px-2.5 py-1 text-[10px] font-semibold text-[var(--mn-accent)]">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orientation */}
          <div className="mt-8">
            <Label>Orientation</Label>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {ORIENTATIONS.map((item) => {
                const active = orientation === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setOrientation(item.id)}
                    className={[
                      "mn-transition rounded-2xl border p-4 text-left",
                      active
                        ? "border-[var(--mn-accent)] bg-[var(--mn-accent-soft)] shadow-[var(--mn-shadow-sm)]"
                        : "border-[var(--mn-border)] bg-[var(--mn-surface)] hover:border-[var(--mn-border-strong)]",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <OrientationIcon value={item.id} size="md" />

                      <div>
                        <p className="text-sm font-semibold">
                          {item.title}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[var(--mn-text-secondary)]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pages */}
          <div className="mt-8">
            <Label>Pages</Label>

            <div className="mt-3 grid grid-cols-3 gap-3">
              {PAGES.map((pages) => {
                const active = pageCount === pages;

                return (
                  <button
                    key={pages}
                    type="button"
                    onClick={() => setPageCount(pages)}
                    className={[
                      "mn-transition rounded-xl border px-4 py-3 text-sm font-semibold",
                      active
                        ? "border-[var(--mn-accent)] bg-[var(--mn-accent-soft)]"
                        : "border-[var(--mn-border)] bg-[var(--mn-surface)] hover:border-[var(--mn-border-strong)]",
                    ].join(" ")}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <PagesIcon pages={pages} size="sm" />
                      <span>{pages}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Paper */}
          <div className="mt-8">
            <Label>Paper</Label>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {PAPERS.map((item) => {
                const active = paper === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPaper(item.id)}
                    className={[
                      "mn-transition rounded-2xl border p-4 text-left",
                      active
                        ? "border-[var(--mn-accent)] bg-[var(--mn-accent-soft)] shadow-[var(--mn-shadow-sm)]"
                        : "border-[var(--mn-border)] bg-[var(--mn-surface)] hover:border-[var(--mn-border-strong)]",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <PaperIcon value={item.id} size="md" />

                      <div>
                        <p className="text-sm font-semibold">{item.title}</p>

                        <p className="mt-1 text-xs leading-5 text-[var(--mn-text-secondary)]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 03 */}
        <section className="mt-12 border-t border-[var(--mn-border)] pt-12">
          <SectionHeading number="03" title="Quantity" />

          <p className="mb-5 text-sm text-[var(--mn-text-secondary)]">
            How many copies do you need?
          </p>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {!bulkOrder ? (
                <div className="inline-flex items-center overflow-hidden rounded-xl border border-[var(--mn-border)] bg-[var(--mn-surface)]">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((value) => Math.max(1, value - 1))
                    }
                    className="h-11 w-11 text-lg hover:bg-[var(--mn-surface-soft)]"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <span className="flex h-11 min-w-12 items-center justify-center border-x border-[var(--mn-border)] text-sm font-semibold">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => setQuantity((value) => value + 1)}
                    className="h-11 w-11 text-lg hover:bg-[var(--mn-surface-soft)]"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              ) : (
                <input
                  id="bulk-quantity"
                  type="number"
                  min={2}
                  step={1}
                  inputMode="numeric"
                  value={bulkQuantity}
                  onChange={(event) =>
                    setBulkQuantity(
                      event.target.value.replace(/[^0-9]/g, "")
                    )
                  }
                  onBlur={() => {
                    const value = Number(bulkQuantity);

                    if (!Number.isFinite(value) || value < 2) {
                      setBulkQuantity("2");
                    }
                  }}
                  className="h-11 w-32 rounded-xl border border-[var(--mn-border-strong)] bg-[var(--mn-surface)] px-4 text-sm font-semibold outline-none focus:border-[var(--mn-accent)]"
                  aria-label="Bulk order quantity"
                />
              )}
            </div>

            <label className="flex h-11 w-fit cursor-pointer items-center gap-3 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-surface)] px-4">
              <input
                type="checkbox"
                checked={bulkOrder}
                onChange={(event) => {
                  const checked = event.target.checked;

                  setBulkOrder(checked);

                  if (checked) {
                    setBulkQuantity(String(Math.max(2, quantity)));
                  } else {
                    setQuantity(1);
                  }
                }}
                className="h-4 w-4"
              />

              <span className="text-sm font-semibold">
                📦 Bulk Order
              </span>

              <span className="text-xs text-[var(--mn-text-muted)]">
                For multiple copies
              </span>
            </label>
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-5 shadow-[var(--mn-shadow-sm)] sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mn-text-muted)]">
            Your notebook
          </p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{productName}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--mn-border)] bg-[var(--mn-control-bg)] px-2.5 py-1.5 text-xs font-semibold">
                  <SizeIcon value={size} size="sm" />
                  {size}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--mn-border)] bg-[var(--mn-control-bg)] px-2.5 py-1.5 text-xs font-semibold">
                  <OrientationIcon value={orientation} size="sm" />
                  {orientation === "portrait" ? "Portrait" : "Landscape"}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--mn-border)] bg-[var(--mn-control-bg)] px-2.5 py-1.5 text-xs font-semibold">
                  <PagesIcon pages={pageCount as 100 | 150 | 200} size="sm" />
                  {pageCount} pages
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--mn-border)] bg-[var(--mn-control-bg)] px-2.5 py-1.5 text-xs font-semibold">
                  <PaperIcon value={paper} size="sm" />
                  {PAPERS.find((item) => item.id === paper)?.title} · 80 GSM
                </span>

                <span className="text-xs text-[var(--mn-text-muted)]">
                  · {bulkOrder ? Math.max(2, Number(bulkQuantity) || 2) : quantity}{" "}
                  {bulkOrder
                    ? Math.max(2, Number(bulkQuantity) || 2) === 1
                      ? "copy"
                      : "copies"
                    : quantity === 1
                      ? "copy"
                      : "copies"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={creating}
              className="mn-transition rounded-xl bg-[var(--mn-text)] px-6 py-3 text-sm font-semibold text-[var(--mn-text-inverse)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? "Preparing…" : "Continue to Editor →"}
            </button>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-[var(--mn-danger)]/10 px-3 py-2 text-sm text-[var(--mn-danger)]">
              {error}
            </p>
          )}
        </section>

        {/* HOW IT WORKS */}
        <section className="mt-12 border-t border-[var(--mn-border)] pt-10">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mn-text-muted)]">
            How it works
          </p>

          <div className="grid gap-4 sm:grid-cols-4">
            {[
              ["01", "Choose"],
              ["02", "Create"],
              ["03", "Preview"],
              ["04", "We make it"],
            ].map(([number, title]) => (
              <div key={number} className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[var(--mn-accent)]">
                  {number}
                </span>

                <span className="text-sm font-medium">{title}</span>
              </div>
            ))}
          </div>
        </section>

        {/* PRIVACY */}
        <section className="mt-10 flex items-center gap-3 border-t border-[var(--mn-border)] pt-7 text-sm text-[var(--mn-text-secondary)]">
          <span>🔒</span>
          <span>
            <strong className="font-medium text-[var(--mn-text)]">
              Private by default
            </strong>{" "}
            · Your creation stays private unless you choose to share it.
          </span>
        </section>
      </div>



        {!selectedProduct && (
          <section className="mx-auto mt-14 max-w-6xl border-t border-[var(--mn-border)] px-5 pt-14 sm:px-6 lg:mt-18 lg:pt-18">
            <div className="mb-10 max-w-4xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full border border-[var(--mn-accent)]/20 bg-[var(--mn-accent-soft)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--mn-accent)]">
                  ✨ Custom Creation Studio
                </span>
                <span className="inline-flex rounded-full border border-[var(--mn-border)] bg-[var(--mn-control-bg)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--mn-text-secondary)]">
                  Create Your Own
                </span>
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                Create something{" "}
                <span className="text-[var(--mn-accent)]">original.</span>
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--mn-text-secondary)] sm:text-lg sm:leading-8">
                Start with a blank idea, choose your physical notebook, and create a cover that does not have to look like anything else in our catalogue.
              </p>
            </div>

            <div className="rounded-[2rem] border border-[var(--mn-accent)]/20 bg-[var(--mn-accent-soft)] p-5 sm:p-7">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--mn-accent)]">
                🔥 Your design. Your rules.
              </p>

              <h2 className="mt-2 text-xl font-black text-[var(--mn-text)] sm:text-2xl">
                Nothing from the catalogue is required.
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--mn-text-secondary)]">
                The catalogue only contains ready-made products. Your custom creation remains private unless you explicitly give MineNote permission to publish it.
              </p>

              <div className="mt-10 border-t border-[var(--mn-border)] pt-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mn-accent)]">
                  MineNote · Custom Creation Studio
                </p>

                <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
                  Create something that’s yours.
                </h2>

                <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--mn-text-secondary)] sm:text-lg">
                  Build a notebook around your ideas, identity and imagination.
                </p>
              </div>
            </div>
          </section>
        )}
      <Footer />
    </main>
  );
}

function SectionHeading({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="mb-2 flex items-baseline gap-3">
      <span className="text-[11px] font-semibold tracking-[0.12em] text-[var(--mn-accent)]">
        {number}
      </span>

      <h2 className="font-[var(--mn-font-display)] text-[clamp(1.45rem,2.2vw,2rem)] font-semibold leading-tight tracking-[-0.025em]">
        {title}
      </h2>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold tracking-[-0.01em]">
      {children}
    </h3>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--mn-text-muted)]">
        {title}
      </h3>

      <nav className="mt-3 flex flex-col gap-2.5">
        {links.map(([label, href]) => (
          <a
            key={href}
            href={href}
            className="text-sm text-[var(--mn-text-secondary)] transition hover:text-[var(--mn-text)]"
          >
            {label}
          </a>
        ))}
      </nav>
    </div>
  );
}
