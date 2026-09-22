import { requireAdmin } from "@/app/lib/admin-auth";

export default async function AdminSectionPage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 dark:bg-zinc-950 sm:px-6 sm:py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
            Admin Control Center
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
                Payments
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                Payment status, transaction references, refunds, and payment exceptions.
              </p>
            </div>

            <span className="w-fit rounded-full bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300">
              Coming next
            </span>
          </div>

          <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 dark:border-zinc-700 dark:bg-zinc-950">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Section structure ready.
            </p>

            <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              This protected Admin surface is ready for its operational
              control center. Admin approval will remain required for
              sensitive or destructive actions.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
