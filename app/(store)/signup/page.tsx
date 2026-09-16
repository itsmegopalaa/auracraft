"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.replace("/account");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--mn-bg)] px-4 py-10 text-[var(--mn-text)] sm:px-6 sm:py-14 md:py-16">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center sm:mb-8">
          <Link
            href="/"
            className="mn-h2 tracking-tight text-[var(--mn-accent)]"
          >
            MineNote
          </Link>

          <h1 className="mt-6 mn-h3 tracking-tight sm:mt-8 sm:text-3xl">
            Welcome Back 👋
          </h1>

          <p className="mx-auto mt-2.5 max-w-sm text-sm leading-6 text-[var(--mn-text-muted)] sm:mt-3">
            Sign in to manage your MineNote orders.
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-5 shadow-[var(--mn-shadow-lg)] sm:p-7 md:p-9">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[var(--mn-text-secondary)]"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-[1.5rem] border border-[var(--mn-border-strong)] bg-[var(--mn-bg)] px-4 py-3.5 text-[var(--mn-text)] outline-none transition placeholder:text-[var(--mn-text-muted)] focus:border-[var(--mn-accent)] focus:ring-2 focus:ring-[var(--mn-accent-soft)] sm:px-5 sm:py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[var(--mn-text-secondary)]"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-[1.5rem] border border-[var(--mn-border-strong)] bg-[var(--mn-bg)] px-4 py-3.5 pr-14 text-[var(--mn-text)] outline-none transition placeholder:text-[var(--mn-text-muted)] focus:border-[var(--mn-accent)] focus:ring-2 focus:ring-[var(--mn-accent-soft)] sm:px-5 sm:py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
                  placeholder="Your password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 flex h-11 w-10 -translate-y-1/2 items-center justify-center rounded-[1.25rem] text-xl text-[var(--mn-text-secondary)] transition hover:bg-[var(--mn-accent-soft)] hover:text-[var(--mn-accent)] sm:right-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-[1.5rem] border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[var(--mn-accent)] px-6 py-4 font-bold text-[var(--mn-accent-contrast)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
            >
              {loading ? "Signing In..." : "Sign In →"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--mn-text-muted)] sm:mt-7">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-[var(--mn-accent)] hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
