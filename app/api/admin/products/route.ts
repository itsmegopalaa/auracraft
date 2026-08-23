import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin-auth";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(request: Request) {
  try {
    await requireAdmin();

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

    const supabase = await createClient();

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
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        "id, name, price, description, category, image, stock, active, created_at, updated_at"
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
    await requireAdmin();

    const body = await request.json();

    const {
      name,
      price,
      description,
      category,
      image,
      stock,
      active,
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

    const supabase = await createClient();

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
      })
      .select(
        "id, name, price, description, category, image, stock, active, created_at, updated_at"
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
