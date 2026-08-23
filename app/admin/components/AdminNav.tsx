"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AdminNav() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);

    await supabase.auth.signOut();

    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <nav className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link
            href="/admin"
            className="text-lg font-bold text-zinc-900"
          >
            MineNote Admin
          </Link>

          <div className="hidden items-center gap-5 sm:flex">
            <Link
              href="/admin"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              Dashboard
            </Link>

            <Link
              href="/admin/orders"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              Orders
            </Link>

            <Link
              href="/admin/products"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              Products
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={loading}
          className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </nav>
  );
}
