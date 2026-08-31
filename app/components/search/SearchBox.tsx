"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function SearchBox({
  mobile = false,
  onOpen,
}: Props) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 80);

    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    const query = search.trim();

    if (!query) {
      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/products/search?q=${encodeURIComponent(query)}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Search request failed.");
        }

        const data = (await response.json()) as SearchProduct[];

        setResults(data);
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [search]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (
        containerRef.current &&
        !containerRef.current.contains(target)
      ) {
        setOpen(false);
        setSearch("");
        setResults([]);
      }
    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );
    };
  }, [open]);

  function closeSearch() {
    setOpen(false);
    setSearch("");
    setResults([]);
  }

  function handleOpen() {
    onOpen?.();
    setOpen(true);
  }

  function openProduct(productId: string) {
    closeSearch();
    router.push(`/products/${productId}`);
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onPointerDown={(event) => event.stopPropagation()}
    >
      {/* SEARCH BUTTON */}
      <button
        type="button"
        onClick={handleOpen}
        className="
          flex h-11 w-11 items-center justify-center
          rounded-full border border-zinc-800
          bg-zinc-950 text-lg text-zinc-300
          transition-all duration-200
          hover:border-yellow-400
          hover:bg-yellow-400/10
          hover:text-yellow-400
          active:scale-95
        "
        aria-label="Search products"
        aria-expanded={open}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-[18px] w-[18px]"
          aria-hidden="true"
        >
          <circle cx="10.8" cy="10.8" r="6.6" />
          <path
            d="m16 16 4 4"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <>
          {/* BACKDROP */}
          <button
            type="button"
            aria-label="Close search"
            onClick={closeSearch}
            className="
              fixed inset-0
              z-[90]
              cursor-default
              bg-black/60
              backdrop-blur-sm
            "
          />

          {/* SEARCH PANEL */}
          <div
            className={[
              "fixed left-1/2 -translate-x-1/2",
              mobile
                ? "top-[76px] z-[100]"
                : "top-20 z-[100]",
              "w-[calc(100vw-2rem)] max-w-2xl",
              "overflow-hidden rounded-3xl",
              "border border-zinc-800",
              "bg-zinc-950",
              "shadow-2xl shadow-black/50",
            ].join(" ")}
            onPointerDown={(event) =>
              event.stopPropagation()
            }
          >
            {/* SEARCH INPUT */}
            <div className="border-b border-zinc-800 p-4">
              <div className="flex items-center gap-3">
                <span
                  className="text-lg text-zinc-500"
                  aria-hidden="true"
                >
                  🔍
                </span>

                <input
                  ref={inputRef}
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      results.length > 0
                    ) {
                      openProduct(results[0].id);
                    }

                    if (event.key === "Escape") {
                      closeSearch();
                    }
                  }}
                  placeholder="Search notebooks..."
                  className="
                    min-w-0 flex-1
                    bg-transparent
                    py-2
                    text-base
                    text-white
                    placeholder:text-zinc-500
                    outline-none
                  "
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setResults([]);
                    }}
                    className="
                      shrink-0
                      text-sm
                      text-zinc-500
                      transition
                      hover:text-white
                    "
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* RESULTS */}
            {search.trim() ? (
              <div className="max-h-[60vh] overflow-y-auto p-3">
                {loading ? (
                  <div className="flex items-center gap-3 rounded-2xl px-4 py-5 text-sm text-zinc-400">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-yellow-400" />
                    Searching notebooks...
                  </div>
                ) : results.length > 0 ? (
                  <div className="space-y-1">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        onClick={closeSearch}
                        className="
                          group
                          flex items-center gap-4
                          rounded-2xl p-3
                          transition-colors
                          hover:bg-zinc-900
                          active:bg-zinc-800
                        "
                      >
                        <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt=""
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-zinc-600">
                              📖
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-zinc-100">
                            {product.name}
                          </p>

                          <div className="mt-1 flex items-center gap-2 text-xs">
                            {product.category && (
                              <span className="text-zinc-500">
                                {product.category}
                              </span>
                            )}

                            <span className="font-semibold text-yellow-400">
                              ₹{product.price}
                            </span>
                          </div>
                        </div>

                        <span
                          className="
                            text-zinc-600
                            transition
                            group-hover:text-yellow-400
                          "
                          aria-hidden="true"
                        >
                          →
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6">
                    <p className="font-semibold text-zinc-200">
                      No notebook found
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Try another name or category.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="px-5 py-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Quick Search
                </p>

                <p className="mt-3 text-sm text-zinc-400">
                  Find the notebook that matches your personality.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
