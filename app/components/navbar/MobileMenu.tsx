"use client";

import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Props = {
  setMenuOpen: (value: boolean) => void;
};

export default function MobileMenu({ setMenuOpen }: Props) {

  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(Boolean(data.user));
      setUserName(
        data.user?.user_metadata?.full_name?.trim() || ""
      );
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
      setUserName(
        session?.user?.user_metadata?.full_name?.trim() || ""
      );
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="max-h-[calc(100dvh-120px)] overflow-y-auto border-t border-zinc-800 px-4 py-5 md:hidden">

      <div className="flex flex-col gap-6 text-lg">


        <Link
          href="/wishlist"
          onClick={() => setMenuOpen(false)}
          className="flex items-center justify-between rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4"
        >
          <span>❤️ Wishlist</span>

          <span className="rounded-full bg-yellow-400 px-3 py-1 text-sm font-bold text-black">
            {wishlist.length}
          </span>
        </Link>


        <Link
          href="/cart"
          onClick={() => setMenuOpen(false)}
          className="flex items-center justify-between rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4"
        >
          <span>🛒 Cart</span>

          <span className="rounded-full bg-yellow-400 px-3 py-1 text-sm font-bold text-black">
            {totalItems}
          </span>
        </Link>

        <Link
          href="/account/orders"
          onClick={() => setMenuOpen(false)}
          className="flex items-center justify-between rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4"
        >
          <span>📦 My Orders</span>
          <span>→</span>
        </Link>

        <Link
          href="/products"
          onClick={() => setMenuOpen(false)}
          className="flex items-center justify-between rounded-2xl bg-yellow-400 px-5 py-4 font-bold text-black"
        >
          <span>🛍️ Shop Now</span>
          <span>→</span>
        </Link>

        <Link
          href={isLoggedIn ? "/account" : "/login"}
          onClick={() => setMenuOpen(false)}
          className="flex items-center justify-between rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 font-semibold text-yellow-400"
        >
          <span>👤 {isLoggedIn ? (userName || "Account") : "Login"}</span>
          <span>→</span>
        </Link>


        <div className="mt-2 border-t border-zinc-800/80 pt-7">
          <p className="mb-4 px-1 text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">
            Explore MineNote
          </p>

          <nav className="flex flex-col gap-2">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="group flex items-center justify-between rounded-xl border border-transparent px-4 py-3.5 text-[16px] font-semibold text-zinc-100 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900 hover:text-yellow-400"
            >
              <span className="flex items-center">
                <span className="mr-3 text-lg">🏠</span>
                Home
              </span>
              <span className="text-zinc-600 transition group-hover:text-yellow-400">
                →
              </span>
            </Link>

            <Link
              href="/products"
              onClick={() => setMenuOpen(false)}
              className="group flex items-center justify-between rounded-xl border border-transparent px-4 py-3.5 text-[16px] font-semibold text-zinc-100 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900 hover:text-yellow-400"
            >
              <span className="flex items-center">
                <span className="mr-3 text-lg">🛍️</span>
                Products
              </span>
              <span className="text-zinc-600 transition group-hover:text-yellow-400">
                →
              </span>
            </Link>

            <Link
              href="/about"
              onClick={() => setMenuOpen(false)}
              className="group flex items-center justify-between rounded-xl border border-transparent px-4 py-3.5 text-[16px] font-semibold text-zinc-100 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900 hover:text-yellow-400"
            >
              <span className="flex items-center">
                <span className="mr-3 text-lg">ℹ️</span>
                About
              </span>
              <span className="text-zinc-600 transition group-hover:text-yellow-400">
                →
              </span>
            </Link>

            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="group flex items-center justify-between rounded-xl border border-transparent px-4 py-3.5 text-[16px] font-semibold text-zinc-100 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900 hover:text-yellow-400"
            >
              <span className="flex items-center">
                <span className="mr-3 text-lg">✉️</span>
                Contact
              </span>
              <span className="text-zinc-600 transition group-hover:text-yellow-400">
                →
              </span>
            </Link>
          </nav>
        </div>



      </div>

    </div>
  );
}