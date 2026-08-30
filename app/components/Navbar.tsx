"use client";

import { useState } from "react";
import Link from "next/link";
import DesktopNavbar from "./navbar/DesktopNavbar";
import MobileSearch from "./navbar/MobileSearch";
import MobileMenu from "./navbar/MobileMenu";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black/95">

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5">

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
        <div className="relative md:hidden">

          <div className="flex min-h-12 items-center justify-between gap-3">

            {/* Search */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-start">
              <MobileSearch />
            </div>

            {/* Logo */}
            <Link
              href="/"
              className="min-w-0 flex-1 text-center"
              onClick={() => setMenuOpen(false)}
            >
              <h1 className="truncate text-2xl font-extrabold tracking-wide text-yellow-400 sm:text-3xl">
                MineNote
              </h1>
            </Link>

            {/* Menu button */}
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((current) => !current)}
              className="flex h-12 w-12 shrink-0 touch-manipulation items-center justify-center rounded-xl text-3xl text-yellow-400 transition-transform active:scale-90"
            >
              <span aria-hidden="true">
                {menuOpen ? "✕" : "☰"}
              </span>
            </button>

          </div>

          {/* Mobile dropdown */}
          <div
            className={[
              "absolute left-0 right-0 top-full z-50",
              "mt-2 overflow-hidden rounded-2xl border border-zinc-800",
              "bg-zinc-950 shadow-2xl",
              "transition-[opacity,transform] duration-200 ease-out",
              menuOpen
                ? "visible translate-y-0 opacity-100"
                : "invisible -translate-y-2 opacity-0 pointer-events-none",
            ].join(" ")}
          >
            <MobileMenu setMenuOpen={setMenuOpen} />
          </div>

        </div>

      </div>

    </nav>
  );
}
