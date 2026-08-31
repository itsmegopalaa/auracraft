"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DesktopNavbar from "./navbar/DesktopNavbar";
import MobileSearch from "./navbar/MobileSearch";
import MobileMenu from "./navbar/MobileMenu";

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  const openMenu = () => {
    setMenuOpen(true);
  };

  const closeMenu = () => {
    setMenuOpen(false);

    window.setTimeout(() => {
      menuButtonRef.current?.focus();
    }, 0);
  };

  const handleHomeClick = (
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    event.preventDefault();
    closeMenu();

    // Already on homepage:
    // smoothly scroll all the way back to the top.
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

    // Any other page:
    // navigate to homepage, then the homepage starts at the top.
    router.push("/");
  };

  useEffect(() => {
    // Keep homepage navigation warm so logo/Home taps feel instant.
    router.prefetch("/");
  }, [router]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      const panel = menuPanelRef.current;

      if (!panel) return;

      const firstFocusable = panel.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      firstFocusable?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab") return;

      const panel = menuPanelRef.current;

      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter(
        (element) =>
          !element.hasAttribute("disabled") &&
          element.getAttribute("aria-hidden") !== "true"
      );

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-black/90 backdrop-blur-2xl">
        <nav aria-label="Main navigation">
          {/* EXACT SAME CONTAINER AS HOMEPAGE */}
          <div className="mx-auto max-w-7xl px-6">

            {/* DESKTOP */}
            <div className="hidden h-[72px] items-center gap-8 lg:flex">
              <Link
                href="/"
                aria-label="MineNote Home"
                onClick={handleHomeClick}
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

            {/* MOBILE */}
            <div className="relative flex h-[64px] items-center lg:hidden">

              {/* BLANK HEADER AREAS — MENU TOGGLE */}
              <button
                type="button"
                aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                onClick={() => {
                  if (menuOpen) {
                    closeMenu();
                  } else {
                    openMenu();
                  }
                }}
                className="absolute inset-0 z-[50] cursor-pointer bg-transparent"
              />

              {/* HEADER CONTROLS */}
              <div className="pointer-events-none absolute inset-0 z-[70]">

                {/* Search remains independently clickable */}
                <div className="pointer-events-auto absolute left-0 top-1/2 -translate-y-1/2">
                  <MobileSearch
                    onOpen={() => {
                      closeMenu();
                    }}
                  />
                </div>

                {/* Logo remains independently clickable */}
                <Link
                  href="/"
                  aria-label="MineNote Home"
                  onClick={handleHomeClick}
                  className="pointer-events-auto absolute left-1/2 top-1/2 max-w-[calc(100%-112px)] -translate-x-1/2 -translate-y-1/2 leading-none"
                >
                  <span className="relative inline-flex items-center text-[22px] font-extrabold tracking-[-0.055em] text-white">
                    Mine<span className="text-yellow-400">Note</span>

                    <span className="absolute -bottom-1 left-0 h-[2px] w-5 rounded-full bg-yellow-400" />
                  </span>
                </Link>

                {/* Hamburger remains independently clickable */}
                <button
                  ref={menuButtonRef}
                  type="button"
                  onClick={() => {
                    if (menuOpen) {
                      closeMenu();
                    } else {
                      openMenu();
                    }
                  }}
                  aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                  aria-expanded={menuOpen}
                  aria-controls="mobile-navigation"
                  className="pointer-events-auto absolute right-0 top-1/2 flex h-10 w-10 shrink-0 -translate-y-1/2 touch-manipulation cursor-pointer items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.035] p-0 text-zinc-200 shadow-sm shadow-black/20 transition-all duration-200 hover:border-yellow-400/50 hover:bg-yellow-400/[0.05] hover:text-yellow-400 active:scale-95"
                >
                  <span
                    className="flex h-5 w-5 items-center justify-center text-[20px] leading-none"
                    aria-hidden="true"
                  >
                    {menuOpen ? "×" : "☰"}
                  </span>
                </button>

              </div>

              {/* SEARCH — independent control */}
              <div
                className="absolute left-0 top-1/2 z-[70] -translate-y-1/2"
                data-mobile-navbar-control
              >
                <MobileSearch
                  onOpen={() => {
                    closeMenu();
                  }}
                />
              </div>

              {/* EXACT CENTER LOGO */}
              <Link
                href="/"
                aria-label="MineNote Home"
                onClick={handleHomeClick}
                className="absolute left-1/2 top-1/2 z-[70] max-w-[calc(100%-112px)] -translate-x-1/2 -translate-y-1/2 leading-none"
              >
                <span className="relative inline-flex items-center text-[22px] font-extrabold tracking-[-0.055em] text-white">
                  Mine<span className="text-yellow-400">Note</span>

                  <span className="absolute -bottom-1 left-0 h-[2px] w-5 rounded-full bg-yellow-400" />
                </span>
              </Link>

              {/* HAMBURGER — ONLY MENU TRIGGER */}
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => {
                  if (menuOpen) {
                    closeMenu();
                  } else {
                    openMenu();
                  }
                }}
                aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={menuOpen}
                aria-controls="mobile-navigation"
                className="absolute right-0 top-1/2 z-[70] flex h-10 w-10 shrink-0 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.035] text-zinc-200 shadow-sm shadow-black/20 transition-all duration-200 hover:border-yellow-400/50 hover:bg-yellow-400/[0.05] hover:text-yellow-400 active:scale-95"
              >
                <span
                  className="flex h-5 w-5 items-center justify-center text-[20px] leading-none"
                  aria-hidden="true"
                >
                  {menuOpen ? "×" : "☰"}
                </span>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* MOBILE MENU */}
      {menuOpen && (
        <>
          {/* Outside-menu close layer */}
          <button
            type="button"
            aria-label="Close navigation menu"
            tabIndex={-1}
            onClick={closeMenu}
            className="fixed inset-x-0 bottom-0 top-[64px] z-[40] cursor-default bg-black/50 outline-none lg:hidden"
          />

          {/* MENU */}
          <div
            ref={menuPanelRef}
            id="mobile-navigation"
            role="dialog"
            aria-label="Mobile navigation menu"
            aria-modal="true"
            className="fixed left-0 right-0 top-[64px] z-[60] overflow-hidden rounded-b-3xl border-x border-b border-white/[0.10] bg-zinc-950/98 shadow-2xl shadow-black/70 lg:hidden"
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
