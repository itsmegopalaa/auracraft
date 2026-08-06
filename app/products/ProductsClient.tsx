"use client";

import { useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import { notebooks } from "../data/notebooks";

export default function ProductsClient() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = [
    "All",
    ...new Set(notebooks.map((book) => book.category)),
  ];

  const filteredProducts = useMemo(() => {
    return notebooks.filter((book) => {
      const matchesCategory =
        category === "All" || book.category === category;

      const matchesSearch = book.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <>
      {/* Search + Filters */}
      <div className="mb-12 flex flex-col gap-6">

        <input
          type="text"
          placeholder="🔍 Search notebooks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-white outline-none transition focus:border-yellow-400"
        />

        <div className="flex flex-wrap gap-3">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-full px-5 py-2 font-medium transition ${
                category === item
                  ? "bg-yellow-400 text-black"
                  : "border border-zinc-700 text-gray-300 hover:border-yellow-400"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <p className="text-gray-400">
          Showing <span className="text-yellow-400">{filteredProducts.length}</span> products
        </p>

      </div>

      {/* Products Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {filteredProducts.map((book) => (
          <ProductCard
            key={book.id}
            id={book.id}
            name={book.name}
            image={book.image}
            price={book.price}
            category={book.category}
            rating={book.rating}
            bestseller={book.bestseller}
          />
        ))}
      </div>
    </>
  );
}