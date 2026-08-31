import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { createServerSupabaseClient } from "@/app/lib/supabase";

export async function PATCH(request: Request) {
  try {
    const adminAuth = await requireAdminApi();

    if (adminAuth.error) {
      return NextResponse.json(
        { error: adminAuth.error },
        { status: adminAuth.status }
      );
    }

    const body = await request.json();

    const {
      id,
      name,
      price,
      description,
      category,
      image,
      stock,
      active,
      theme,
      badge,
      featured,
    } = body;

    if (typeof id !== "string" || !id.trim()) {
      return NextResponse.json(
        { error: "Product ID is required." },
        { status: 400 }
      );
    }

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Product name is required." },
        { status: 400 }
      );
    }

    if (
      typeof price !== "number" ||
      !Number.isInteger(price) ||
      price < 0
    ) {
      return NextResponse.json(
        { error: "Price must be a non-negative integer." },
        { status: 400 }
      );
    }

    if (
      typeof stock !== "number" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return NextResponse.json(
        { error: "Stock must be a non-negative integer." },
        { status: 400 }
      );
    }

    if (typeof active !== "boolean") {
      return NextResponse.json(
        { error: "Active status is required." },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .update({
        name: name.trim(),
        price,
        description:
          typeof description === "string"
            ? description.trim() || null
            : null,
        category:
          typeof category === "string"
            ? category.trim() || null
            : null,
        image:
          typeof image === "string"
            ? image.trim() || null
            : null,
        stock,
        active,
        theme:
          typeof theme === "string"
            ? theme.trim() || null
            : null,
        badge:
          typeof badge === "string"
            ? badge.trim() || null
            : null,
        featured:
          typeof featured === "boolean"
            ? featured
            : false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        "id, name, price, description, category, image, stock, active, theme, badge, featured, created_at, updated_at"
      )
      .single();

    if (error) {
      console.error("Product update error:", error);

      return NextResponse.json(
        { error: "Unable to update product." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      product: data,
    });
  } catch (error) {
    console.error("Product API error:", error);

    return NextResponse.json(
      { error: "Unauthorized or invalid request." },
      { status: 401 }
    );
  }
}


export async function POST(request: Request) {
  try {
    const adminAuth = await requireAdminApi();

    if (adminAuth.error) {
      return NextResponse.json(
        { error: adminAuth.error },
        { status: adminAuth.status }
      );
    }

    const body = await request.json();

    const {
      name,
      price,
      description,
      category,
      image,
      stock,
      active,
      theme,
      badge,
      featured,
    } = body;

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Product name is required." },
        { status: 400 }
      );
    }

    if (
      typeof price !== "number" ||
      !Number.isInteger(price) ||
      price < 0
    ) {
      return NextResponse.json(
        { error: "Price must be a non-negative integer." },
        { status: 400 }
      );
    }

    if (
      typeof stock !== "number" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return NextResponse.json(
        { error: "Stock must be a non-negative integer." },
        { status: 400 }
      );
    }

    if (typeof active !== "boolean") {
      return NextResponse.json(
        { error: "Active status is required." },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .insert({
        name: name.trim(),
        price,
        description:
          typeof description === "string"
            ? description.trim() || null
            : null,
        category:
          typeof category === "string"
            ? category.trim() || null
            : null,
        image:
          typeof image === "string"
            ? image.trim() || null
            : null,
        stock,
        active,
        theme:
          typeof theme === "string"
            ? theme.trim() || null
            : null,
        badge:
          typeof badge === "string"
            ? badge.trim() || null
            : null,
        featured:
          typeof featured === "boolean"
            ? featured
            : false,
      })
      .select(
        "id, name, price, description, category, image, stock, active, theme, badge, featured, created_at, updated_at"
      )
      .single();

    if (error) {
      console.error("Product creation error:", error);

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
    console.error("Product creation API error:", error);

    return NextResponse.json(
      { error: "Unauthorized or invalid request." },
      { status: 401 }
    );
  }
}
