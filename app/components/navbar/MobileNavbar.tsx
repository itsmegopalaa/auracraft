"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="md:hidden px-1">

      <div className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-zinc-950/80 px-4 min-h-10 py-2 backdrop-blur-xl">

        {/* Search Icon */}
        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-xl text-zinc-200 transition hover:border-yellow-400/40 hover:text-yellow-400 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
          🔍
        </button>


        {/* Center Logo */}
        <Link href="/">
          <h1 className="text-2xl font-black tracking-[-0.04em] text-white">
            MineNote
          </h1>
        </Link>


        {/* Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-xl text-yellow-400 transition hover:border-yellow-400/40 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

      </div>

    </div>
  );
}