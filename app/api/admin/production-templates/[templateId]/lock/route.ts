import { NextResponse } from "next/server";

import { requireAdminApi } from "@/app/lib/admin-auth";
import { createSupabaseAdminClient } from "@/app/lib/supabase";
import { PRODUCT_PRODUCTION_SIDES } from "@/app/lib/product-production-assets";

type Params = {
  params: Promise<{
    templateId: string;
  }>;
};

export async function POST(
  _request: Request,
  { params }: Params,
) {
  const adminAuth = await requireAdminApi();

  if (adminAuth.error) {
    return NextResponse.json(
      { error: adminAuth.error },
      { status: adminAuth.status },
    );
  }

  const { templateId } = await params;
  const supabase = createSupabaseAdminClient();

  const { data: template, error: templateError } = await supabase
    .from("minenote_production_templates")
    .select(
      "id, template_key, version, name, status, locked, required_elements",
    )
    .eq("id", templateId)
    .maybeSingle();

  if (templateError) {
    return NextResponse.json(
      { error: templateError.message },
      { status: 500 },
    );
  }

  if (!template) {
    return NextResponse.json(
      { error: "Production template not found." },
      { status: 404 },
    );
  }

  if (template.locked) {
    return NextResponse.json(
      {
        ok: true,
        alreadyLocked: true,
        template,
      },
      { status: 200 },
    );
  }

  if (template.status !== "draft") {
    return NextResponse.json(
      {
        error:
          "Only a draft MineNote production template can be activated and locked.",
      },
      { status: 409 },
    );
  }

  const { data: assets, error: assetsError } = await supabase
    .from("minenote_production_template_assets")
    .select("side, storage_path, width, height, mime_type")
    .eq("template_id", templateId);

  if (assetsError) {
    return NextResponse.json(
      { error: assetsError.message },
      { status: 500 },
    );
  }

  const configuredSides = new Set(
    (assets ?? []).map(
      (asset: { side: string }) => asset.side,
    ),
  );

  const missingSides = PRODUCT_PRODUCTION_SIDES.filter(
    (side) => !configuredSides.has(side),
  );

  if (missingSides.length > 0) {
    return NextResponse.json(
      {
        error:
          "Template must contain all four canonical production sides before it can be locked.",
        missingSides,
      },
      { status: 409 },
    );
  }

  const { data: lockedTemplate, error: lockError } = await supabase
    .from("minenote_production_templates")
    .update({
      status: "active",
      locked: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", templateId)
    .eq("locked", false)
    .eq("status", "draft")
    .select(
      "id, template_key, version, name, description, status, locked, required_elements, created_at, updated_at",
    )
    .single();

  if (lockError) {
    return NextResponse.json(
      {
        error:
          "The template could not be locked. It may have changed since this request started.",
        details: lockError.message,
      },
      { status: 409 },
    );
  }

  return NextResponse.json({
    ok: true,
    alreadyLocked: false,
    template: lockedTemplate,
    assets: assets ?? [],
  });
}
