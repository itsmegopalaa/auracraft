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
    "flex h-10 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.025] text-zinc-300 outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-yellow-400/50 hover:bg-yellow-400/[0.06] hover:text-yellow-400 focus-visible:border-yellow-400 focus-visible:ring-2 focus-visible:ring-yellow-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

  return (
    <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 xl:gap-2.5">

      {/* Search */}
      <div className="shrink-0">
        <SearchBox />
      </div>

      {/* Wishlist */}
      <Link
        href="/wishlist"
        aria-label={`Wishlist${wishlist.length ? ` (${wishlist.length})` : ""}`}
        className={`${controlClass} gap-1.5 px-2.5 text-[12px] font-bold xl:gap-2 xl:px-3.5 xl:text-[13px]`}
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
        className={`${controlClass} gap-1.5 px-2.5 text-[12px] font-bold xl:gap-2 xl:px-3.5 xl:text-[13px]`}
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
        className={`${controlClass} gap-1.5 px-2.5 text-[12px] font-bold xl:gap-2 xl:px-3.5 xl:text-[13px]`}
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
        className={`${controlClass} min-w-0 max-w-[125px] gap-1.5 px-2.5 text-[12px] font-semibold xl:max-w-[150px] xl:gap-2 xl:px-3.5 xl:text-[13px]`}
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

        <span className="min-w-0 max-w-[72px] truncate xl:max-w-[100px]">
          {isLoggedIn ? userName || "Account" : "Account"}
        </span>
      </Link>

      {/* CTA */}
      <Link
        href="/products"
        className="ml-1 flex h-10 shrink-0 items-center rounded-full bg-yellow-400 px-4 text-[12px] font-black text-black shadow-lg shadow-yellow-500/[0.08] transition-all duration-300 hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-xl hover:shadow-yellow-500/[0.14] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        Shop Now
      </Link>

    </div>
  );
}
