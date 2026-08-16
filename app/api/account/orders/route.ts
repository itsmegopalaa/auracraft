import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be signed in to view your orders.",
        },
        { status: 401 }
      );
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select(
        `
          order_id,
          payment_method,
          payment_status,
          paid_at,
          order_status,
          items,
          total,
          delivery,
          shipping_partner,
          tracking_id,
          tracking_url,
          shipped_at,
          delivered_at,
          created_at
        `
      )
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("CUSTOMER ORDERS API ERROR:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      return NextResponse.json(
        {
          success: false,
          error: "Unable to load your orders.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orders: orders ?? [],
    });
  } catch (error) {
    console.error("CUSTOMER ORDERS API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load your orders.",
      },
      { status: 500 }
    );
  }
}
