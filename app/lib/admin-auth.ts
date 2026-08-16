import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: isAdmin, error } = await supabase.rpc("is_admin");

  if (error || !isAdmin) {
    redirect("/");
  }

  return user;
}

export async function requireAdminApi() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      error: "Unauthorized",
      status: 401,
    };
  }

  const { data: isAdmin, error } = await supabase.rpc("is_admin");

  if (error) {
    console.error("ADMIN API AUTH RPC ERROR:", error);

    return {
      user: null,
      error: "Unable to verify admin access.",
      status: 500,
    };
  }

  if (!isAdmin) {
    return {
      user: null,
      error: "Forbidden",
      status: 403,
    };
  }

  return {
    user,
    error: null,
    status: 200,
  };
}
