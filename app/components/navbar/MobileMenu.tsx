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
    <div className="border-t border-zinc-800 bg-black/95 px-6 py-8 backdrop-blur-xl md:hidden">

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
          href="/track-order"
          onClick={() => setMenuOpen(false)}
          className="flex items-center justify-between rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4"
        >
          <span>🔎 Track Order</span>
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


        <div className="border-t border-zinc-800" />


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



      </div>

    </div>
  );
}