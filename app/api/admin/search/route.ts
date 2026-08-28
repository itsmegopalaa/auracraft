import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    const supabase = accessToken
      ? createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
            cookies: {
              getAll() {
                return [];
              },
              setAll() {},
            },
          }
        )
      : await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: isAdmin, error: adminError } =
      await supabase.rpc("is_admin");

    if (adminError) {
      console.error("ADMIN SEARCH AUTH RPC ERROR:", adminError);

      return NextResponse.json(
        { error: "Unable to verify admin access." },
        { status: 500 }
      );
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }
    const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    const category =
      request.nextUrl.searchParams.get("category")?.trim() ?? "all";

    if (!q) {
      return NextResponse.json({
        orders: [],
        products: [],
        inbox: [],
      });
    }

    const pattern = `%${q}%`;

    const searchOrders =
      category === "all" || category === "orders";

    const searchProducts =
      category === "all" || category === "products";

    const searchInbox =
      category === "all" || category === "inbox";

    const [ordersResult, productsResult, inboxResult] = await Promise.all([
      searchOrders
        ? supabase
            .from("orders")
            .select(
              "id, order_id, name, email, phone, city, state, payment_method, payment_status, order_status, total, created_at"
            )
            .or(
              [
                `order_id.ilike.${pattern}`,
                `name.ilike.${pattern}`,
                `email.ilike.${pattern}`,
                `phone.ilike.${pattern}`,
                `city.ilike.${pattern}`,
                `state.ilike.${pattern}`,
              ].join(",")
            )
            .order("created_at", { ascending: false })
            .limit(20)
        : Promise.resolve({ data: [], error: null }),

      searchProducts
        ? supabase
            .from("products")
        .select(
          "id, name, category, theme, badge, price, stock, active, featured, image"
        )
        .or(
          [
            `name.ilike.${pattern}`,
            `category.ilike.${pattern}`,
            `theme.ilike.${pattern}`,
            `badge.ilike.${pattern}`,
          ].join(",")
        )
        .order("created_at", { ascending: false })
            .limit(20)
        : Promise.resolve({ data: [], error: null }),

      searchInbox
        ? supabase
            .from("contact_messages")
        .select("id, name, email, message, is_read, created_at, read_at")
        .or(
          [
            `name.ilike.${pattern}`,
            `email.ilike.${pattern}`,
            `message.ilike.${pattern}`,
          ].join(",")
        )
        .order("created_at", { ascending: false })
            .limit(20)
        : Promise.resolve({ data: [], error: null }),
    ]);

    return NextResponse.json({
      orders: ordersResult.data ?? [],
      products: productsResult.data ?? [],
      inbox: inboxResult.data ?? [],
    });
  } catch (error) {
    console.error("Admin search error:", error);

    return NextResponse.json(
      { error: "Unable to perform admin search." },
      { status: 500 }
    );
  }
}
