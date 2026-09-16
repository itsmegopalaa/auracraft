"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { createClient } from "@/utils/supabase/client";
import ThemeSwitcher from "../ThemeSwitcher";

type Props = {
  setMenuOpen: (open: boolean) => void;
};

function Arrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h13M13 6l6 6-6 6"
      />
    </svg>
  );
}

export default function MobileMenu({ setMenuOpen }: Props) {
  const router = useRouter();
  const { cart } = useCart();
  const { wishlist } = useWishlist();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const supabase = createClient();

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
  }, []);

  const handleHomeClick = (
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    event.preventDefault();
    closeMenu();

    if (window.location.pathname === "/") {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });

      document.documentElement.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });

      document.body.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });

      return;
    }

    router.push("/");
  };

  const navItems = [
    ["/", "Home"],
    ["/products", "Products"],
    ["/about", "Our Story"],
    ["/contact", "Contact"],
  ] as const;

  return (
    <div className="px-5 pb-7 pt-5 sm:px-7">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--mn-text-muted)]">
          MineNote
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-[var(--mn-text)]">
          Make something that feels yours.
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/wishlist"
          onClick={closeMenu}
          className="group rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-bg)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--mn-text-muted)]"
        >
          <div className="flex items-center justify-between">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-5 w-5 text-[var(--mn-text)]"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.8 8.7c0 5.2-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.7A4.6 4.6 0 0 1 12 6.4a4.6 4.6 0 0 1 8.8 2.3Z"
              />
            </svg>

            {wishlist.length > 0 && (
              <span className="rounded-full bg-[var(--mn-accent)] px-2 py-0.5 text-[10px] font-bold text-[var(--mn-accent-contrast)]">
                {wishlist.length > 99 ? "99+" : wishlist.length}
              </span>
            )}
          </div>

          <p className="mt-5 text-sm font-semibold text-[var(--mn-text)]">
            Wishlist
          </p>
          <p className="mt-1 text-xs text-[var(--mn-text-muted)]">
            Saved favourites
          </p>
        </Link>

        <Link
          href="/cart"
          onClick={closeMenu}
          className="group rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-bg)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--mn-text-muted)]"
        >
          <div className="flex items-center justify-between">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-5 w-5 text-[var(--mn-text)]"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 5h2l1.5 10.2a2 2 0 0 0 2 1.7h7.7a2 2 0 0 0 1.9-1.5L21 8H7"
              />
              <circle cx="10" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>

            {totalItems > 0 && (
              <span className="rounded-full bg-[var(--mn-accent)] px-2 py-0.5 text-[10px] font-bold text-[var(--mn-accent-contrast)]">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </div>

          <p className="mt-5 text-sm font-semibold text-[var(--mn-text)]">
            Your Bag
          </p>
          <p className="mt-1 text-xs text-[var(--mn-text-muted)]">
            {totalItems ? `${totalItems} item${totalItems === 1 ? "" : "s"}` : "Nothing added yet"}
          </p>
        </Link>
      </div>

      <Link
        href="/products"
        onClick={closeMenu}
        className="mt-4 flex min-h-14 items-center justify-between rounded-2xl bg-[var(--mn-accent)] px-5 text-[var(--mn-accent-contrast)] transition-all duration-200 hover:opacity-90"
      >
        <span>
          <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70">
            Explore
          </span>
          <span className="mt-0.5 block text-base font-semibold">
            Shop the collection
          </span>
        </span>
        <Arrow />
      </Link>

      <div className="mt-7 border-t border-[var(--mn-border)] pt-5">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--mn-text-muted)]">
          Your MineNote
        </p>

        <div className="divide-y divide-[var(--mn-border)] rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-bg)]">
          <Link
            href="/account/orders"
            onClick={closeMenu}
            className="flex items-center justify-between px-4 py-4 text-sm font-medium text-[var(--mn-text)]"
          >
            <span>My Orders</span>
            <Arrow />
          </Link>

          <Link
            href={isLoggedIn ? "/account" : "/login"}
            onClick={closeMenu}
            className="flex items-center justify-between px-4 py-4 text-sm font-medium text-[var(--mn-text)]"
          >
            <span>{isLoggedIn ? userName || "My Account" : "Login / Account"}</span>
            <Arrow />
          </Link>
        </div>
      </div>

      <div className="mt-7 border-t border-[var(--mn-border)] pt-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--mn-text-muted)]">
              Appearance
            </p>
            <p className="mt-1 text-xs text-[var(--mn-text-secondary)]">
              Choose how MineNote looks
            </p>
          </div>

          <ThemeSwitcher />
        </div>
      </div>

      <div className="mt-7 border-t border-[var(--mn-border)] pt-5">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--mn-text-muted)]">
          Explore
        </p>

        <div className="grid grid-cols-2 gap-2">
          {navItems.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={(event) => {
                if (href === "/") {
                  handleHomeClick(event);
                } else {
                  closeMenu();
                }
              }}
              className="rounded-xl border border-[var(--mn-border)] px-4 py-3 text-sm text-[var(--mn-text-secondary)] transition-colors hover:bg-[var(--mn-bg)] hover:text-[var(--mn-text)]"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <p className="mt-7 text-center text-xs leading-5 text-[var(--mn-text-muted)]">
        Premium personalized notebooks by MineNote.
      </p>
    </div>
  );
}
