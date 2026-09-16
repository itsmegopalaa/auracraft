import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SignOutButton from "./SignOutButton";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--mn-bg)] px-4 py-12 text-[var(--mn-text)] sm:px-6 md:py-[clamp(5rem,8vw,7.5rem)] sm:px-6 sm:py-16 md:py-24">
      <div className="mx-auto w-full max-w-4xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-[var(--mn-accent)] bg-[var(--mn-accent-soft)] text-4xl shadow-[var(--mn-shadow-sm)] sm:h-18 sm:w-18 sm:text-5xl">👤</div>

          <h1 className="mt-5 mn-h2 tracking-tight sm:text-4xl md:text-5xl">
            My Account
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--mn-text-muted)] sm:text-base">
            Welcome back to MineNote.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-[var(--mn-accent)] bg-[var(--mn-surface)] p-5 shadow-[var(--mn-shadow-sm)] sm:p-[var(--mn-space-card)] md:p-7">
            <p className="text-[15px] text-[var(--mn-text-secondary)]">
              Signed in as
            </p>

            <p className="mt-2 font-semibold">
              {user.user_metadata?.full_name || user.email}
            </p>

            {user.email && (
              <p className="mt-1 break-all text-[15px] text-[var(--mn-text-secondary)]">
                {user.email}
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-5 shadow-[var(--mn-shadow-sm)] sm:p-[var(--mn-space-card)] md:p-7">
            <p className="text-[15px] text-[var(--mn-text-secondary)]">
              Account
            </p>

            <p className="mt-2 font-semibold">
              Customer Account
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:mt-6 sm:grid-cols-2 md:gap-5">
          <Link
            href="/account/orders"
            className="group rounded-3xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-5 shadow-[var(--mn-shadow-sm)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--mn-accent)] sm:p-[var(--mn-space-card)] md:p-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
          >
            <div className="text-3xl">📦</div>
            <h2 className="mt-4 text-xl font-black group-hover:text-[var(--mn-accent)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]">
              My Orders
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--mn-text-muted)]">
              View your MineNote order history.
            </p>
          </Link>

          <Link
            href="/track-order"
            className="group rounded-3xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-5 shadow-[var(--mn-shadow-sm)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--mn-accent)] sm:p-[var(--mn-space-card)] md:p-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
          >
            <div className="text-3xl">🔎</div>
            <h2 className="mt-4 text-xl font-black group-hover:text-[var(--mn-accent)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]">
              Track an Order
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--mn-text-muted)]">
              Track an order using your Order ID and email.
            </p>
          </Link>
        </div>

        <div className="mt-6 flex justify-center sm:mt-8">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
