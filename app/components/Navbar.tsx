"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DesktopNavbar from "./navbar/DesktopNavbar";
import MobileSearch from "./navbar/MobileSearch";
import MobileMenu from "./navbar/MobileMenu";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

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

          <div
            className="relative flex min-h-12 items-center justify-center"
            onClick={() => setMenuOpen((current) => !current)}
          >

            {/* Search */}
            <div
              className="absolute left-0 flex h-12 w-12 items-center justify-center"
              onClick={(event) => event.stopPropagation()}
            >
              <MobileSearch />
            </div>

            {/* Navbar Logo → Home */}
            <Link
              href="/"
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen(false);
              }}
              className="inline-flex items-center justify-center"
              aria-label="MineNote Home"
            >
              <h1 className="text-2xl font-extrabold tracking-wide text-yellow-400 sm:text-3xl">
                MineNote
              </h1>
            </Link>

            {/* Hamburger */}
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen((current) => !current);
              }}
              className="absolute right-0 flex h-12 w-12 touch-manipulation items-center justify-center rounded-xl text-3xl text-yellow-400 transition-transform active:scale-90"
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
            onClick={(event) => event.stopPropagation()}
          >
            <MobileMenu setMenuOpen={setMenuOpen} />
          </div>

        </div>

      </div>

    </nav>
  );
}
