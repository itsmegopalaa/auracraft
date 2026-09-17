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
                element.type === "text" ||
                element.type === "shape"
                  ? element.type
                  : "text",

              x:
                typeof element.x === "number" &&
                Number.isFinite(element.x)
                  ? Math.max(-10000, Math.min(10000, element.x))
                  : 0,

              y:
                typeof element.y === "number" &&
                Number.isFinite(element.y)
                  ? Math.max(-10000, Math.min(10000, element.y))
                  : 0,

              width:
                typeof element.width === "number" &&
                Number.isFinite(element.width)
                  ? Math.max(1, Math.min(10000, element.width))
                  : 100,

              height:
                typeof element.height === "number" &&
                Number.isFinite(element.height)
                  ? Math.max(1, Math.min(10000, element.height))
                  : 100,

              rotation:
                typeof element.rotation === "number" &&
                Number.isFinite(element.rotation)
                  ? Math.max(-180, Math.min(180, element.rotation))
                  : 0,

              opacity:
                typeof element.opacity === "number" &&
                Number.isFinite(element.opacity)
                  ? Math.max(0, Math.min(1, element.opacity))
                  : 1,

              text:
                typeof element.text === "string"
                  ? element.text.slice(0, 500)
                  : undefined,

              fontSize:
                typeof element.fontSize === "number" &&
                Number.isFinite(element.fontSize)
                  ? Math.max(8, Math.min(1000, element.fontSize))
                  : undefined,

              fontWeight:
                typeof element.fontWeight === "string" ||
                typeof element.fontWeight === "number"
                  ? String(element.fontWeight).slice(0, 20)
                  : undefined,

              textAlign:
                element.textAlign === "left" ||
                element.textAlign === "center" ||
                element.textAlign === "right"
                  ? element.textAlign
                  : undefined,

              color:
                typeof element.color === "string"
                  ? element.color.slice(0, 100)
                  : undefined,

              letterSpacing:
                typeof element.letterSpacing === "number" &&
                Number.isFinite(element.letterSpacing)
                  ? Math.max(-100, Math.min(100, element.letterSpacing))
                  : undefined,

              lineHeight:
                typeof element.lineHeight === "number" &&
                Number.isFinite(element.lineHeight)
                  ? Math.max(0.5, Math.min(5, element.lineHeight))
                  : undefined,

              src:
                typeof element.src === "string"
                  ? element.src.slice(0, 2_000_000)
                  : undefined,

              objectFit:
                element.objectFit === "cover" ||
                element.objectFit === "contain" ||
                element.objectFit === "fill"
                  ? element.objectFit
                  : "contain",

              imageScale:
                typeof element.imageScale === "number" &&
                Number.isFinite(element.imageScale)
                  ? Math.max(0.01, Math.min(20, element.imageScale))
                  : 1,

              imageOffsetX:
                typeof element.imageOffsetX === "number" &&
                Number.isFinite(element.imageOffsetX)
                  ? Math.max(-10000, Math.min(10000, element.imageOffsetX))
                  : 0,

              imageOffsetY:
                typeof element.imageOffsetY === "number" &&
                Number.isFinite(element.imageOffsetY)
                  ? Math.max(-10000, Math.min(10000, element.imageOffsetY))
                  : 0,

              shape:
                element.shape === "rectangle" ||
                element.shape === "circle"
                  ? element.shape
                  : undefined,

              fill:
                typeof element.fill === "string"
                  ? element.fill.slice(0, 100)
                  : undefined,

              borderRadius:
                typeof element.borderRadius === "number" &&
                Number.isFinite(element.borderRadius)
                  ? Math.max(0, Math.min(1000, element.borderRadius))
                  : undefined,

              assetId:
                typeof element.assetId === "string"
                  ? element.assetId.slice(0, 100)
                  : undefined,

              zIndex:
                typeof element.zIndex === "number" &&
                Number.isFinite(element.zIndex)
                  ? Math.max(0, Math.min(1000, Math.round(element.zIndex)))
                  : undefined,
            }))
        : [],

      texts: Array.isArray(surface.texts)
        ? surface.texts.slice(0, 50)
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
    canvasWidth:
      typeof value.canvasWidth === "number" &&
      Number.isFinite(value.canvasWidth)
        ? Math.max(100, Math.min(10000, value.canvasWidth))
        : undefined,

    canvasHeight:
      typeof value.canvasHeight === "number" &&
      Number.isFinite(value.canvasHeight)
        ? Math.max(100, Math.min(10000, value.canvasHeight))
        : undefined,

    canvasSize:
      value.canvasSize === "A4" || value.canvasSize === "A5"
        ? value.canvasSize
        : undefined,

    canvasOrientation:
      value.canvasOrientation === "portrait" ||
      value.canvasOrientation === "landscape"
        ? value.canvasOrientation
        : undefined,

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

export async function GET(
  _request: Request,
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

    const { data: customization, error } = await supabase
      .from("custom_cover_customizations")
      .select(
        "id, customer_id, status, product_id, customer_name, customer_text, design"
      )
      .eq("id", customizationId)
      .eq("customer_id", user.id)
      .single();

    if (error || !customization) {
      return NextResponse.json(
        { error: "Customization not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ customization });
  } catch (error) {
    console.error("Custom cover customization GET failed:", error);

    return NextResponse.json(
      { error: "Unable to load customization." },
      { status: 500 }
    );
  }
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

    const hasCustomerName = Object.prototype.hasOwnProperty.call(
      body ?? {},
      "customerName"
    );
    const hasCustomerText = Object.prototype.hasOwnProperty.call(
      body ?? {},
      "customerText"
    );

    const customerName = hasCustomerName
      ? validateText(body?.customerName, "Customer name")
      : undefined;

    const customerText = hasCustomerText
      ? validateText(body?.customerText, "Customer text")
      : undefined;

    const requestedProductId =
      body?.productId === undefined ||
      body?.productId === null ||
      body?.productId === ""
        ? null
        : body?.productId;

    if (
      requestedProductId !== null &&
      !isUuid(requestedProductId)
    ) {
      return NextResponse.json(
        { error: "Invalid product ID." },
        { status: 400 }
      );
    }

    const { data: existing, error: existingError } =
      await supabase
        .from("custom_cover_customizations")
        .select(
          "id, customer_id, status, product_id, customer_name, customer_text, design"
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

    let productId = existing.product_id ?? null;

    if (requestedProductId !== null) {
      const { data: product, error: productError } =
        await supabase
          .from("products")
          .select("id, active")
          .eq("id", requestedProductId)
          .eq("active", true)
          .single();

      if (productError || !product) {
        return NextResponse.json(
          { error: "Selected product is unavailable." },
          { status: 409 }
        );
      }

      productId = product.id;
    } else if (body?.productId === null || body?.productId === "") {
      productId = null;
    }

    const { data: updated, error: updateError } =
      await supabase
        .from("custom_cover_customizations")
        .update({
          ...(hasCustomerName
            ? { customer_name: customerName }
            : {}),
          ...(hasCustomerText
            ? { customer_text: customerText }
            : {}),
          product_id: productId,
          design,
          updated_at: new Date().toISOString(),
        })
        .eq("id", customizationId)
        .eq("customer_id", user.id)
        .eq("status", "draft")
        .select(
          "id, customer_name, customer_text, product_id, design, status, updated_at"
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
