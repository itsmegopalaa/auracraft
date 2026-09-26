import { NextResponse } from "next/server";

import { requireAdminApi } from "@/app/lib/admin-auth";
import { logAdminAction } from "@/app/lib/admin-audit";
import { createSupabaseAdminClient } from "@/app/lib/supabase";

type RouteContext = {
  params: Promise<{
    customizationId: string;
  }>;
};

type Decision =
  | "approve_for_print"
  | "reject"
  | "send_to_review";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

export async function POST(
  request: Request,
  { params }: RouteContext,
) {
  const auth = await requireAdminApi();

  if (auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status },
    );
  }

  const { customizationId } = await params;

  if (!isUuid(customizationId)) {
    return NextResponse.json(
      { error: "Invalid customization ID." },
      { status: 400 },
    );
  }

  let body: { decision?: Decision; reason?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const decision = body.decision;

  if (
    decision !== "approve_for_print" &&
    decision !== "reject" &&
    decision !== "send_to_review"
  ) {
    return NextResponse.json(
      { error: "Invalid Admin decision." },
      { status: 400 },
    );
  }

  const reason =
    typeof body.reason === "string"
      ? body.reason.trim()
      : "";

  if (decision === "reject" && reason.length < 3) {
    return NextResponse.json(
      { error: "A rejection reason is required." },
      { status: 400 },
    );
  }

  try {
    const supabase = createSupabaseAdminClient();

    const { data: customization, error: lookupError } = await supabase
      .from("custom_cover_customizations")
      .select(
        "id, status, customer_approved_at, admin_approved_at, admin_approved_by, rejection_reason",
      )
      .eq("id", customizationId)
      .single();

    if (lookupError || !customization) {
      return NextResponse.json(
        { error: "Customization not found." },
        { status: 404 },
      );
    }

    if (
      decision === "approve_for_print" &&
      !["customer_approved", "admin_review"].includes(
        customization.status,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Only customer-approved custom covers can be approved for print.",
        },
        { status: 409 },
      );
    }

    if (
      decision === "send_to_review" &&
      !["customer_approved", "rejected"].includes(
        customization.status,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "This customization cannot be moved back to Admin review.",
        },
        { status: 409 },
      );
    }

    if (
      decision === "reject" &&
      !["customer_approved", "admin_review"].includes(
        customization.status,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Only pending Admin-review custom covers can be rejected.",
        },
        { status: 409 },
      );
    }

    const now = new Date().toISOString();

    const update =
      decision === "approve_for_print"
        ? {
            status: "approved_for_print",
            admin_approved_by: auth.user!.id,
            admin_approved_at: now,
            rejection_reason: null,
            updated_at: now,
          }
        : decision === "reject"
          ? {
              status: "rejected",
              rejection_reason: reason,
              admin_approved_by: null,
              admin_approved_at: null,
              updated_at: now,
            }
          : {
              status: "admin_review",
              rejection_reason: null,
              admin_approved_by: null,
              admin_approved_at: null,
              updated_at: now,
            };

    const { data: updated, error: updateError } = await supabase
      .from("custom_cover_customizations")
      .update(update)
      .eq("id", customizationId)
      .select(
        "id, status, admin_approved_by, admin_approved_at, rejection_reason, updated_at",
      )
      .single();

    if (updateError || !updated) {
      console.error(
        "ADMIN CUSTOM COVER DECISION FAILED:",
        updateError,
      );

      return NextResponse.json(
        { error: "Unable to update custom cover status." },
        { status: 500 },
      );
    }

    await logAdminAction({
      adminUserId: auth.user?.id ?? null,
      source: "admin",
      action: "custom_cover.admin_decision",
      entityType: "custom_cover",
      entityId: customizationId,
      beforeData: {
        status: customization.status,
        admin_approved_by: customization.admin_approved_by,
        admin_approved_at: customization.admin_approved_at,
        rejection_reason: customization.rejection_reason,
      },
      afterData: {
        status: updated.status,
        admin_approved_by: updated.admin_approved_by,
        admin_approved_at: updated.admin_approved_at,
        rejection_reason: updated.rejection_reason,
      },
      metadata: {
        decision,
        ...(decision === "reject" && reason
          ? { rejection_reason: reason }
          : {}),
      },
    });

    return NextResponse.json({
      success: true,
      customization: updated,
    });
  } catch (error) {
    console.error("ADMIN CUSTOM COVER DECISION ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update custom cover.",
      },
      { status: 500 },
    );
  }
}
