import AdminNav from "@/app/admin/components/AdminNav";
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
    <div className="min-h-screen bg-zinc-50">
      {user ? (
        <AdminNav
          unreadInboxCount={unreadInboxCount}
          userEmail={user.email ?? ""}
        />
      ) : null}

      {children}
    </div>
  );
}
