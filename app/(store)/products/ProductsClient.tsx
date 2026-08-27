"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/app/components/ProductCard";
import type { Product } from "@/app/lib/products";

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
      const searchText = search.toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(searchText) ||
        product.description
          ?.toLowerCase()
          .includes(searchText);

      const matchesCategory =
        category === "All" ||
        product.category === category;

      const matchesPrice =
        priceFilter === "All" ||
        (priceFilter === "Under ₹500" &&
          product.price < 500) ||
        (priceFilter === "₹500–₹1000" &&
          product.price >= 500 &&
          product.price <= 1000) ||
        (priceFilter === "₹1000+" &&
          product.price > 1000);

      const matchesRating =
        ratingFilter === "All" ||
        (ratingFilter === "4★+" &&
          (product.rating ?? 0) >= 4) ||
        (ratingFilter === "3★+" &&
          (product.rating ?? 0) >= 3);

      return (
        Boolean(matchesSearch) &&
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
        return (
          (b.rating ?? 0) -
          (a.rating ?? 0)
        );
      }

      return (
        Number(b.featured) -
        Number(a.featured)
      );
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
    <div className="space-y-6">
      <input
        type="text"
        placeholder="🔍 Search notebooks..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3.5 text-white outline-none transition focus:border-yellow-400 md:px-5 md:py-4"
      />

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:flex-wrap md:overflow-visible">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() =>
              setCategory(item)
            }
            className={`whitespace-nowrap rounded-full px-5 py-2 font-medium transition ${
              category === item
                ? "bg-yellow-400 text-black"
                : "border border-zinc-700 text-gray-300 hover:border-yellow-400"
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
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
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
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
        >
          <option>All</option>
          <option>Under ₹500</option>
          <option>₹500–₹1000</option>
          <option>₹1000+</option>
        </select>

        <select
          value={ratingFilter}
          onChange={(e) =>
            setRatingFilter(e.target.value)
          }
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
        >
          <option>All</option>
          <option>4★+</option>
          <option>3★+</option>
        </select>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="w-fit rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-gray-400">
          Showing{" "}
          <span className="text-yellow-400">
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
            className="w-fit text-sm font-medium text-yellow-400 transition hover:text-yellow-300"
          >
            Clear filters ✕
          </button>
        )}
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              image={product.image ?? ""}
              price={product.price}
              category={product.category ?? undefined}
              rating={product.rating ?? undefined}
              bestseller={product.bestseller}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-16 text-center">
          <div className="text-4xl">🔍</div>

          <h3 className="mt-4 text-xl font-semibold text-white">
            No notebooks found
          </h3>

          <p className="mt-2 text-gray-400">
            Try changing your search or filters.
          </p>

          <button
            onClick={clearFilters}
            className="mt-5 rounded-full bg-yellow-400 px-5 py-2.5 font-semibold text-black transition hover:bg-yellow-300"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
