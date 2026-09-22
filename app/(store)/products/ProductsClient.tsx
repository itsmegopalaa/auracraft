"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/app/components/ProductCard";
import type { Product } from "@/app/types/products";

type Props = {
  products: Product[];
};

export default function ProductsClient({ products }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Featured");
  const [priceFilter, setPriceFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");

  const categories = [
    "All",
    ...new Set(
      products
        .map((product) => product.category)
        .filter(
          (category): category is string =>
            Boolean(category)
        )
    ),
  ];

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        searchText === "" ||
        product.name.toLowerCase().includes(searchText) ||
        product.description?.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All" ||
        product.category === category;

      const matchesPrice =
        priceFilter === "All" ||
        (priceFilter === "Under ₹1,000" &&
          product.price < 1000) ||
        (priceFilter === "₹1,000–₹1,200" &&
          product.price >= 1000 &&
          product.price <= 1200) ||
        (priceFilter === "₹1,200+" &&
          product.price > 1200);

      const matchesRating =
        ratingFilter === "All" ||
        (ratingFilter === "4★+" &&
          (product.rating ?? 0) >= 4) ||
        (ratingFilter === "3★+" &&
          (product.rating ?? 0) >= 3);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesRating
      );
    });

    return [...filtered].sort((a, b) => {
      if (sort === "Price: Low → High") {
        return a.price - b.price;
      }

      if (sort === "Price: High → Low") {
        return b.price - a.price;
      }

      if (sort === "Rating") {
        return (b.rating ?? 0) - (a.rating ?? 0);
      }

      return Number(b.featured) - Number(a.featured);
    });
  }, [
    products,
    search,
    category,
    sort,
    priceFilter,
    ratingFilter,
  ]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setSort("Featured");
    setPriceFilter("All");
    setRatingFilter("All");
  };

  return (
    <div className="space-y-7 sm:space-y-8">
      <input
        type="text"
        placeholder="🔍 Search notebooks..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="w-full rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] px-4 py-4 text-sm text-[var(--mn-text)] shadow-[var(--mn-shadow-sm)] outline-none transition-all duration-300 placeholder:text-[var(--mn-text-muted)] focus:border-[var(--mn-border-strong)] focus:bg-[var(--mn-surface-soft)] focus:ring-2 focus:ring-[var(--mn-accent-soft)] sm:px-5 sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
      />

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:flex-wrap md:overflow-visible">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() =>
              setCategory(item)
            }
            className={`whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-bold transition-all duration-200 active:scale-[0.98] ${
              category === item
                ? "border-[var(--mn-accent)] bg-[var(--mn-accent)] text-[var(--mn-accent-contrast)] shadow-[var(--mn-shadow-sm)]"
                : "border-[var(--mn-border)] bg-[var(--mn-surface)] text-[var(--mn-text-secondary)] hover:border-[var(--mn-border-strong)] hover:text-[var(--mn-text)]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <select
          value={sort}
          onChange={(e) =>
            setSort(e.target.value)
          }
          className="w-full rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] px-4 py-3.5 text-sm font-medium text-[var(--mn-text)] outline-none transition-all duration-200 focus:border-[var(--mn-border-strong)] focus:ring-2 focus:ring-[var(--mn-accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
        >
          <option>Featured</option>
          <option>Price: Low → High</option>
          <option>Price: High → Low</option>
          <option>Rating</option>
        </select>

        <select
          value={priceFilter}
          onChange={(e) =>
            setPriceFilter(e.target.value)
          }
          className="w-full rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] px-4 py-3.5 text-sm font-medium text-[var(--mn-text)] outline-none transition-all duration-200 focus:border-[var(--mn-border-strong)] focus:ring-2 focus:ring-[var(--mn-accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
        >
          <option>All</option>
          <option>Under ₹1,000</option>
          <option>₹1,000–₹1,200</option>
          <option>₹1,200+</option>
        </select>

        <select
          value={ratingFilter}
          onChange={(e) =>
            setRatingFilter(e.target.value)
          }
          className="w-full rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] px-4 py-3.5 text-sm font-medium text-[var(--mn-text)] outline-none transition-all duration-200 focus:border-[var(--mn-border-strong)] focus:ring-2 focus:ring-[var(--mn-accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
        >
          <option>All</option>
          <option>4★+</option>
          <option>3★+</option>
        </select>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="w-fit rounded-full border border-[var(--mn-border)] bg-[var(--mn-surface)] px-4 py-2 text-xs font-semibold text-[var(--mn-text-muted)] sm:text-sm">
          Showing{" "}
          <span className="text-[var(--mn-accent)]">
            {filteredProducts.length}
          </span>{" "}
          products
        </p>

        {(search ||
          category !== "All" ||
          sort !== "Featured" ||
          priceFilter !== "All" ||
          ratingFilter !== "All") && (
          <button
            onClick={clearFilters}
            className="w-fit rounded-full px-4 min-h-10 py-2 text-sm font-bold text-[var(--mn-accent)] transition-all hover:bg-[var(--mn-accent-soft)] hover:text-[var(--mn-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
          >
            Clear filters ✕
          </button>
        )}
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              image={product.image ?? ""}
              price={product.price}
              category={product.category ?? undefined}
              rating={product.rating ?? undefined}
              reviewCount={product.review_count ?? 0}
              bestseller={product.bestseller}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-[var(--mn-border)] bg-[var(--mn-surface)] px-6 py-16 text-center shadow-[var(--mn-shadow-sm)] sm:px-10">
          <div className="text-4xl">🔍</div>

          <h3 className="mt-4 text-xl font-semibold text-[var(--mn-text)]">
            No notebooks found
          </h3>

          <p className="mt-2 text-[var(--mn-text-muted)]">
            Try changing your search or filters.
          </p>

          <button
            onClick={clearFilters}
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[var(--mn-accent)] px-6 py-3 font-black text-[var(--mn-accent-contrast)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--mn-accent-hover)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
