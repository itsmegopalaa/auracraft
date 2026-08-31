"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import SearchBox from "../search/SearchBox";
import { createClient } from "@/utils/supabase/client";

function Icon({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span
      aria-hidden="true"
      className="flex h-5 w-5 items-center justify-center text-[17px]"
    >
      {children}
    </span>
  );
}

export default function DesktopNavbar() {
  const { cart } = useCart();
  const { wishlist } = useWishlist();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

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

      setIsLoggedIn(Boolean(user));
      setUserName(user?.user_metadata?.full_name?.trim() || "");
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
      setUserName(
        session?.user?.user_metadata?.full_name?.trim() || ""
      );
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const controlClass =
    "flex h-10 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.025] text-zinc-300 transition-all duration-200 hover:border-yellow-400/60 hover:bg-yellow-400/[0.06] hover:text-yellow-400";

  return (
    <div className="flex items-center justify-end gap-2.5">

      {/* Search */}
      <SearchBox />

      {/* Wishlist */}
      <Link
        href="/wishlist"
        aria-label={`Wishlist${wishlist.length ? ` (${wishlist.length})` : ""}`}
        className={`${controlClass} gap-2 px-3.5 text-[13px] font-semibold`}
      >
        <Icon>♡</Icon>

        {wishlist.length > 0 && (
          <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-yellow-400 px-1 text-[9px] font-black text-black">
            {wishlist.length > 99 ? "99+" : wishlist.length}
          </span>
        )}
      </Link>

      {/* Cart */}
      <Link
        href="/cart"
        aria-label={`Cart${totalItems ? ` (${totalItems})` : ""}`}
        className={`${controlClass} gap-2 px-3.5 text-[13px] font-semibold`}
      >
        <Icon>🛒</Icon>
        <span>Bag</span>

        {totalItems > 0 && (
          <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-yellow-400 px-1 text-[9px] font-black text-black">
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </Link>

      {/* Orders */}
      <Link
        href="/account/orders"
        className={`${controlClass} gap-2 px-3.5 text-[13px] font-semibold`}
      >
        <Icon>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-[17px] w-[17px]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 8.5 12 5l7.5 3.5v8L12 20l-7.5-3.5v-8Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.8 8.7 7.2 3.4 7.2-3.4M12 12.1V20"
            />
          </svg>
        </Icon>
        <span>Orders</span>
      </Link>

      {/* Account */}
      <Link
        href={isLoggedIn ? "/account" : "/login"}
        className={`${controlClass} max-w-[150px] gap-2 px-3.5 text-[13px] font-semibold`}
      >
        <Icon>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-[17px] w-[17px]"
          >
            <circle cx="12" cy="8" r="3.2" />
            <path
              strokeLinecap="round"
              d="M5.5 19c.9-3.1 3.1-4.8 6.5-4.8s5.6 1.7 6.5 4.8"
            />
          </svg>
        </Icon>

        <span className="max-w-[95px] truncate">
          {isLoggedIn ? userName || "Account" : "Account"}
        </span>
      </Link>

      {/* CTA */}
      <Link
        href="/products"
        className="ml-1 flex h-10 items-center rounded-full bg-yellow-400 px-5 text-[13px] font-bold text-black shadow-lg shadow-yellow-500/[0.08] transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-xl hover:shadow-yellow-500/[0.14] active:translate-y-0"
      >
        Shop Now
      </Link>

    </div>
  );
}
