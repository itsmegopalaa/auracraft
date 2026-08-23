"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type SearchProduct = {
  id: string;
  name: string;
  image?: string | null;
  price: number;
  category?: string | null;
};

export default function SearchBox() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    const query = search.trim();

    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
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
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        boxRef.current &&
        !boxRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function closeSearch() {
    setOpen(false);
    setSearch("");
  }

  return (
    <div ref={boxRef} className="relative">
      <button
        onClick={() => setOpen(true)}
        className="text-2xl transition hover:scale-110"
        aria-label="Search products"
      >
        🔍
      </button>

      {open && (
        <div
          className="
            fixed
            left-1/2
            top-24
            z-[100]
            w-[90vw]
            max-w-2xl
            -translate-x-1/2
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-950
            p-4
            shadow-2xl
          "
        >
          <input
            ref={inputRef}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && results.length > 0) {
                window.location.href = `/products/${results[0].id}`;
              }

              if (event.key === "Escape") {
                closeSearch();
              }
            }}
            placeholder="Search notebooks..."
            className="
              w-full
              rounded-xl
              border
              border-zinc-700
              bg-black
              px-4
              py-3
              text-white
              outline-none
              focus:border-yellow-400
            "
          />

          {search.trim() && (
            <div className="mt-4 space-y-2">
              {loading ? (
                <p className="p-3 text-gray-400">
                  Searching...
                </p>
              ) : results.length > 0 ? (
                results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    onClick={closeSearch}
                    className="
                      block
                      rounded-xl
                      p-3
                      text-gray-300
                      transition
                      hover:bg-zinc-800
                      hover:text-yellow-400
                    "
                  >
                    {product.name}
                  </Link>
                ))
              ) : (
                <p className="p-3 text-gray-400">
                  No notebook found
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
