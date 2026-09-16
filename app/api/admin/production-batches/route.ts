import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { createServerSupabaseClient } from "@/app/lib/supabase";

const BATCH_SELECT = `
  id,
  batch_number,
  status,
  notes,
  created_at,
  started_at,
  completed_at,
  updated_at
`;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET() {
  try {
    await requireAdminApi();

    const supabase = await createServerSupabaseClient();

    const { data: batches, error } = await supabase
      .from("production_batches")
      .select(BATCH_SELECT)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("PRODUCTION BATCH LIST ERROR:", error);

      return NextResponse.json(
        { error: "Unable to load production batches." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      batches: batches ?? [],
    });
  } catch (error) {
    console.error("PRODUCTION BATCH GET ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unable to load production batches.";

    const status =
      message.toLowerCase().includes("unauthorized")
        ? 401
        : message.toLowerCase().includes("forbidden")
          ? 403
          : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminApi();

    const body = (await request.json().catch(() => ({}))) as {
      notes?: unknown;
      orderIds?: unknown;
    };

    const notes =
      typeof body.notes === "string"
        ? body.notes.trim() || null
        : null;

    if (
      body.orderIds !== undefined &&
      !Array.isArray(body.orderIds)
    ) {
      return NextResponse.json(
        { error: "orderIds must be an array." },
        { status: 400 }
      );
    }

    const orderIds = Array.isArray(body.orderIds)
      ? body.orderIds.filter(
          (value): value is string =>
            typeof value === "string" &&
            UUID_REGEX.test(value.trim())
        )
      : [];

    if (
      Array.isArray(body.orderIds) &&
      orderIds.length !== body.orderIds.length
    ) {
      return NextResponse.json(
        { error: "One or more order IDs are invalid." },
        { status: 400 }
      );
    }

    if (orderIds.length === 0) {
      return NextResponse.json(
        { error: "At least one order is required." },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const { data: orders, error: orderError } = await supabase
      .from("orders")
      .select("id, payment_status, order_status, custom_cover_id")
      .in("id", orderIds);

    if (orderError) {
      console.error(
        "PRODUCTION BATCH ORDER VALIDATION ERROR:",
        orderError
      );

      return NextResponse.json(
        { error: "Unable to validate orders." },
        { status: 500 }
      );
    }

    if ((orders ?? []).length !== orderIds.length) {
      return NextResponse.json(
        { error: "One or more orders were not found." },
        { status: 400 }
      );
    }

    const invalidOrders = (orders ?? []).filter(
      (order) =>
        order.payment_status !== "paid" ||
        !["confirmed", "processing"].includes(order.order_status)
    );

    if (invalidOrders.length > 0) {
      return NextResponse.json(
        {
          error:
            "Only paid orders with status confirmed or processing can be added to production.",
        },
        { status: 400 }
      );
    }

    const { data: existingAssignments, error: assignmentError } =
      await supabase
        .from("production_batch_orders")
        .select("order_id")
        .in("order_id", orderIds)
        .is("completed_at", null);

    if (assignmentError) {
      console.error(
        "PRODUCTION BATCH ORDER ASSIGNMENT CHECK ERROR:",
        assignmentError
      );

      return NextResponse.json(
        { error: "Unable to check order production assignments." },
        { status: 500 }
      );
    }

    if ((existingAssignments ?? []).length > 0) {
      return NextResponse.json(
        {
          error:
            "One or more orders are already assigned to an active production batch.",
        },
        { status: 409 }
      );
    }

    const { data: batch, error: batchError } = await supabase
      .from("production_batches")
      .insert({ notes })
      .select(BATCH_SELECT)
      .single();

    if (batchError || !batch) {
      console.error(
        "PRODUCTION BATCH CREATE ERROR:",
        batchError
      );

      return NextResponse.json(
        { error: "Unable to create production batch." },
        { status: 500 }
      );
    }

    const { error: assignmentInsertError } = await supabase
      .from("production_batch_orders")
      .insert(
        orderIds.map((orderId) => ({
          batch_id: batch.id,
          order_id: orderId,
        }))
      );

    if (assignmentInsertError) {
      console.error(
        "PRODUCTION BATCH ORDER INSERT ERROR:",
        assignmentInsertError
      );

      await supabase
        .from("production_batches")
        .delete()
        .eq("id", batch.id);

      return NextResponse.json(
        { error: "Unable to add orders to the production batch." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        batch,
        orderIds,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("PRODUCTION BATCH POST ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unable to create production batch.";

    const status =
      message.toLowerCase().includes("unauthorized")
        ? 401
        : message.toLowerCase().includes("forbidden")
          ? 403
          : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
