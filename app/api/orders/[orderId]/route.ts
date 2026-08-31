import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await context.params;

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const email = url.searchParams.get("email")?.trim().toLowerCase();

    let query = supabaseAdmin
      .from("orders")
      .select(
        `
          order_id,
          name,
          email,
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
      .eq("order_id", orderId);

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Email address is required to track an order.",
        },
        { status: 400 }
      );
    }

    query = query.eq("email", email);

    const { data: order, error } = await query.maybeSingle();

    if (error) {
      console.error("CUSTOMER ORDER API ERROR:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      return NextResponse.json(
        {
          success: false,
          error: "Unable to load order.",
        },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("CUSTOMER ORDER API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load order.",
      },
      { status: 500 }
    );
  }
}
