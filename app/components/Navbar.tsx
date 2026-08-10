"use client";

import { useState } from "react";
import Link from "next/link";
import DesktopNavbar from "./navbar/DesktopNavbar";
import MobileSearch from "./navbar/MobileSearch";
import MobileMenu from "./navbar/MobileMenu";

export default function Navbar() {

  const [menuOpen, setMenuOpen] = useState(false);

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

          <div className="flex items-center justify-between">

            <MobileSearch />

            <Link href="/">
              <h1 className="text-3xl font-extrabold text-yellow-400">
                MineNote
              </h1>
            </Link>


            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-3xl text-yellow-400"
            >
              {menuOpen ? "✕" : "☰"}
            </button>

          </div>


          {menuOpen && (
            <MobileMenu setMenuOpen={setMenuOpen} />
          )}

        </div>


      </div>

    </nav>
  );
}