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
    <main className="min-h-screen overflow-x-hidden bg-black px-4 py-12 text-white sm:px-6 md:py-20 sm:px-6 sm:py-16 md:py-24">
      <div className="mx-auto w-full max-w-4xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.06] text-4xl shadow-lg shadow-yellow-400/5 sm:h-18 sm:w-18 sm:text-5xl">👤</div>

          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            My Account
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500 sm:text-base">
            Welcome back to MineNote.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-yellow-400/20 bg-zinc-900 p-5 shadow-xl shadow-black/10 sm:p-6 md:p-7">
            <p className="text-sm text-zinc-500">
              Signed in as
            </p>

            <p className="mt-2 font-semibold">
              {user.user_metadata?.full_name || user.email}
            </p>

            {user.email && (
              <p className="mt-1 break-all text-sm text-zinc-500">
                {user.email}
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-white/[0.07] bg-zinc-900 p-5 shadow-xl shadow-black/10 sm:p-6 md:p-7">
            <p className="text-sm text-zinc-500">
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
            className="group rounded-3xl border border-white/[0.07] bg-zinc-900 p-5 shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-0.5 hover:border-yellow-400/30 sm:p-6 md:p-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <div className="text-3xl">📦</div>
            <h2 className="mt-4 text-xl font-black group-hover:text-yellow-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
              My Orders
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              View your MineNote order history.
            </p>
          </Link>

          <Link
            href="/track-order"
            className="group rounded-3xl border border-white/[0.07] bg-zinc-900 p-5 shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-0.5 hover:border-yellow-400/30 sm:p-6 md:p-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <div className="text-3xl">🔎</div>
            <h2 className="mt-4 text-xl font-black group-hover:text-yellow-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
              Track an Order
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
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
