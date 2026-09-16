import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { createSupabaseAdminClient } from "@/app/lib/supabase";

export async function GET() {
  try {
    await requireAdminApi();
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
          shipping_charge,
          weight_grams,
          length_cm,
          width_cm,
          height_cm,
          created_at,
          updated_at
        `
      )
      .eq("status", "ready_for_pickup")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("READY SHIPMENTS FETCH ERROR:", error);

      return NextResponse.json(
        { error: "Unable to load ready shipments." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      shipments: data ?? [],
    });
  } catch (error) {
    console.error("Admin ready shipments error:", error);

    return NextResponse.json(
      { error: "Unable to load ready shipments." },
      { status: 500 }
    );
  }
}
