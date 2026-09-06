import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/app/lib/supabase";

type RouteContext = {
  params: Promise<{
    customizationId: string;
  }>;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

function validateText(
  value: unknown,
  field: string
): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(`${field} must be a string.`);
  }

  const normalized = value.trim();

  if (normalized.length > 120) {
    throw new Error(`${field} cannot exceed 120 characters.`);
  }

  return normalized || null;
}

function isPlainObject(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function sanitizeDesign(value: unknown) {
  if (!isPlainObject(value)) {
    throw new Error("Invalid design.");
  }

  const surfaces = {
    front: isPlainObject(value.front)
      ? value.front
      : {},
    insideFront: isPlainObject(value.insideFront)
      ? value.insideFront
      : {},
    insideBack: isPlainObject(value.insideBack)
      ? value.insideBack
      : {},
    back: isPlainObject(value.back)
      ? value.back
      : {},
  };

  const branding = isPlainObject(value.branding)
    ? value.branding
    : {};

  function sanitizeSurface(
    surface: Record<string, unknown>
  ) {
    return {
      artworkUrl:
        typeof surface.artworkUrl === "string"
          ? surface.artworkUrl.slice(0, 2000)
          : undefined,
      assets: Array.isArray(surface.assets)
        ? surface.assets.slice(0, 50)
        : [],
      elements: Array.isArray(surface.elements)
        ? surface.elements
            .filter((element) => isPlainObject(element))
            .slice(0, 50)
            .map((element) => ({
              id:
                typeof element.id === "string"
                  ? element.id.slice(0, 80)
                  : crypto.randomUUID(),
              type:
                element.type === "image" ||
                element.type === "text"
                  ? element.type
                  : "text",
              x:
                typeof element.x === "number" &&
                Number.isFinite(element.x)
                  ? Math.max(0, Math.min(100, element.x))
                  : 50,
              y:
                typeof element.y === "number" &&
                Number.isFinite(element.y)
                  ? Math.max(0, Math.min(100, element.y))
                  : 50,
              width:
                typeof element.width === "number" &&
                Number.isFinite(element.width)
                  ? Math.max(1, Math.min(100, element.width))
                  : 30,
              height:
                typeof element.height === "number" &&
                Number.isFinite(element.height)
                  ? Math.max(1, Math.min(100, element.height))
                  : 10,
              rotation:
                typeof element.rotation === "number" &&
                Number.isFinite(element.rotation)
                  ? Math.max(-180, Math.min(180, element.rotation))
                  : 0,
              zIndex:
                typeof element.zIndex === "number" &&
                Number.isFinite(element.zIndex)
                  ? Math.max(
                      0,
                      Math.min(1000, Math.round(element.zIndex))
                    )
                  : 1,
              text:
                typeof element.text === "string"
                  ? element.text.slice(0, 120)
                  : undefined,
              assetId:
                typeof element.assetId === "string"
                  ? element.assetId.slice(0, 100)
                  : undefined,
              fontSize:
                typeof element.fontSize === "number" &&
                Number.isFinite(element.fontSize)
                  ? Math.max(8, Math.min(120, element.fontSize))
                  : undefined,
              fontWeight:
                typeof element.fontWeight === "number" &&
                Number.isFinite(element.fontWeight)
                  ? Math.max(
                      300,
                      Math.min(900, element.fontWeight)
                    )
                  : undefined,
              color:
                typeof element.color === "string"
                  ? element.color.slice(0, 50)
                  : undefined,
              align:
                element.align === "left" ||
                element.align === "center" ||
                element.align === "right"
                  ? element.align
                  : undefined,
            }))
        : [],
      texts: Array.isArray(surface.texts)
        ? surface.texts
        : [],
      background:
        typeof surface.background === "string"
          ? surface.background.slice(0, 1000)
          : undefined,
    };
  }

  return {
    front: sanitizeSurface(surfaces.front),
    insideFront: sanitizeSurface(
      surfaces.insideFront
    ),
    insideBack: sanitizeSurface(
      surfaces.insideBack
    ),
    back: sanitizeSurface(surfaces.back),
    branding: {
      mineNote: true,
      auraCraft: false,
      logoVariant:
        typeof branding.logoVariant === "string"
          ? branding.logoVariant.slice(0, 50)
          : "default",
    },
  };
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  const { customizationId } = await params;

  if (!isUuid(customizationId)) {
    return NextResponse.json(
      { error: "Invalid customization ID." },
      { status: 400 }
    );
  }

  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const customerName = validateText(
      body?.customerName,
      "Customer name"
    );

    const customerText = validateText(
      body?.customerText,
      "Customer text"
    );

    const { data: existing, error: existingError } =
      await supabase
        .from("custom_cover_customizations")
        .select(
          "id, customer_id, status, design"
        )
        .eq("id", customizationId)
        .eq("customer_id", user.id)
        .single();

    if (
      existingError ||
      !existing
    ) {
      return NextResponse.json(
        { error: "Customization not found." },
        { status: 404 }
      );
    }

    if (existing.status !== "draft") {
      return NextResponse.json(
        {
          error:
            "Only draft customizations can be edited.",
        },
        { status: 409 }
      );
    }

    const design = sanitizeDesign(
      body?.design ?? existing.design
    );

    const { data: updated, error: updateError } =
      await supabase
        .from("custom_cover_customizations")
        .update({
          customer_name: customerName,
          customer_text: customerText,
          design,
          updated_at: new Date().toISOString(),
        })
        .eq("id", customizationId)
        .eq("customer_id", user.id)
        .eq("status", "draft")
        .select(
          "id, customer_name, customer_text, design, status, updated_at"
        )
        .single();

    if (updateError || !updated) {
      console.error(
        "CUSTOM COVER UPDATE FAILED:",
        updateError
      );

      return NextResponse.json(
        { error: "Unable to save customization." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      customization: updated,
    });
  } catch (error) {
    console.error(
      "CUSTOM COVER PATCH FAILED:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid customization data.",
      },
      { status: 400 }
    );
  }
}
