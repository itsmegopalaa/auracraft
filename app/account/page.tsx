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
    <main className="min-h-screen bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <div className="text-5xl">👤</div>

          <h1 className="mt-5 text-4xl font-extrabold">
            My Account
          </h1>

          <p className="mt-3 text-zinc-400">
            Welcome back to MineNote.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-yellow-400/30 bg-zinc-900 p-7">
            <p className="text-sm text-zinc-500">
              Signed in as
            </p>

            <p className="mt-2 break-all font-semibold">
              {user.email}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-7">
            <p className="text-sm text-zinc-500">
              Account
            </p>

            <p className="mt-2 font-semibold">
              Customer Account
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Link
            href="/account/orders"
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-7 transition hover:border-yellow-400/50"
          >
            <div className="text-3xl">📦</div>
            <h2 className="mt-4 text-xl font-bold">
              My Orders
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              View your MineNote order history.
            </p>
          </Link>

          <Link
            href="/track-order"
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-7 transition hover:border-yellow-400/50"
          >
            <div className="text-3xl">🔎</div>
            <h2 className="mt-4 text-xl font-bold">
              Track an Order
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Track an order using your Order ID and email.
            </p>
          </Link>
        </div>

        <div className="mt-8 flex justify-center">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
