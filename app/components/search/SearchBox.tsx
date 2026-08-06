"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { notebooks } from "../../data/notebooks";

export default function SearchBox() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = notebooks.filter((book) =>
    book.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);


  // Outside click close
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


  return (
    <div ref={boxRef} className="relative">

      <button
        onClick={() => setOpen(true)}
        className="text-2xl transition hover:scale-110"
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
       transition-all
duration-300
ease-out
    "
  >

          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results.length > 0) {
                window.location.href = `/products/${results[0].id}`;
              }
            }}
            placeholder="Search notebooks..."
            className="
              w-full rounded-xl
              border border-zinc-700
              bg-black px-4 py-3
              text-white
              outline-none
              focus:border-yellow-400
            "
          />


          {search && (
            <div className="mt-4 space-y-2">

              {results.length > 0 ? (
                results.map((book) => (
                  <Link
                    key={book.id}
                    href={`/products/${book.id}`}
                    onClick={() => setOpen(false)}
                    className="
                      block rounded-xl p-3
                      text-gray-300
                      hover:bg-zinc-800
                      hover:text-yellow-400
                    "
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