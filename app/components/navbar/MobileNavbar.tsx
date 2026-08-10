"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="md:hidden">

      <div className="flex items-center justify-between">

        {/* Search Icon */}
        <button className="text-2xl">
          🔍
        </button>


        {/* Center Logo */}
        <Link href="/">
          <h1 className="text-3xl font-extrabold tracking-wide text-yellow-400">
            MineNote
          </h1>
        </Link>


        {/* Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-3xl text-yellow-400"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

      </div>

    </div>
  );
}