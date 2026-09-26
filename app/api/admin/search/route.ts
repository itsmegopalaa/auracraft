import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { createServerSupabaseClient } from "@/app/lib/supabase";

type SearchCategory =
  | "all"
  | "products"
  | "orders"
  | "inbox"
  | "customers"
  | "payments";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminApi();

    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status },
      );
    }

    const supabase = await createServerSupabaseClient();

    const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    const category =
      (request.nextUrl.searchParams.get("category") as SearchCategory) ||
      "all";

    if (!q) {
      return NextResponse.json({
        orders: [],
        products: [],
        inbox: [],
        customers: [],
        payments: [],
      });
    }

    const pattern = `%${q}%`;

    const searchOrders =
      category === "all" || category === "orders" || category === "payments";

    const searchProducts =
      category === "all" || category === "products";

    const searchInbox =
      category === "all" || category === "inbox";

    const searchCustomers =
      category === "all" || category === "customers";

    const [ordersResult, productsResult, inboxResult, customersResult] =
      await Promise.all([
        searchOrders
          ? supabase
              .from("orders")
              .select(
                "id, order_id, customer_id, name, email, phone, city, state, pin, total, payment_status, order_status, payment_method, razorpay_order_id, razorpay_payment_id, created_at"
              )
              .or(
                [
                  `order_id.ilike.${pattern}`,
                  `name.ilike.${pattern}`,
                  `email.ilike.${pattern}`,
                  `phone.ilike.${pattern}`,
                  `city.ilike.${pattern}`,
                  `state.ilike.${pattern}`,
                  `pin.ilike.${pattern}`,
                  ...(category === "payments"
                    ? [
                        `payment_method.ilike.${pattern}`,
                        `payment_status.ilike.${pattern}`,
                        `razorpay_order_id.ilike.${pattern}`,
                        `razorpay_payment_id.ilike.${pattern}`,
                      ]
                    : []),
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

        searchCustomers
          ? supabase
              .from("orders")
              .select(
                "customer_id, name, email, phone, city, state, pin, created_at"
              )
              .or(
                [
                  `name.ilike.${pattern}`,
                  `email.ilike.${pattern}`,
                  `phone.ilike.${pattern}`,
                  `city.ilike.${pattern}`,
                  `state.ilike.${pattern}`,
                  `pin.ilike.${pattern}`,
                ].join(",")
              )
              .order("created_at", { ascending: false })
              .limit(20)
          : Promise.resolve({ data: [], error: null }),
      ]);

    const orders = ordersResult.data ?? [];
    const products = productsResult.data ?? [];
    const inbox = inboxResult.data ?? [];

    const customerRows = customersResult.data ?? [];

    const customerMap = new Map<
      string,
      {
        customer_id: string | null;
        name: string;
        email: string;
        phone: string;
        city: string;
        state: string;
        pin: string;
        created_at: string;
      }
    >();

    for (const row of customerRows) {
      const key =
        row.customer_id ||
        `${row.email ?? ""}::${row.phone ?? ""}`;

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          customer_id: row.customer_id ?? null,
          name: row.name ?? "",
          email: row.email ?? "",
          phone: row.phone ?? "",
          city: row.city ?? "",
          state: row.state ?? "",
          pin: row.pin ?? "",
          created_at: row.created_at,
        });
      }
    }

    const customers = Array.from(customerMap.values());

    const payments =
      searchOrders
        ? orders.map((order) => ({
            id: order.id,
            order_id: order.order_id,
            customer_id: order.customer_id,
            name: order.name,
            email: order.email,
            total: order.total,
            payment_method: order.payment_method,
            payment_status: order.payment_status,
            razorpay_order_id: order.razorpay_order_id,
            razorpay_payment_id: order.razorpay_payment_id,
            created_at: order.created_at,
          }))
        : [];

    return NextResponse.json({
      orders,
      products,
      inbox,
      customers,
      payments,
    });
  } catch (error) {
    console.error("Admin search error:", error);

    return NextResponse.json(
      { error: "Unable to perform admin search." },
      { status: 500 }
    );
  }
}
