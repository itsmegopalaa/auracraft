"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import SearchBox from "./search/SearchBox";


export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart } = useCart();
const { wishlist } = useWishlist();
  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black/70 backdrop-blur-xl">

      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

        {/* Logo */}
        <Link href="/">
          <h1 className="cursor-pointer text-3xl font-extrabold tracking-wide text-yellow-400 transition hover:scale-105">
            AuraCraft
          </h1>
        </Link>


        {/* Navigation */}
        <div className="hidden md:flex items-center gap-8 font-medium text-gray-300">

          <Link href="/" className="transition hover:text-yellow-400">
            Home
          </Link>

          <Link href="/products" className="transition hover:text-yellow-400">
            Products
          </Link>

          <Link href="/about" className="transition hover:text-yellow-400">
            About
          </Link>

          <Link href="/contact" className="transition hover:text-yellow-400">
            Contact
          </Link>

        </div>

<button
  onClick={() => setMenuOpen(!menuOpen)}
  className="rounded-lg p-2 text-3xl text-yellow-400 md:hidden"
>
  {menuOpen ? "✕" : "☰"}
</button>
        {/* Right Side */}
       <div className="hidden items-center gap-4 md:flex">

          <SearchBox />

          <Link
  href="/wishlist"
  className="text-2xl transition hover:scale-110"
>
  ❤️
  {wishlist.length > 0 && (
    <span className="ml-1 text-sm text-yellow-400">
      {wishlist.length}
    </span>
  )}
</Link>

          <Link
            href="/cart"
            className="rounded-full border border-yellow-400 px-5 py-3 font-semibold text-yellow-400 transition hover:bg-yellow-400 hover:text-black"
          >
            🛒 {totalItems}
          </Link>


          <Link
            href="/products"
            className="rounded-full bg-yellow-400 px-6 py-3 font-semibold text-black transition hover:scale-105"
          >
            Shop Now
          </Link>

        </div>

      </div>
{menuOpen && (
  <div className="border-t border-zinc-800 bg-black px-6 py-6 md:hidden">
    <div className="flex flex-col gap-5 text-lg">

      <Link href="/" onClick={() => setMenuOpen(false)}>
        Home
      </Link>

      <Link href="/products" onClick={() => setMenuOpen(false)}>
        Products
      </Link>

      <Link href="/about" onClick={() => setMenuOpen(false)}>
        About
      </Link>

      <Link href="/contact" onClick={() => setMenuOpen(false)}>
        Contact
      </Link>

      <Link
        href="/wishlist"
        onClick={() => setMenuOpen(false)}
      >
        ❤️ Wishlist ({wishlist.length})
      </Link>

      <Link
        href="/cart"
        onClick={() => setMenuOpen(false)}
      >
        🛒 Cart ({totalItems})
      </Link>

      <Link
        href="/products"
        onClick={() => setMenuOpen(false)}
        className="mt-2 rounded-full bg-yellow-400 py-3 text-center font-bold text-black"
      >
        Shop Now →
      </Link>

    </div>
  </div>
)}
    </nav>
  );
}