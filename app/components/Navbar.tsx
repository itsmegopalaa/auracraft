"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DesktopNavbar from "./navbar/DesktopNavbar";
import MobileSearch from "./navbar/MobileSearch";
import MobileMenu from "./navbar/MobileMenu";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((current) => !current);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-black/90 backdrop-blur-2xl">
        <nav aria-label="Main navigation">

          {/* ONE — and only one — horizontal container */}
          <div className="mx-auto max-w-7xl px-6">

            {/* ================= DESKTOP ================= */}
            <div className="hidden h-[72px] items-center gap-8 md:flex">

              <Link
                href="/"
                aria-label="MineNote Home"
                className="group shrink-0"
              >
                <span className="relative inline-flex items-center text-[25px] font-extrabold tracking-[-0.055em] text-white transition-opacity group-hover:opacity-90 lg:text-[27px]">
                  Mine<span className="text-yellow-400">Note</span>

                  <span className="absolute -bottom-1 left-0 h-[2px] w-0 rounded-full bg-yellow-400 transition-all duration-300 group-hover:w-full" />
                </span>
              </Link>

              <div className="min-w-0 flex-1">
                <DesktopNavbar />
              </div>

            </div>

            {/* ================= MOBILE ================= */}
            <div
              className="relative h-[64px] md:hidden"
              onClick={toggleMenu}
            >

              {/* Search */}
              <div
                className="absolute left-0 top-1/2 z-[70] -translate-y-1/2"
                data-mobile-navbar-control
                onClick={(event) => event.stopPropagation()}
              >
                <MobileSearch />
              </div>

              {/* EXACT CENTER LOGO */}
              <Link
                href="/"
                aria-label="MineNote Home"
                onClick={(event) => {
                  event.stopPropagation();
                  closeMenu();
                }}
                className="absolute left-1/2 top-1/2 z-[70] -translate-x-1/2 -translate-y-1/2 leading-none"
              >
                <span className="relative inline-flex items-center text-[22px] font-extrabold tracking-[-0.055em] text-white">
                  Mine<span className="text-yellow-400">Note</span>

                  <span className="absolute -bottom-1 left-0 h-[2px] w-5 rounded-full bg-yellow-400" />
                </span>
              </Link>

              {/* FIXED RIGHT HAMBURGER / CLOSE */}
              <button
                type="button"
                data-mobile-navbar-control
                onClick={(event) => {
                  event.stopPropagation();
                  toggleMenu();
                }}
                aria-label={
                  menuOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
                }
                aria-expanded={menuOpen}
                aria-controls="mobile-navigation"
                className="absolute right-0 top-1/2 z-[70] flex h-11 w-11 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.04] text-zinc-200 transition-all duration-200 hover:border-yellow-400/50 hover:text-yellow-400 active:scale-95"
              >
                <span
                  className="flex h-6 w-6 items-center justify-center text-[22px] leading-none"
                  aria-hidden="true"
                >
                  {menuOpen ? "×" : "☰"}
                </span>
              </button>

            </div>
          </div>
        </nav>
      </header>

      {/* ================= MOBILE OPEN STATE ================= */}

      {menuOpen && (
        <>
          {/* Homepage blocker */}
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMenu}
            className="fixed inset-x-0 bottom-0 top-[64px] z-40 bg-black/50 md:hidden"
          />

          {/* Menu uses SAME max-width as homepage/navbar */}
          <div
            id="mobile-navigation"
            className="fixed left-0 right-0 top-[64px] z-60 overflow-hidden border-x border-b border-white/[0.08] bg-zinc-950/98 shadow-2xl shadow-black/70 md:hidden"
          >
            <div className="mx-auto max-w-7xl px-6">
              <MobileMenu setMenuOpen={setMenuOpen} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
