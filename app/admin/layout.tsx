import AdminNav from "@/app/admin/components/AdminNav";
import AdminThemeProvider from "@/app/admin/components/AdminThemeProvider";
import { createClient } from "@/utils/supabase/server";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let unreadInboxCount = 0;

  if (user) {
    const { count } = await supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false);

    unreadInboxCount = count ?? 0;
  }

  return (
    <AdminThemeProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
        {user ? (
          <AdminNav
            unreadInboxCount={unreadInboxCount}
            userEmail={user.email ?? ""}
          />
        ) : null}

        {children}
      </div>
    </AdminThemeProvider>
  );
}
