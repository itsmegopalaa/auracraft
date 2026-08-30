"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import DesktopNavbar from "./navbar/DesktopNavbar";
import MobileSearch from "./navbar/MobileSearch";
import MobileMenu from "./navbar/MobileMenu";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;

    const endY = e.changedTouches[0].clientY;
    const diff = endY - touchStartY.current;

    touchStartY.current = null;

    if (Math.abs(diff) < 35) {
      setMenuOpen((current) => !current);
      return;
    }

    if (diff > 35) {
      setMenuOpen(true);
    } else if (diff < -35) {
      setMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black/70 backdrop-blur-xl">

      <div className="mx-auto max-w-7xl px-6 py-5">

        {/* Desktop */}
        <div className="hidden items-center justify-between md:flex">

          <Link href="/">
            <h1 className="text-3xl font-extrabold tracking-wide text-yellow-400">
              MineNote
            </h1>
          </Link>

          <DesktopNavbar />

        </div>

        {/* Mobile */}
        <div className="md:hidden">

          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="flex min-h-[48px] touch-pan-y items-center justify-between"
          >

            <div onTouchStart={(e) => e.stopPropagation()}>
              <MobileSearch />
            </div>

            <Link
              href="/"
              onTouchStart={(e) => e.stopPropagation()}
            >
              <h1 className="text-3xl font-extrabold text-yellow-400">
                MineNote
              </h1>
            </Link>

            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((current) => !current);
              }}
              className="relative z-20 flex h-12 w-12 items-center justify-center rounded-full text-3xl text-yellow-400 transition-transform duration-200 active:scale-90"
            >
              {menuOpen ? "✕" : "☰"}
            </button>

          </div>

          {/* Mobile menu + outside click layer */}
          <div
            className={[
              "fixed inset-x-0 top-[76px] z-40 md:hidden",
              "transition-all duration-300 ease-out",
              menuOpen
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0",
            ].join(" ")}
          >

            {/* Blank-space backdrop */}
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 -z-10 bg-black/20"
            />

            <div
              className={[
                "origin-top transform transition-all duration-300 ease-out",
                menuOpen
                  ? "translate-y-0 scale-y-100"
                  : "-translate-y-3 scale-y-95",
              ].join(" ")}
            >
              <MobileMenu setMenuOpen={setMenuOpen} />
            </div>

          </div>

        </div>

      </div>

    </nav>
  );
}
