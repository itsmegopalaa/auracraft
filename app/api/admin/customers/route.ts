import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const auth = await requireAdminApi();

  if (auth.error) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status },
    );
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q")?.trim().toLowerCase() ?? "";

  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id, order_id, customer_id, name, email, phone, address, city, state, pin, total, payment_status, order_status, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(2000);

  if (error) {
    console.error("Admin customers query failed:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load customers." },
      { status: 500 },
    );
  }

  const customers = new Map<
    string,
    {
      customer_id: string | null;
      name: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      pin: string;
      order_count: number;
      paid_order_count: number;
      lifetime_value: number;
      last_order_at: string;
      orders: Array<{
        id: string;
        order_id?: string;
        total: number;
        payment_status: string;
        order_status: string;
        created_at: string;
      }>;
    }
  >();

  for (const order of orders ?? []) {
    const key =
      order.customer_id ||
      `${String(order.email ?? "").trim().toLowerCase()}::${String(
        order.phone ?? "",
      ).trim()}`;

    if (!key) continue;

    const existing = customers.get(key);

    if (!existing) {
      customers.set(key, {
        customer_id: order.customer_id,
        name: order.name ?? "Unknown customer",
        email: order.email ?? "",
        phone: order.phone ?? "",
        address: order.address ?? "",
        city: order.city ?? "",
        state: order.state ?? "",
        pin: order.pin ?? "",
        order_count: 1,
        paid_order_count:
          order.payment_status === "paid" ? 1 : 0,
        lifetime_value:
          order.payment_status === "paid"
            ? Number(order.total ?? 0)
            : 0,
        last_order_at: order.created_at,
        orders: [
          {
            id: order.id,
            order_id: order.order_id,
            total: Number(order.total ?? 0),
            payment_status: order.payment_status,
            order_status: order.order_status,
            created_at: order.created_at,
          },
        ],
      });
    } else {
      existing.order_count += 1;

      if (order.payment_status === "paid") {
        existing.paid_order_count += 1;
        existing.lifetime_value += Number(order.total ?? 0);
      }

      existing.orders.push({
        id: order.id,
        total: Number(order.total ?? 0),
        payment_status: order.payment_status,
        order_status: order.order_status,
        created_at: order.created_at,
      });
    }
  }

  let result = Array.from(customers.values());

  if (search) {
    result = result.filter((customer) =>
      [
        customer.name,
        customer.email,
        customer.phone,
        customer.city,
        customer.state,
        customer.pin,
        customer.customer_id,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search),
    );
  }

  result.sort(
    (a, b) =>
      new Date(b.last_order_at).getTime() -
      new Date(a.last_order_at).getTime(),
  );

  return NextResponse.json({
    success: true,
    customers: result.slice(0, 500),
  });
}
