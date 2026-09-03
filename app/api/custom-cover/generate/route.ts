import { NextResponse } from "next/server";

import { createServerSupabaseClient, createSupabaseAdminClient } from "@/app/lib/supabase";
import {
  CUSTOM_COVER_LIMITS,
  validateAiPrompt,
} from "@/app/lib/customization";
import {
  getDefaultAiProviderId,
  isAiProviderConfigured,
  orchestrateAiGeneration,
  getAiProvider,
  ingestAiGeneratedAssets,
} from "@/app/services/ai";

const supabaseAdmin = createSupabaseAdminClient();

type GenerateRequestBody = {
  customizationId?: unknown;
  prompt?: unknown;
  negativePrompt?: unknown;
  sides?: unknown;
};

type CustomizationRow = {
  id: string;
  customer_id: string | null;
  product_id: string;
  status: string;
};

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}

function normalizeSides(value: unknown): ("front" | "back")[] {
  if (value === undefined) {
    return ["front", "back"];
  }

  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("At least one cover side is required.");
  }

  const uniqueSides = [
    ...new Set(
      value.filter(
        (side): side is "front" | "back" =>
          side === "front" || side === "back"
      )
    ),
  ];

  if (uniqueSides.length !== value.length) {
    throw new Error(
      "AI generation sides must contain only front or back."
    );
  }

  if (uniqueSides.length === 0) {
    throw new Error("At least one valid cover side is required.");
  }

  return uniqueSides;
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be signed in to generate a custom cover.",
        },
        { status: 401 }
      );
    }

    let body: GenerateRequestBody;

    try {
      body = (await request.json()) as GenerateRequestBody;
    } catch {
      return NextResponse.json(
        {
          error: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const customizationId = body.customizationId;

    if (!isUuid(customizationId)) {
      return NextResponse.json(
        {
          error: "Invalid customization ID.",
        },
        { status: 400 }
      );
    }

    if (typeof body.prompt !== "string") {
      return NextResponse.json(
        {
          error: "Prompt is required.",
        },
        { status: 400 }
      );
    }

    let prompt: string;

    try {
      prompt = validateAiPrompt(body.prompt);
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Invalid AI prompt.",
        },
        { status: 400 }
      );
    }

    if (
      body.negativePrompt !== undefined &&
      typeof body.negativePrompt !== "string"
    ) {
      return NextResponse.json(
        {
          error: "Negative prompt must be a string.",
        },
        { status: 400 }
      );
    }

    let sides: ("front" | "back")[];

    try {
      sides = normalizeSides(body.sides);
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Invalid cover sides.",
        },
        { status: 400 }
      );
    }

    /*
     * Load the customization using the authenticated customer's
     * identity. Never trust customerId from the request body.
     */
    const { data: customization, error: customizationError } =
      await supabase
        .from("custom_cover_customizations")
        .select("id, customer_id, product_id, status")
        .eq("id", customizationId)
        .eq("customer_id", user.id)
        .maybeSingle<CustomizationRow>();

    if (customizationError) {
      console.error(
        "CUSTOM COVER GENERATE CUSTOMIZATION LOOKUP ERROR:",
        customizationError
      );

      return NextResponse.json(
        {
          error: "Unable to load customization.",
        },
        { status: 500 }
      );
    }

    if (!customization) {
      return NextResponse.json(
        {
          error: "Customization not found.",
        },
        { status: 404 }
      );
    }

    if (customization.customer_id !== user.id) {
      return NextResponse.json(
        {
          error: "You do not have access to this customization.",
        },
        { status: 403 }
      );
    }

    if (customization.status !== "draft") {
      return NextResponse.json(
        {
          error:
            "Only draft customizations can be generated.",
        },
        { status: 409 }
      );
    }

    /*
     * Verify that the underlying product still exists and is active.
     */
    const { data: product, error: productError } =
      await supabase
        .from("products")
        .select("id, active")
        .eq("id", customization.product_id)
        .maybeSingle();

    if (productError) {
      console.error(
        "CUSTOM COVER GENERATE PRODUCT LOOKUP ERROR:",
        productError
      );

      return NextResponse.json(
        {
          error: "Unable to verify the selected product.",
        },
        { status: 500 }
      );
    }

    if (!product) {
      return NextResponse.json(
        {
          error: "The selected notebook product no longer exists.",
        },
        { status: 409 }
      );
    }

    if (!product.active) {
      return NextResponse.json(
        {
          error: "The selected notebook product is no longer available.",
        },
        { status: 409 }
      );
    }

    /*
     * Generation number is SERVER CONTROLLED.
     *
     * We count every generation attempt, including failed ones,
     * because an attempt has consumed provider/compute resources.
     */
    const { count: generationCount, error: generationCountError } =
      await supabaseAdmin
        .from("custom_cover_generations")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("customization_id", customizationId);

    if (generationCountError) {
      console.error(
        "CUSTOM COVER GENERATE COUNT ERROR:",
        generationCountError
      );

      return NextResponse.json(
        {
          error: "Unable to check generation allowance.",
        },
        { status: 500 }
      );
    }

    const currentGenerationCount = generationCount ?? 0;

    if (
      currentGenerationCount >=
      CUSTOM_COVER_LIMITS.maxAiGenerations
    ) {
      return NextResponse.json(
        {
          error:
            "You have used all included AI generations for this customization.",
        },
        { status: 409 }
      );
    }

    const generationNumber = currentGenerationCount + 1;

    /*
     * Provider is SERVER CONTROLLED.
     * Customers cannot switch the AI backend by submitting
     * an arbitrary provider ID.
     */
    const providerId = getDefaultAiProviderId();

    if (!isAiProviderConfigured(providerId)) {
      console.error(
        `CUSTOM COVER AI PROVIDER NOT CONFIGURED: ${providerId}`
      );

      return NextResponse.json(
        {
          error:
            "AI generation is temporarily unavailable.",
        },
        { status: 503 }
      );
    }

    const provider = getAiProvider(providerId);

    let result;

    try {
      result = await orchestrateAiGeneration(
        {
          supabase: supabaseAdmin,
          generate: (generationRequest) =>
            provider.generateCover(generationRequest),
          ingestAssets: ingestAiGeneratedAssets,
        },
        {
          customerId: user.id,
          customizationId,
          prompt,
          negativePrompt:
            typeof body.negativePrompt === "string"
              ? body.negativePrompt.trim() || undefined
              : undefined,
          sides,
          generationNumber,
          provider: providerId,
          metadata: {
            source: "customer_generate_api",
            userId: user.id,
          },
        }
      );
    } catch (error) {
      /*
       * The database has a unique constraint on
       * (customization_id, generation_number).
       *
       * If two requests race and both calculate the same
       * generation number, only one may create the record.
       */
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "23505"
      ) {
        return NextResponse.json(
          {
            error:
              "Another AI generation is already being started. Please try again.",
          },
          { status: 409 }
        );
      }

      throw error;
    }

    if (result.status === "failed") {
      return NextResponse.json(
        {
          success: false,
          generationId: result.generationId,
          error:
            result.error ??
            "AI generation failed.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        generationId: result.generationId,
        status: result.status,
        generationNumber,
        provider: result.result.provider,
        model: result.result.model,
        assets: result.result.assets.map((asset) => ({
          side: asset.side,
          width: asset.width,
          height: asset.height,
          mimeType: asset.mimeType,
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CUSTOM COVER GENERATE API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Something went wrong while generating your cover.",
      },
      { status: 500 }
    );
  }
}
