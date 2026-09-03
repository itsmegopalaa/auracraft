import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/app/lib/supabase";
import {
  createDraftCustomization,
  type CreateCustomizationInput,
} from "@/app/services/customization/customization-service";
import type { CustomCoverCreationMethod } from "@/app/lib/customization";

const CREATION_METHODS: readonly CustomCoverCreationMethod[] = [
  "ai",
  "upload",
  "template",
];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

function isCreationMethod(
  value: unknown
): value is CustomCoverCreationMethod {
  return (
    typeof value === "string" &&
    CREATION_METHODS.includes(value as CustomCoverCreationMethod)
  );
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to create a custom cover." },
      { status: 401 }
    );
  }

  try {
    const body: unknown = await request.json();

    if (!isRecord(body)) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { productId, creationMethod, customerName, customerText, templateId } =
      body;

    if (!isValidUuid(productId)) {
      return NextResponse.json(
        { error: "A valid productId is required." },
        { status: 400 }
      );
    }

    if (!isCreationMethod(creationMethod)) {
      return NextResponse.json(
        { error: "Invalid creation method." },
        { status: 400 }
      );
    }

    if (
      customerName !== undefined &&
      typeof customerName !== "string"
    ) {
      return NextResponse.json(
        { error: "customerName must be a string." },
        { status: 400 }
      );
    }

    if (
      customerText !== undefined &&
      typeof customerText !== "string"
    ) {
      return NextResponse.json(
        { error: "customerText must be a string." },
        { status: 400 }
      );
    }

    if (
      templateId !== undefined &&
      typeof templateId !== "string"
    ) {
      return NextResponse.json(
        { error: "templateId must be a string." },
        { status: 400 }
      );
    }

    if (creationMethod === "template" && !templateId) {
      return NextResponse.json(
        { error: "templateId is required for template customization." },
        { status: 400 }
      );
    }

    if (creationMethod !== "template" && templateId !== undefined) {
      return NextResponse.json(
        {
          error:
            "templateId is only allowed for template customization.",
        },
        { status: 400 }
      );
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, active")
      .eq("id", productId)
      .eq("active", true)
      .maybeSingle();

    if (productError) {
      console.error("Custom cover product lookup failed:", productError);

      return NextResponse.json(
        { error: "Unable to verify product." },
        { status: 500 }
      );
    }

    if (!product) {
      return NextResponse.json(
        { error: "Product not found or unavailable." },
        { status: 404 }
      );
    }

    const input: CreateCustomizationInput = {
      productId: product.id,
      creationMethod,
      customerId: user.id,
      customerName,
      customerText,
      templateId,
    };

    const customization = createDraftCustomization(input);

    const { data, error } = await supabase
      .from("custom_cover_customizations")
      .insert({
        product_id: customization.productId,
        customer_id: user.id,
        creation_method: customization.creationMethod,
        template_id: customization.templateId ?? null,
        customer_name: customization.customerName ?? null,
        customer_text: customization.customerText ?? null,
        status: customization.status,
        design: customization.design,
        print_spec: customization.printSpec,
        version: customization.version,
      })
      .select("id, product_id, creation_method, status, template_id, created_at")
      .single();

    if (error) {
      console.error("Custom cover database insert failed:", error);

      return NextResponse.json(
        { error: "Unable to create custom cover." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        customization: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Custom cover creation failed:", error);

    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
