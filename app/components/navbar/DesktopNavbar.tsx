"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import SearchBox from "../search/SearchBox";
import { createClient } from "@/utils/supabase/client";

export default function DesktopNavbar() {
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const supabase = createClient();

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setIsLoggedIn(!!user);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
   <div className="hidden items-center justify-between gap-6 md:flex">

     <div className="flex-1 max-w-xl">
  <SearchBox />
</div>

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
        href="/track-order"
        className="rounded-full border border-zinc-700 px-5 py-3 font-semibold text-white transition hover:border-yellow-400 hover:text-yellow-400"
      >
        🔎 Track Order
      </Link>

      <Link
        href={isLoggedIn ? "/account" : "/login"}
        className="rounded-full border border-zinc-700 px-5 py-3 font-semibold text-white transition hover:border-yellow-400 hover:text-yellow-400"
      >
        👤 {isLoggedIn ? "Account" : "Login"}
      </Link>

      <Link
        href="/products"
        className="rounded-full bg-yellow-400 px-6 py-3 font-semibold text-black transition hover:scale-105"
      >
        Shop Now
      </Link>

    </div>
  );
}