"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import SearchBox from "../search/SearchBox";
import ThemeSwitcher from "../ThemeSwitcher";
import { createClient } from "@/utils/supabase/client";

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-5 w-5 shrink-0 items-center justify-center"
    >
      {children}
    </span>
  );
}

function Count({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--mn-accent)] px-1 text-[9px] font-bold text-[var(--mn-accent-contrast)]">
      {children}
    </span>
  );
}

export default function DesktopNavbar() {
  const { cart } = useCart();
  const { wishlist } = useWishlist();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [supabase] = useState(() => createClient());

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
    "flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-surface)] px-3 text-xs font-semibold text-[var(--mn-text-secondary)] outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--mn-text-muted)] hover:bg-[var(--mn-surface-soft)] hover:text-[var(--mn-text)] focus-visible:border-[var(--mn-focus)] focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)]";

  return (
    <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
      <div className="min-w-0 max-w-[270px] flex-1">
        <SearchBox />
      </div>

      <Link
        href="/wishlist"
        aria-label={`Wishlist${wishlist.length ? ` (${wishlist.length})` : ""}`}
        className={controlClass}
      >
        <Icon>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-[18px] w-[18px]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.8 8.7c0 5.2-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.7A4.6 4.6 0 0 1 12 6.4a4.6 4.6 0 0 1 8.8 2.3Z"
            />
          </svg>
        </Icon>
        {wishlist.length > 0 && (
          <Count>{wishlist.length > 99 ? "99+" : wishlist.length}</Count>
        )}
      </Link>

      <Link
        href="/cart"
        aria-label={`Cart${totalItems ? ` (${totalItems})` : ""}`}
        className={controlClass}
      >
        <Icon>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-[18px] w-[18px]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 5h2l1.5 10.2a2 2 0 0 0 2 1.7h7.7a2 2 0 0 0 1.9-1.5L21 8H7"
            />
            <circle cx="10" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
          </svg>
        </Icon>
        <span className="hidden xl:inline">Bag</span>
        {totalItems > 0 && (
          <Count>{totalItems > 99 ? "99+" : totalItems}</Count>
        )}
      </Link>

      <Link
        href="/account/orders"
        aria-label="Orders"
        className={controlClass}
      >
        <Icon>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-[18px] w-[18px]"
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
        <span className="hidden xl:inline">Orders</span>
      </Link>

      <Link
        href={isLoggedIn ? "/account" : "/login"}
        aria-label={isLoggedIn ? "Account" : "Login"}
        className={`${controlClass} min-w-0 max-w-[135px]`}
      >
        <Icon>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-[18px] w-[18px]"
          >
            <circle cx="12" cy="8" r="3.2" />
            <path
              strokeLinecap="round"
              d="M5.5 19c.9-3.1 3.1-4.8 6.5-4.8s5.6 1.7 6.5 4.8"
            />
          </svg>
        </Icon>

        <span className="hidden min-w-0 truncate xl:inline">
          {isLoggedIn ? userName || "Account" : "Account"}
        </span>
      </Link>

      <ThemeSwitcher />

      <Link
        href="/products"
        className="ml-1 flex h-10 shrink-0 items-center justify-center rounded-xl bg-[var(--mn-accent)] px-5 text-xs font-bold text-[var(--mn-accent-contrast)] shadow-[var(--mn-shadow-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)]"
      >
        Shop Now
      </Link>
    </div>
  );
}
