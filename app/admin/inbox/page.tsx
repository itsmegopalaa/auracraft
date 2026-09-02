import { requireAdmin } from "@/app/lib/admin-auth";
import { createClient } from "@/utils/supabase/server";
import InboxMessages from "./InboxMessages";

export default async function AdminInboxPage() {
  await requireAdmin();

  const supabase = await createClient();

  const { data: messages, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, message, is_read, created_at, read_at")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-7 md:px-8 md:py-8">
        <header className="border-b border-zinc-200 pb-5 dark:border-zinc-800 sm:pb-6">
          <p className="text-sm font-medium text-yellow-600">
            MineNote Admin
          </p>

          <h1 className="mt-1 text-xl font-bold sm:text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-100">
            Inbox
          </h1>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Customer messages from the MineNote contact form.
          </p>
        </header>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 sm:mt-8 sm:p-6">
            <h2 className="font-semibold text-red-800">
              Unable to load messages
            </h2>

            <pre className="mt-4 whitespace-pre-wrap text-sm text-red-700">
              {error.message}
            </pre>
          </div>
        ) : (
          <div className="mt-6 sm:mt-8">
            <InboxMessages messages={messages ?? []} />
          </div>
        )}
      </div>
    </main>
  );
}
