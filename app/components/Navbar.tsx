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

  const closeMenu = () => {
    setMenuOpen(false);

    window.setTimeout(() => {
      menuButtonRef.current?.focus();
    }, 0);
  };

  const toggleMenu = () => {
    setMenuOpen((open) => !open);
  };

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

  useEffect(() => {
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
      <header className="sticky top-0 z-50 border-b border-[var(--mn-border)] bg-[var(--mn-bg)]/95 backdrop-blur-xl">
        <nav aria-label="Main navigation">
          <div className="mn-container-wide">
            {/* DESKTOP */}
            <div className="hidden min-h-[76px] items-center gap-8 lg:flex">
              <Link
                href="/"
                aria-label="MineNote Home"
                onClick={handleHomeClick}
                className="group shrink-0"
              >
                <span className="relative inline-flex items-center text-[27px] font-black tracking-[-0.065em] text-[var(--mn-text)]">
                  MineNote
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-[var(--mn-accent)] transition-all duration-300 group-hover:w-full" />
                </span>
              </Link>

              <div className="min-w-0 flex-1">
                <DesktopNavbar />
              </div>
            </div>

            {/* TABLET + MOBILE */}
            <div
  className="relative flex h-[64px] items-center lg:hidden"
  onClick={(event) => {
    if (event.target === event.currentTarget) {
      toggleMenu();
    }
  }}
>
              <div className="absolute left-0 top-1/2 z-20 -translate-y-1/2">
                <MobileSearch onOpen={closeMenu} />
              </div>

              <Link
                href="/"
                aria-label="MineNote Home"
                onClick={handleHomeClick}
                className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 leading-none"
              >
                <span className="relative inline-flex items-center text-[22px] font-black tracking-[-0.06em] text-[var(--mn-text)]">
                  MineNote
                  <span className="absolute -bottom-1 left-0 h-px w-5 bg-[var(--mn-accent)]" />
                </span>
              </Link>

              <button
                ref={menuButtonRef}
                type="button"
                onClick={toggleMenu}
                aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={menuOpen}
                aria-controls="mobile-navigation"
                className="absolute right-0 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl border border-[var(--mn-border)] bg-[var(--mn-surface)] text-[var(--mn-text)] transition-all duration-200 hover:border-[var(--mn-text)] hover:-translate-y-[52%] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)]"
              >
                <span
                  className="text-xl leading-none"
                  aria-hidden="true"
                >
                  {menuOpen ? "×" : "☰"}
                </span>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Close navigation menu"
            tabIndex={-1}
            onClick={closeMenu}
            className="fixed inset-0 z-40 bg-[var(--mn-overlay)] backdrop-blur-[2px] lg:hidden"
          />

          <div
            ref={menuPanelRef}
            id="mobile-navigation"
            role="dialog"
            aria-label="Mobile navigation menu"
            aria-modal="true"
            className="fixed left-0 right-0 top-[64px] z-50 max-h-[calc(100vh-64px)] overflow-y-auto rounded-b-3xl border-x border-b border-[var(--mn-border)] bg-[var(--mn-surface)] shadow-[var(--mn-shadow-navbar)] lg:hidden"
          >
            <div className="mn-container-wide">
              <MobileMenu setMenuOpen={closeMenu} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
