import { errorResponse } from "@/app/lib/api-response";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/app/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json([]);
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, image, price, category")
    .eq("active", true)
    .ilike("name", `%${query}%`)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    console.error("Product search error:", error);

    return errorResponse("Unable to search products.", 500);
  }

  return NextResponse.json(data ?? []);
}
