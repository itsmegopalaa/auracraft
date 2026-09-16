"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);

    await supabase.auth.signOut();

    router.replace("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="rounded-full border border-[var(--mn-border-strong)] px-7 py-3 font-semibold text-[var(--mn-text)] transition hover:border-[var(--mn-danger)] hover:text-[var(--mn-danger)] disabled:opacity-60"
    >
      {loading ? "Signing Out..." : "Sign Out"}
    </button>
  );
}
