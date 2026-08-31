"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { createClient } from "@/utils/supabase/client";

type Props = {
  setMenuOpen: (value: boolean) => void;
};

export default function MobileMenu({ setMenuOpen }: Props) {
  const router = useRouter();
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

    return () => subscription.unsubscribe();
  }, []);

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const closeMenu = () => setMenuOpen(false);

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

      return;
    }

    router.push("/");
  };

  const navItems = [
    ["/", "Home"],
    ["/products", "Products"],
    ["/about", "Our Story"],
    ["/contact", "Contact"],
  ];

  return (
    <div className="max-h-[calc(100dvh-64px)] overflow-y-auto px-4 pb-7 pt-5">

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">

        <Link
          href="/wishlist"
          onClick={closeMenu}
          className="group rounded-2xl border border-white/[0.12] bg-white/[0.045] px-4 py-[15px] shadow-[0_10px_30px_rgba(0,0,0,0.22)] outline-none transition-all duration-200 hover:border-yellow-400/40 hover:bg-yellow-400/[0.04] focus-visible:ring-2 focus-visible:ring-yellow-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[21px] font-light text-zinc-200">
              ♡
            </span>

            {wishlist.length > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-yellow-400 px-1.5 text-[10px] font-black text-black">
                {wishlist.length > 99 ? "99+" : wishlist.length}
              </span>
            )}
          </div>

          <p className="mt-3 text-[13px] font-semibold text-zinc-50">
            Wishlist
          </p>
        </Link>

        <Link
          href="/cart"
          onClick={closeMenu}
          className="group rounded-2xl border border-white/[0.12] bg-white/[0.045] px-4 py-[15px] shadow-[0_10px_30px_rgba(0,0,0,0.22)] outline-none transition-all duration-200 hover:border-yellow-400/40 hover:bg-yellow-400/[0.04] focus-visible:ring-2 focus-visible:ring-yellow-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[18px] text-zinc-200">
              🛒
            </span>

            {totalItems > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-yellow-400 px-1.5 text-[10px] font-black text-black">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </div>

          <p className="mt-3 text-[13px] font-semibold text-zinc-50">
            Your Bag
          </p>
        </Link>

      </div>

      {/* Main actions */}
      <div className="mt-3 space-y-2.5">

        <Link
          href="/products"
          onClick={closeMenu}
          className="flex min-h-[58px] items-center justify-between rounded-2xl bg-yellow-400 px-5 text-[14px] font-bold text-black shadow-[0_10px_30px_rgba(234,179,8,0.12)] outline-none transition-all duration-200 hover:bg-yellow-300 hover:shadow-[0_12px_34px_rgba(234,179,8,0.18)] focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-[0.99]"
        >
          <span>Shop the Collection</span>
          <span aria-hidden="true">→</span>
        </Link>

        <Link
          href="/account/orders"
          onClick={closeMenu}
          className="group flex min-h-[56px] items-center justify-between rounded-2xl border border-white/[0.11] bg-white/[0.045] px-5 shadow-[0_9px_28px_rgba(0,0,0,0.20)] outline-none transition-all duration-200 hover:border-yellow-400/40 hover:bg-yellow-400/[0.04] focus-visible:ring-2 focus-visible:ring-yellow-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <span
              className="text-base text-zinc-300"
              aria-hidden="true"
            >
              📦
            </span>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                Orders
              </p>

              <p className="mt-1 text-[14px] font-semibold text-zinc-100">
                My Orders
              </p>
            </div>
          </div>

          <span
            className="text-zinc-600 transition-all duration-150 group-hover:translate-x-1 group-hover:text-yellow-400"
            aria-hidden="true"
          >
            →
          </span>
        </Link>

        <Link
          href={isLoggedIn ? "/account" : "/login"}
          onClick={closeMenu}
          className="flex min-h-[56px] items-center justify-between rounded-2xl border border-yellow-400/30 bg-yellow-400/[0.065] px-5 shadow-[0_9px_30px_rgba(0,0,0,0.22)] outline-none transition-all duration-200 hover:border-yellow-400/50 hover:bg-yellow-400/[0.07] focus-visible:ring-2 focus-visible:ring-yellow-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-[0.99]"
        >
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-yellow-400">
              {isLoggedIn ? "Welcome back" : "Account"}
            </p>

            <p className="mt-1 truncate text-[14px] font-semibold text-white">
              {isLoggedIn ? userName || "My Account" : "Login / Sign up"}
            </p>
          </div>

          <span className="ml-4 text-yellow-400" aria-hidden="true">
            →
          </span>
        </Link>

      </div>

      {/* Navigation */}
      <div className="mt-7 border-t border-white/[0.14] pt-6">

        <p className="mb-2.5 px-1 text-[9px] font-bold uppercase tracking-[0.24em] text-zinc-500">
          Explore
        </p>

        <nav aria-label="Mobile navigation" className="space-y-2">

          {navItems.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={href === "/" ? handleHomeClick : closeMenu}
              className="group flex min-h-[50px] items-center justify-between rounded-xl border border-white/[0.10] bg-white/[0.035] px-4 text-[14px] font-medium text-zinc-200 shadow-[0_6px_22px_rgba(0,0,0,0.18)] outline-none transition-all duration-200 hover:border-yellow-400/35 hover:bg-white/[0.065] hover:text-yellow-400 focus-visible:border-yellow-400/50 focus-visible:ring-2 focus-visible:ring-yellow-400/70 focus-visible:ring-inset active:scale-[0.99] active:bg-white/[0.06]"
            >
              <span>{label}</span>

              <span
                className="text-zinc-600 transition-all duration-200 group-hover:translate-x-1 group-hover:text-yellow-400"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          ))}

        </nav>
      </div>

      <p className="mt-5 px-1 text-[10px] leading-relaxed text-zinc-600">
        Premium personalized notebooks by MineNote.
      </p>

    </div>
  );
}
