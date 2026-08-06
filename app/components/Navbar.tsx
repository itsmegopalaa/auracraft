"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { cart } = useCart();

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
         <Link
  href="/products"
  className="transition hover:text-yellow-400"
>
  Products
</Link>
            About
         <Link
  href="/about"
  className="transition hover:text-yellow-400"
>
  About
</Link>
            Contact
         <Link
  href="/contact"
  className="transition hover:text-yellow-400"
>
  Contact
</Link>

        {/* Right Side */}
        <div className="flex items-center gap-4">

          <button className="text-2xl transition hover:scale-110">
            🔍
          </button>

          <button className="text-2xl transition hover:scale-110">
            ❤️
          </button>

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
    </nav>
  );
}