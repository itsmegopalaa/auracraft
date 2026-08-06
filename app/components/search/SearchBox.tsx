"use client";

import { useState } from "react";
import Link from "next/link";
import { notebooks } from "../../data/notebooks";

export default function SearchBox() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const results = notebooks.filter((book) =>
    book.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">

      <button
        onClick={() => setOpen(!open)}
        className="text-2xl transition hover:scale-110"
      >
        🔍
      </button>


      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">

         <input
  autoFocus
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" && results.length > 0) {
      window.location.href = `/products/${results[0].id}`;
    }
  }}
  placeholder="Search notebooks..."
  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
/>


          {search && (
            <div className="mt-4 space-y-2">

              {results.length > 0 ? (
                results.map((book) => (
                  <Link
                    key={book.id}
                    href={`/products/${book.id}`}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl p-3 text-gray-300 hover:bg-zinc-800 hover:text-yellow-400"
                  >
                    {book.name}
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