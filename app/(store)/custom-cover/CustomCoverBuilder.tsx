/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
};

type Props = {
  product: Product | null;
  products: Product[];
  createYourOwn?: boolean;
};

type StartOption = "blank" | "page-no" | "existing";

export default function CustomCoverBuilder({
  product,
  products,
  createYourOwn = false,
}: Props) {
  const router = useRouter();

  const [selectedOption, setSelectedOption] = useState<StartOption | null>(
    product ? "existing" : null
  );
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    product?.id ?? null
  );
  const [pageCount, setPageCount] = useState("100");
  const [customPageCount, setCustomPageCount] = useState("");
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  if (!createYourOwn && product) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-6 py-12">
        <div className="w-full rounded-3xl border border-[var(--mn-border)] bg-[var(--mn-control-bg)] p-8 text-[var(--mn-text)] shadow-[var(--mn-shadow-lg)]">
          <p className="text-sm font-semibold text-[var(--mn-text)]/50">Customize</p>
          <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>
          <p className="mt-2 text-[var(--mn-text)]/60">
            Create a custom cover for this product.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/custom-cover?productId=${encodeURIComponent(product.id)}`
              )
            }
            className="mt-8 rounded-[1.25rem] bg-[var(--mn-accent)] px-5 py-3 font-semibold text-[var(--mn-accent-contrast)] transition hover:opacity-90"
          >
            Continue to Cover Editor →
          </button>
        </div>
      </div>
    );
  }

  const previewProducts = products.slice(0, 4);

  const selectedProduct =
    products.find((item) => item.id === selectedProductId) ?? null;

  const chooseOption = (option: StartOption) => {
    setSelectedOption(option);
    setError("");

    if (option === "existing") {
      setShowAllProducts(false);
    }
  };

  const chooseProduct = (productId: string) => {
    setSelectedProductId(productId);
    setError("");
  };

  const createCustomization = async () => {
    if (!selectedOption || creating) return;

    setCreating(true);
    setError("");

    try {
      const response = await fetch("/api/custom-cover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: selectedProductId,
          ...(selectedOption === "page-no"
            ? {
                pageCount:
                  pageCount === "custom"
                    ? Number(customPageCount) || 100
                    : Number(pageCount),
              }
            : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.customization?.id) {
        throw new Error(
          data?.error || "Unable to start your custom cover."
        );
      }

      router.push(`/custom-cover/${data.customization.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to start your custom cover."
      );
      setCreating(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[var(--mn-bg)] px-5 py-10 text-[var(--mn-text)]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold tracking-wide text-[var(--mn-text)]/45">
            ✨ Create Your Own
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Where do you want to start?
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--mn-text)]/55 sm:text-base">
            Choose one starting point. Nothing else is required here.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Blank Sheet */}
          <button
            type="button"
            onClick={() => chooseOption("blank")}
            className={`rounded-3xl border p-[var(--mn-space-card)] text-left transition ${
              selectedOption === "blank"
                ? "border-[var(--mn-accent)] bg-[var(--mn-accent-soft)]"
                : "border-[var(--mn-border)] bg-[var(--mn-control-bg)] hover:border-[var(--mn-border-strong)] hover:bg-[var(--mn-control-hover)]"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-[1.5rem] bg-[var(--mn-control-hover)] text-2xl">
              📄
            </div>
            <h2 className="mt-5 text-xl font-semibold">Blank Sheet</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--mn-text)]/50">
              Start completely from scratch.
            </p>
          </button>

          {/* Page No. */}
          <button
            type="button"
            onClick={() => chooseOption("page-no")}
            className={`rounded-3xl border p-[var(--mn-space-card)] text-left transition ${
              selectedOption === "page-no"
                ? "border-[var(--mn-accent)] bg-[var(--mn-accent-soft)]"
                : "border-[var(--mn-border)] bg-[var(--mn-control-bg)] hover:border-[var(--mn-border-strong)] hover:bg-[var(--mn-control-hover)]"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-[1.5rem] bg-[var(--mn-control-hover)] text-2xl">
              🔢
            </div>
            <h2 className="mt-5 text-xl font-semibold">Page No.</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--mn-text)]/50">
              Start with a page-number setup.
            </p>
          </button>

          {/* Existing Product */}
          <div
            className={`rounded-3xl border p-[var(--mn-space-card)] transition ${
              selectedOption === "existing"
                ? "border-[var(--mn-accent)] bg-[var(--mn-accent-soft)]"
                : "border-[var(--mn-border)] bg-[var(--mn-control-bg)]"
            }`}
          >
            <button
              type="button"
              onClick={() => chooseOption("existing")}
              className="w-full text-left"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.5rem] bg-[var(--mn-control-hover)] text-2xl">
                🎨
              </div>
              <h2 className="mt-5 text-xl font-semibold">
                Existing Product
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--mn-text)]/50">
                Customize one of our existing notebooks.
              </p>
            </button>

            <div className="mt-5 flex items-center gap-2">
              {previewProducts.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedOption("existing");
                    chooseProduct(item.id);
                  }}
                  className={`h-12 w-10 overflow-hidden rounded-lg border transition ${
                    selectedProductId === item.id
                      ? "border-[var(--mn-accent)]"
                      : "border-[var(--mn-border)] hover:border-[var(--mn-border-strong)]"
                  }`}
                  title={item.name}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-lg">
                      📓
                    </span>
                  )}
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  setSelectedOption("existing");
                  setShowAllProducts((value) => !value);
                }}
                className="ml-auto text-xs font-semibold text-[var(--mn-text)]/60 transition hover:text-[var(--mn-text)]"
              >
                {showAllProducts ? "Hide" : "View All"} →
              </button>
            </div>

            {showAllProducts && (
              <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">
                {products.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => chooseProduct(item.id)}
                    className={`flex w-full items-center gap-3 rounded-[1.25rem] border p-2 text-left transition ${
                      selectedProductId === item.id
                        ? "border-[var(--mn-accent)] bg-[var(--mn-accent-soft)]"
                        : "border-[var(--mn-border)] hover:bg-[var(--mn-control-hover)]"
                    }`}
                  >
                    <div className="h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-[var(--mn-control-hover)]">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center">
                          📓
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {item.name}
                      </p>
                      <p className="text-xs text-[var(--mn-text)]/40">
                        ₹{item.price}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedOption && (
          <section className="mt-8 rounded-3xl border border-[var(--mn-border)] bg-[var(--mn-control-bg)] p-[var(--mn-space-card)] sm:p-7 lg:p-8">
            {selectedOption === "page-no" && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--mn-text)]/35">
                  Page No.
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  Number of Pages
                </h2>
                <p className="mt-1 text-sm text-[var(--mn-text)]/50">
                  Choose how many numbered pages you want.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-4">
                  {["100", "150", "200", "custom"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPageCount(option)}
                      className={`rounded-[1.5rem] border px-4 py-4 text-left transition ${
                        pageCount === option
                          ? "border-[var(--mn-accent)] bg-[var(--mn-accent-soft)]"
                          : "border-[var(--mn-border)] bg-[var(--mn-control-bg)] hover:border-[var(--mn-border-strong)]"
                      }`}
                    >
                      <p className="font-semibold">
                        {option === "custom" ? "Custom" : `${option} Pages`}
                      </p>
                      {option === "custom" && (
                        <p className="mt-1 text-xs text-[var(--mn-text)]/40">
                          Enter your own count
                        </p>
                      )}
                    </button>
                  ))}
                </div>

                {pageCount === "custom" && (
                  <div className="mt-5 max-w-xs">
                    <label
                      htmlFor="custom-page-count"
                      className="mb-2 block text-sm font-semibold text-[var(--mn-text)]/70"
                    >
                      Custom page count
                    </label>
                    <input
                      id="custom-page-count"
                      type="number"
                      min="1"
                      value={customPageCount}
                      placeholder="Enter page count"
                      onChange={(event) =>
                        setCustomPageCount(event.target.value)
                      }
                      className="w-full rounded-[1.25rem] border border-[var(--mn-border)] bg-[var(--mn-control-hover)] px-4 py-3 text-[var(--mn-text)] outline-none transition placeholder:text-[var(--mn-text-muted)] focus:border-[var(--mn-border-strong)]"
                    />
                  </div>
                )}
              </div>
            )}

            {selectedOption === "page-no" && (
              <div className="my-6 border-t border-[var(--mn-border)]" />
            )}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--mn-text)]/35">
                Optional
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                Choose a product
              </h2>
              <p className="mt-1 text-sm text-[var(--mn-text)]/50">
                You can select one now or skip it and continue to the editor.
              </p>

              {selectedProduct && (
                <p className="mt-3 text-sm text-[var(--mn-text)]/80">
                  Selected:{" "}
                  <span className="font-semibold">
                    {selectedProduct.name}
                  </span>
                </p>
              )}
            </div>

            {selectedProductId && (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setSelectedProductId(null)}
                  className="rounded-[1.25rem] border border-[var(--mn-border)] px-4 py-2 text-sm font-semibold text-[var(--mn-text)]/65 transition hover:border-[var(--mn-border-strong)] hover:text-[var(--mn-text)]"
                >
                  Skip Product
                </button>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              {error && (
                <p className="mr-auto text-sm text-[var(--mn-danger)]">{error}</p>
              )}

              <button
                type="button"
                onClick={createCustomization}
                disabled={creating}
                className="rounded-[1.25rem] bg-[var(--mn-accent)] px-6 py-3 font-semibold text-[var(--mn-accent-contrast)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? "Starting..." : "Next →"}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
