"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="md:hidden px-1">

      <div className="flex items-center justify-between rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] px-4 min-h-10 py-2 backdrop-blur-xl">

        {/* Search Icon */}
        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--mn-border)] bg-[var(--mn-control-bg)] text-xl text-[var(--mn-text-secondary)] transition hover:border-[var(--mn-accent)] hover:text-[var(--mn-accent)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]">
          🔍
        </button>


        {/* Center Logo */}
        <Link href="/">
          <h1 className="text-2xl font-black tracking-[-0.04em] text-[var(--mn-text)]">
            MineNote
          </h1>
        </Link>


        {/* Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--mn-border)] bg-[var(--mn-control-bg)] text-xl text-[var(--mn-accent)] transition hover:border-[var(--mn-accent)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

      </div>

    </div>
  );
}