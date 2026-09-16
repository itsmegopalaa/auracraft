"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";

type SearchProduct = {
  id: string;
  name: string;
  image?: string | null;
  price: number;
  category?: string | null;
};

type Props = {
  mobile?: boolean;
  onOpen?: () => void;
};

export default function SearchBox({ mobile = false, onOpen }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const closeSearch = () => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setLoading(false);
  };

  const openSearch = () => {
    onOpen?.();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSearch();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        panelRef.current &&
        !panelRef.current.contains(target)
      ) {
        closeSearch();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  useEffect(() => {
    const value = query.trim();

    if (!open || !value) {
      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/products/search?q=${encodeURIComponent(value)}`,
          {
            method: "GET",
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        const data = (await response.json()) as SearchProduct[];

        if (!controller.signal.aborted) {
          setResults(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        if (!controller.signal.aborted) {
          console.error("Search error:", error);
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, query]);

  return (
    <div
      className="relative"
      data-search-box
      data-mobile-search={mobile ? "true" : "false"}
    >
      {/* SEARCH TRIGGER */}
      <button
        type="button"
        onClick={openSearch}
        aria-label="Search products"
        aria-expanded={open}
        className="
          flex h-11 w-10 items-center justify-center
          rounded-full
          border border-[var(--mn-border)]
          bg-[var(--mn-control-bg)]
          text-[var(--mn-text-secondary)]
          shadow-[var(--mn-shadow-sm)]
          transition-all duration-200
          hover:border-[var(--mn-accent)]
          hover:bg-[var(--mn-accent-soft)]
          hover:text-[var(--mn-accent)]
          active:scale-95
        "
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-[18px] w-[18px]"
          aria-hidden="true"
        >
          <circle cx="10.8" cy="10.8" r="6.5" />
          <path
            d="m16 16 4 4"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* SEARCH MODAL */}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999]"
            role="presentation"
          >
          {/* BACKDROP */}
          <div
            className="
              absolute inset-0
              bg-[var(--mn-overlay)]
              backdrop-blur-md
            "
            aria-hidden="true"
          />

          {/* SEARCH PANEL */}
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Product search"
            className="
              absolute
              left-1/2
              top-[72px]
              z-[10000]
              w-[calc(100vw-24px)]
              max-w-[680px]
              -translate-x-1/2
              overflow-hidden
              rounded-[24px]
              border border-[var(--mn-border-strong)]
              bg-[var(--mn-surface)]
              shadow-[var(--mn-shadow-lg)]
            "
          >
            {/* SEARCH INPUT */}
            <div
              className="
                border-b border-[var(--mn-border)]
                bg-[var(--mn-control-bg)]
                p-3
                sm:p-4
              "
            >
              <div
                className="
                  flex items-center gap-3
                  rounded-2xl
                  border border-[var(--mn-border)]
                  bg-[var(--mn-bg)]
                  px-4 py-2
                  transition-colors
                  focus-within:border-[var(--mn-accent)]
                  focus-within:bg-[var(--mn-overlay)]
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5 shrink-0 text-[var(--mn-text-muted)]"
                  aria-hidden="true"
                >
                  <circle cx="10.8" cy="10.8" r="6.5" />
                  <path
                    d="m16 16 4 4"
                    strokeLinecap="round"
                  />
                </svg>

                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                  }}
                  placeholder="Search notebooks..."
                  autoComplete="off"
                  spellCheck={false}
                  className="
                    min-w-0 flex-1
                    bg-transparent
                    py-2
                    text-[16px]
                    font-medium
                    text-[var(--mn-text)]
                    outline-none
                    placeholder:text-[var(--mn-text-muted)]
                  "
                  aria-label="Search notebooks"
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setResults([]);
                      inputRef.current?.focus();
                    }}
                    aria-label="Clear search"
                    className="
                      flex h-8 w-8 shrink-0
                      items-center justify-center
                      rounded-full
                      text-[var(--mn-text-muted)]
                      transition-colors
                      hover:bg-[var(--mn-control-hover)]
                      hover:text-[var(--mn-text)]
                    "
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={closeSearch}
                  aria-label="Close search"
                  className="
                    flex h-8 w-8 shrink-0
                    items-center justify-center
                    rounded-full
                    border border-[var(--mn-border)]
                    text-[var(--mn-text-muted)]
                    transition-all
                    hover:border-[var(--mn-border-strong)]
                    hover:bg-[var(--mn-control-hover)]
                    hover:text-[var(--mn-text)]
                  "
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
            </div>

            {/* RESULTS */}
            <div
              className="
                max-h-[calc(100dvh-170px)]
                overflow-y-auto
                overscroll-contain
              "
            >
              {/* INITIAL */}
              {!query.trim() && (
                <div className="px-5 py-8 sm:px-6 sm:py-10">
                  <p
                    className="
                      text-[12px]
                      font-bold
                      uppercase
                      tracking-[0.25em]
                      text-[var(--mn-accent)]
                    "
                  >
                    Quick Search
                  </p>

                  <p className="mt-3 text-sm text-[var(--mn-text-secondary)]">
                    Find the notebook that matches your personality.
                  </p>
                </div>
              )}

              {/* LOADING */}
              {query.trim() && loading && (
                <div className="flex items-center gap-3 px-5 py-8 sm:px-6">
                  <span
                    className="
                      h-4 w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-[var(--mn-border-strong)]
                      border-t-[var(--mn-accent)]
                    "
                  />

                  <span className="text-sm text-[var(--mn-text-secondary)]">
                    Searching notebooks...
                  </span>
                </div>
              )}

              {/* RESULTS */}
              {query.trim() &&
                !loading &&
                results.length > 0 && (
                  <div className="p-2 sm:p-3">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        onClick={closeSearch}
                        className="
                          group
                          flex items-center gap-4
                          rounded-2xl
                          px-3 py-3
                          transition-colors
                          hover:bg-[var(--mn-control-bg)]
                        "
                      >
                        <div
                          className="
                            relative h-14 w-14 shrink-0
                            overflow-hidden
                            rounded-xl
                            border border-[var(--mn-border)]
                            bg-[var(--mn-surface-soft)]
                          "
                        >
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-[var(--mn-text-muted)]">
                              —
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className="
                              truncate text-sm font-semibold
                              text-[var(--mn-text)]
                              transition-colors
                              group-hover:text-[var(--mn-accent)]
                            "
                          >
                            {product.name}
                          </p>

                          {product.category && (
                            <p className="mt-1 truncate text-[12px] text-[var(--mn-text-secondary)]">
                              {product.category}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0 text-sm font-semibold text-[var(--mn-text-secondary)]">
                          ₹{product.price}
                        </div>

                        <span
                          className="
                            shrink-0
                            text-[var(--mn-text-muted)]
                            transition-all
                            group-hover:translate-x-1
                            group-hover:text-[var(--mn-accent)]
                          "
                          aria-hidden="true"
                        >
                          →
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

              {/* NO RESULTS */}
              {query.trim() &&
                !loading &&
                results.length === 0 && (
                  <div className="px-6 py-10 text-center">
                    <p className="text-sm font-semibold text-[var(--mn-text-secondary)]">
                      No notebook found
                    </p>

                    <p className="mt-1 text-[12px] text-[var(--mn-text-secondary)]">
                      Try another name or category.
                    </p>
                  </div>
                )}
            </div>
          </div>
          </div>,
          document.body
        )}
    </div>
  );
}
