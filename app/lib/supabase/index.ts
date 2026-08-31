export const SUPABASE_ENV_KEYS = {
  URL: "NEXT_PUBLIC_SUPABASE_URL",
  PUBLISHABLE_KEY:
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  SERVICE_ROLE_KEY:
    "SUPABASE_SERVICE_ROLE_KEY",
} as const;

export function hasSupabasePublicConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function hasSupabaseServerConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}


import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";

export async function createServerSupabaseClient() {
  return createServerClient();
}

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase server credentials are not configured."
    );
  }

  return createAdminClient(url, serviceRoleKey);
}
