"use client";
import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { cart } = useCart();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-black/50 border-b border-zinc-800">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-5">

        <h1 className="text-3xl font-extrabold tracking-wide text-yellow-400">
          AuraCraft
        </h1>


        <div className="hidden md:flex items-center gap-8 text-gray-300">
          <a href="#" className="hover:text-yellow-400 transition">
            Home
          </a>

          <a href="#" className="hover:text-yellow-400 transition">
            Products
          </a>

          <a href="#" className="hover:text-yellow-400 transition">
            About
          </a>

          <a href="#" className="hover:text-yellow-400 transition">
            Contact
          </a>
        </div>


        <div className="flex items-center gap-4">

          <Link
  href="/cart"
  className="rounded-full border border-yellow-400 px-5 py-3 text-yellow-400 font-semibold"
>
  🛒 {cart.length}
</Link>

          <button className="rounded-full bg-yellow-400 px-6 py-3 font-semibold text-black hover:scale-105 transition">
            Shop Now
          </button>

        </div>


      </div>
    </nav>
  );
}