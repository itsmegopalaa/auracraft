import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { createSupabaseAdminClient } from "@/app/lib/supabase";

export async function GET() {
  try {
    const auth = await requireAdminApi();

    if (auth.error) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status },
      );
    }

    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("shipments")
      .select(
        `
          id,
          order_id,
          status,
          shipment_id,
          courier_name,
          courier_id,
          awb,
          tracking_url,
          label_url,
          shipping_charge,
          weight_grams,
          length_cm,
          width_cm,
          height_cm,
          created_at,
          updated_at
        `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("ADMIN SHIPMENTS FETCH ERROR:", error);

      return NextResponse.json(
        { error: "Unable to load shipments." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      shipments: data ?? [],
    });
  } catch (error) {
    console.error("Admin shipments error:", error);

    return NextResponse.json(
      { error: "Unable to load shipments." },
      { status: 500 },
    );
  }
}
