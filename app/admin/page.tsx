import { requireAdmin } from "@/app/lib/admin-auth";

export default async function AdminPage() {
  const user = await requireAdmin();

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">MineNote Admin</h1>

      <p className="mt-4 text-zinc-600">
        Admin access confirmed.
      </p>

      <p className="mt-2 text-sm text-zinc-500">
        Signed in as: {user.email}
      </p>
    </main>
  );
}
