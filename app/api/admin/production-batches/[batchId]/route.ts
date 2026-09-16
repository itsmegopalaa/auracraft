import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { createSupabaseAdminClient } from "@/app/lib/supabase";

const BATCH_SELECT =
  "id,batch_number,status,notes,created_at,started_at,completed_at,updated_at";

const VALID_STATUSES = new Set([
  "draft",
  "in_progress",
  "completed",
  "cancelled",
]);

type RouteContext = {
  params: Promise<{ batchId: string }>;
};

export async function GET(
  _request: NextRequest,
  { params }: RouteContext,
) {
  try {
    await requireAdminApi();

    const { batchId } = await params;
    const supabase = createSupabaseAdminClient();

    const { data: batch, error: batchError } = await supabase
      .from("production_batches")
      .select(BATCH_SELECT)
      .eq("id", batchId)
      .single();

    if (batchError || !batch) {
      return NextResponse.json(
        { error: "Production batch not found" },
        { status: 404 },
      );
    }

    const { data: assignments, error: assignmentsError } = await supabase
      .from("production_batch_orders")
      .select(
        `
          id,
          order_id,
          added_at,
          completed_at,
          orders (
            id,
            order_id,
            name,
            payment_status,
            order_status,
            total,
            custom_cover_id,
            product_printed,
            cover_verified,
            notebook_assembled,
            quality_checked,
            packed,
            production_checklist_updated_at,
            production_completed_at
          )
        `,
      )
      .eq("batch_id", batchId)
      .order("added_at", { ascending: true });

    if (assignmentsError) {
      return NextResponse.json(
        { error: assignmentsError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      batch,
      orders: assignments ?? [],
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unauthorized";

    const status =
      message.toLowerCase().includes("forbidden")
        ? 403
        : message.toLowerCase().includes("unauthorized")
          ? 401
          : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    await requireAdminApi();

    const { batchId } = await params;
    const body = await request.json().catch(() => ({}));

    const supabase = createSupabaseAdminClient();

    const { data: existing, error: existingError } = await supabase
      .from("production_batches")
      .select(BATCH_SELECT)
      .eq("id", batchId)
      .single();

    if (existingError || !existing) {
      return NextResponse.json(
        { error: "Production batch not found" },
        { status: 404 },
      );
    }

    const updates: Record<string, unknown> = {};

    if (typeof body.notes === "string" || body.notes === null) {
      updates.notes = body.notes;
    }

    if (body.status !== undefined) {
      if (
        typeof body.status !== "string" ||
        !VALID_STATUSES.has(body.status)
      ) {
        return NextResponse.json(
          { error: "Invalid batch status" },
          { status: 400 },
        );
      }

      const current = existing.status;
      const next = body.status;

      if (current === "completed") {
        return NextResponse.json(
          { error: "Completed batches are locked" },
          { status: 409 },
        );
      }

      if (current === "cancelled") {
        return NextResponse.json(
          { error: "Cancelled batches are locked" },
          { status: 409 },
        );
      }

      if (next === "draft" && current !== "draft") {
        return NextResponse.json(
          { error: "A batch cannot return to draft" },
          { status: 409 },
        );
      }

      if (next === "in_progress" && current !== "draft") {
        return NextResponse.json(
          { error: "Only draft batches can start" },
          { status: 409 },
        );
      }

      if (next === "completed" && current !== "in_progress") {
        return NextResponse.json(
          { error: "Only in-progress batches can be completed" },
          { status: 409 },
        );
      }

      if (next === "in_progress") {
        updates.started_at = new Date().toISOString();
      }

      if (next === "completed") {
        const { data: assignments, error: assignmentsError } =
          await supabase
            .from("production_batch_orders")
            .select(
              `
                order_id,
                orders (
                  product_printed,
                  cover_verified,
                  notebook_assembled,
                  quality_checked,
                  packed,
                  production_completed_at
                )
              `,
            )
            .eq("batch_id", batchId);

        if (assignmentsError) {
          return NextResponse.json(
            { error: assignmentsError.message },
            { status: 500 },
          );
        }

        if (!assignments || assignments.length === 0) {
          return NextResponse.json(
            { error: "A batch cannot be completed without orders" },
            { status: 409 },
          );
        }

        const incomplete = assignments.filter((assignment) => {
          const order = Array.isArray(assignment.orders)
            ? assignment.orders[0]
            : assignment.orders;

          return !(
            order?.product_printed &&
            order?.cover_verified &&
            order?.notebook_assembled &&
            order?.quality_checked &&
            order?.packed &&
            order?.production_completed_at
          );
        });

        if (incomplete.length > 0) {
          return NextResponse.json(
            {
              error:
                "All orders must complete the production checklist before the batch can be completed",
              incompleteOrderCount: incomplete.length,
            },
            { status: 409 },
          );
        }

        updates.completed_at = new Date().toISOString();
      }

      if (next === "cancelled") {
        updates.completed_at = null;
      }

      updates.status = next;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ batch: existing });
    }

    updates.updated_at = new Date().toISOString();

    const { data: batch, error: updateError } = await supabase
      .from("production_batches")
      .update(updates)
      .eq("id", batchId)
      .select(BATCH_SELECT)
      .single();

    if (updateError || !batch) {
      return NextResponse.json(
        { error: updateError?.message ?? "Failed to update batch" },
        { status: 500 },
      );
    }

    return NextResponse.json({ batch });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unauthorized";

    const status =
      message.toLowerCase().includes("forbidden")
        ? 403
        : message.toLowerCase().includes("unauthorized")
          ? 401
          : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext,
) {
  try {
    await requireAdminApi();

    const { batchId } = await params;
    const supabase = createSupabaseAdminClient();

    const { data: existing, error: existingError } = await supabase
      .from("production_batches")
      .select("id,status")
      .eq("id", batchId)
      .single();

    if (existingError || !existing) {
      return NextResponse.json(
        { error: "Production batch not found" },
        { status: 404 },
      );
    }

    if (existing.status !== "draft") {
      return NextResponse.json(
        {
          error:
            "Only draft batches can be deleted. Cancel the batch instead.",
        },
        { status: 409 },
      );
    }

    const { error: deleteError } = await supabase
      .from("production_batches")
      .delete()
      .eq("id", batchId);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unauthorized";

    const status =
      message.toLowerCase().includes("forbidden")
        ? 403
        : message.toLowerCase().includes("unauthorized")
          ? 401
          : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
