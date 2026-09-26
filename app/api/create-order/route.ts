import { NextResponse } from "next/server";
import { calculateOrder } from "@/app/lib/order-pricing";
import { createServerSupabaseClient } from "@/app/lib/supabase";
import { createSupabaseAdminClient } from "@/app/lib/supabase";
import { createRazorpayOrder } from "@/app/services/payments";

const supabaseAdmin = createSupabaseAdminClient();

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to make an online payment." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      items,
      name,
      phone,
      email,
      address,
      city,
      state,
      pin,
      customCoverId,
    } = body;

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      !name ||
      !phone ||
      !email ||
      !address ||
      !city ||
      !state ||
      !pin
    ) {
      return NextResponse.json(
        { error: "Missing required checkout information." },
        { status: 400 }
      );
    }

    let calculatedOrder;

    try {
      calculatedOrder = await calculateOrder(items);
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Invalid cart.",
        },
        { status: 400 }
      );
    }

    const customCoverIds = Array.from(
      new Set(
        items
          .map((item) =>
            item &&
            typeof item === "object" &&
            "customCoverId" in item
              ? String(
                  (item as { customCoverId?: unknown }).customCoverId ?? ""
                ).trim()
              : ""
          )
          .filter(Boolean)
      )
    );

    if (customCoverIds.length > 1) {
      return NextResponse.json(
        { error: "Only one custom cover can be attached to an order." },
        { status: 400 }
      );
    }

    const resolvedCustomCoverId =
      customCoverIds[0] ??
      (customCoverId ? String(customCoverId).trim() : null);

    let customCoverSnapshot = null;

    if (resolvedCustomCoverId) {
      const { data: customization, error: customizationError } =
        await supabaseAdmin
          .from("custom_cover_customizations")
          .select(
            "id, customer_id, product_id, template_id, creation_method, status, version, customer_name, customer_text, design, print_spec, physical_config"
          )
          .eq("id", resolvedCustomCoverId)
          .eq("customer_id", user.id)
          .eq("status", "customer_approved")
          .single();

      if (customizationError || !customization) {
        return NextResponse.json(
          { error: "Custom cover is not approved for ordering." },
          { status: 400 }
        );
      }

      const { data: assets, error: assetsError } =
        await supabaseAdmin
          .from("custom_cover_assets")
          .select(
            "id, side, kind, storage_path, width, height, mime_type, file_size"
          )
          .eq("customization_id", resolvedCustomCoverId)
          .in("kind", ["original", "preview"]);

      if (assetsError) {
        return NextResponse.json(
          { error: "Unable to load custom cover assets." },
          { status: 500 }
        );
      }

      customCoverSnapshot = {
        customization,
        assets: assets ?? [],
        pricing: {
          items: calculatedOrder.items,
          subtotal: calculatedOrder.subtotal,
          customCoverFee: calculatedOrder.customCoverFee,
          total: calculatedOrder.total,
        },
      };
    }

    const mineNoteOrderId =
      `MN${Date.now().toString().slice(-8)}${Math.floor(
        Math.random() * 1000
      )
        .toString()
        .padStart(3, "0")}`;

    const amount = Math.round(calculatedOrder.total * 100);

    if (!Number.isInteger(amount) || amount < 100) {
      return NextResponse.json(
        { error: "Invalid payment amount." },
        { status: 400 }
      );
    }

    /*
     * Create the Razorpay order first so the intent can reference
     * the real gateway order ID.
     */
    let razorpayOrder;

    try {
      razorpayOrder = await createRazorpayOrder({
        amount,
        receipt: mineNoteOrderId,
        customerId: user.id,
        mineNoteOrderId,
      });
    } catch (error) {
      console.error("Razorpay create order service error:", error);

      const status =
        error &&
        typeof error === "object" &&
        "status" in error &&
        typeof error.status === "number"
          ? error.status
          : 502;

      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Unable to create Razorpay order.",
        },
        {
          status:
            status >= 400 && status < 600
              ? status
              : 502,
        }
      );
    }

    /*
     * Immutable recovery snapshot.
     *
     * This exists before the customer pays. If the browser disappears
     * after payment, the Razorpay webhook can still reconstruct the
     * final MineNote order from this record.
     */
    const { error: intentError } = await supabaseAdmin
      .from("payment_intents")
      .insert({
        razorpay_order_id: razorpayOrder.order_id,
        mine_note_order_id: mineNoteOrderId,
        customer_id: user.id,

        status: "created",
        payment_status: "pending",

        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,

        name: String(name).trim(),
        phone: String(phone).trim(),
        email: String(email).trim(),
        address: String(address).trim(),
        city: String(city).trim(),
        state: String(state).trim(),
        pin: String(pin).trim(),

        payment_method: "Razorpay",

        items: calculatedOrder.items,
        total: calculatedOrder.total,

        custom_cover_id: resolvedCustomCoverId,
        custom_cover_snapshot: customCoverSnapshot,

        delivery: "3-5 Working Days",
      });

    if (intentError) {
      console.error("PAYMENT INTENT CREATE ERROR:", intentError);

      return NextResponse.json(
        {
          error:
            "Unable to prepare payment recovery. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      order_id: razorpayOrder.order_id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      items: calculatedOrder.items,
      total: calculatedOrder.total,
      mineNoteOrderId,
    });
  } catch (error: unknown) {
    console.error("Razorpay create order error:", {
      message:
        error instanceof Error
          ? error.message
          : "Unknown error",
      name:
        error instanceof Error
          ? error.name
          : "Unknown",
    });

    return NextResponse.json(
      { error: "Unable to create payment order." },
      { status: 500 }
    );
  }
}
