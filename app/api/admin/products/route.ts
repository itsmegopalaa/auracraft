import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { createServerSupabaseClient } from "@/app/lib/supabase";

const PRODUCT_SELECT =
  "id, name, price, description, category, image, stock, active, rating, bestseller, featured, new_arrival, pages, paper, size, theme, badge, created_at, updated_at";

const VALID_BADGES = new Set([
  "best_seller",
  "new",
  "limited",
  "featured",
]);

function isValidUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value.trim()
    )
  );
}

function nullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const valueTrimmed = value.trim();

  return valueTrimmed || null;
}

function validateBadge(
  value: unknown
): { valid: true; value: string | null | undefined } | {
  valid: false;
  error: string;
} {
  if (value === undefined || value === null) {
    return {
      valid: true,
      value: value === null ? null : undefined,
    };
  }

  if (typeof value !== "string") {
    return {
      valid: false,
      error:
        "Badge must be one of: best_seller, new, limited, featured.",
    };
  }

  const normalized = value.trim();

  if (!normalized) {
    return {
      valid: true,
      value: null,
    };
  }

  if (!VALID_BADGES.has(normalized)) {
    return {
      valid: false,
      error:
        "Badge must be one of: best_seller, new, limited, featured.",
    };
  }

  return {
    valid: true,
    value: normalized,
  };
}

function validateBaseProductFields(
  body: Record<string, unknown>
): string | null {
  if (
    typeof body.name !== "string" ||
    !body.name.trim()
  ) {
    return "Product name is required.";
  }

  if (
    typeof body.price !== "number" ||
    !Number.isInteger(body.price) ||
    body.price < 0
  ) {
    return "Price must be a non-negative integer.";
  }

  if (
    typeof body.stock !== "number" ||
    !Number.isInteger(body.stock) ||
    body.stock < 0
  ) {
    return "Stock must be a non-negative integer.";
  }

  if (typeof body.active !== "boolean") {
    return "Active status is required.";
  }

  return null;
}

function buildCreateData(
  body: Record<string, unknown>
) {
  const badge = validateBadge(body.badge);

  if (!badge.valid) {
    return {
      error: badge.error,
    };
  }

  return {
    data: {
      name: (body.name as string).trim(),
      price: body.price as number,
      description: nullableString(body.description),
      category: nullableString(body.category),
      image: nullableString(body.image),
      stock: body.stock as number,
      active: body.active as boolean,
      theme: nullableString(body.theme),
      badge: badge.value ?? null,
      featured:
        typeof body.featured === "boolean"
          ? body.featured
          : false,
    },
  };
}

function buildUpdateData(
  body: Record<string, unknown>
) {
  const updateData: Record<string, unknown> = {};

  if ("name" in body) {
    updateData.name =
      typeof body.name === "string"
        ? body.name.trim()
        : body.name;
  }

  if ("price" in body) {
    updateData.price = body.price;
  }

  if ("description" in body) {
    updateData.description =
      nullableString(body.description);
  }

  if ("category" in body) {
    updateData.category =
      nullableString(body.category);
  }

  if ("image" in body) {
    updateData.image =
      nullableString(body.image);
  }

  if ("stock" in body) {
    updateData.stock = body.stock;
  }

  if ("active" in body) {
    updateData.active = body.active;
  }

  if ("theme" in body) {
    updateData.theme =
      nullableString(body.theme);
  }

  if ("badge" in body) {
    const badge = validateBadge(body.badge);

    if (!badge.valid) {
      return {
        error: badge.error,
      };
    }

    updateData.badge = badge.value;
  }

  if ("featured" in body) {
    updateData.featured = body.featured;
  }

  updateData.updated_at =
    new Date().toISOString();

  return {
    data: updateData,
  };
}

async function parseJsonBody(
  request: Request
): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return null;
    }

    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function PATCH(request: Request) {
  const adminAuth = await requireAdminApi();

  if (adminAuth.error) {
    return NextResponse.json(
      { error: adminAuth.error },
      { status: adminAuth.status }
    );
  }

  const body = await parseJsonBody(request);

  if (!body) {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  if (!isValidUuid(body.id)) {
    return NextResponse.json(
      { error: "A valid product ID is required." },
      { status: 400 }
    );
  }

  if ("name" in body) {
    if (
      typeof body.name !== "string" ||
      !body.name.trim()
    ) {
      return NextResponse.json(
        { error: "Product name must be a non-empty string." },
        { status: 400 }
      );
    }
  }

  if ("price" in body) {
    if (
      typeof body.price !== "number" ||
      !Number.isInteger(body.price) ||
      body.price < 0
    ) {
      return NextResponse.json(
        { error: "Price must be a non-negative integer." },
        { status: 400 }
      );
    }
  }

  if ("stock" in body) {
    if (
      typeof body.stock !== "number" ||
      !Number.isInteger(body.stock) ||
      body.stock < 0
    ) {
      return NextResponse.json(
        { error: "Stock must be a non-negative integer." },
        { status: 400 }
      );
    }
  }

  if ("active" in body && typeof body.active !== "boolean") {
    return NextResponse.json(
      { error: "Active must be a boolean." },
      { status: 400 }
    );
  }

  if ("featured" in body && typeof body.featured !== "boolean") {
    return NextResponse.json(
      { error: "Featured must be a boolean." },
      { status: 400 }
    );
  }

  const productData = buildUpdateData(body);

  if ("error" in productData) {
    return NextResponse.json(
      { error: productData.error },
      { status: 400 }
    );
  }

  try {
    const supabase =
      await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .update(productData.data)
      .eq("id", body.id.trim())
      .select(PRODUCT_SELECT)
      .maybeSingle();

    if (error) {
      console.error(
        "Product update error:",
        error
      );

      return NextResponse.json(
        { error: "Unable to update product." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      product: data,
    });
  } catch (error) {
    console.error(
      "Product update API error:",
      error
    );

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const adminAuth = await requireAdminApi();

  if (adminAuth.error) {
    return NextResponse.json(
      { error: adminAuth.error },
      { status: adminAuth.status }
    );
  }

  const body = await parseJsonBody(request);

  if (!body) {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  const validationError =
    validateBaseProductFields(body);

  if (validationError) {
    return NextResponse.json(
      { error: validationError },
      { status: 400 }
    );
  }

  const productData = buildCreateData(body);

  if ("error" in productData) {
    return NextResponse.json(
      { error: productData.error },
      { status: 400 }
    );
  }

  try {
    const supabase =
      await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .insert(productData.data)
      .select(PRODUCT_SELECT)
      .single();

    if (error) {
      console.error(
        "Product creation error:",
        error
      );

      return NextResponse.json(
        { error: "Unable to create product." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { product: data },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Product creation API error:",
      error
    );

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
