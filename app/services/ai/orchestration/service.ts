import type {
  AiCoverGenerationRequest,
  AiCoverGenerationResult,
} from "../types";

import {
  createAiGenerationRecord,
  completeAiGenerationRecord,
  failAiGenerationRecord,
} from "../persistence/repository";

import type {
  AiGenerationOrchestrationDependencies,
} from "./types";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "AI generation failed.";
}

function getAssetId(
  result: AiCoverGenerationResult,
  side: "front" | "back"
): string | null {
  const asset = result.assets.find(
    (item) => item.side === side
  );

  /*
   * Asset IDs are intentionally null at this stage.
   * Provider assets currently expose URLs, while the
   * persistent custom_cover_assets records are created
   * by the asset-ingestion/storage layer in the next step.
   */
  return asset ? null : null;
}

export async function orchestrateAiGeneration(
  dependencies: AiGenerationOrchestrationDependencies,
  request: AiCoverGenerationRequest
) {
  const { supabase, generate } = dependencies;

  const generationId = crypto.randomUUID();

  await createAiGenerationRecord(supabase, {
    id: generationId,
    customizationId: request.customizationId,
    provider: request.provider,
    model: undefined,
    prompt: request.prompt,
    negativePrompt: request.negativePrompt,
    generationNumber: request.generationNumber,
    status: "pending",
    metadata: request.metadata ?? {},
  });

  try {
    const result = await generate(request);

    if (result.status === "failed") {
      const errorMessage =
        result.errorMessage ?? "AI generation failed.";

      await failAiGenerationRecord(
        supabase,
        generationId,
        errorMessage,
        {
          ...(request.metadata ?? {}),
          provider: result.provider,
          model: result.model,
          generationNumber: request.generationNumber,
        }
      );

      return {
        generationId,
        status: "failed" as const,
        result,
        error: errorMessage,
      };
    }

    if (result.status !== "completed") {
      const errorMessage =
        "AI provider returned an unexpected generation status.";

      await failAiGenerationRecord(
        supabase,
        generationId,
        errorMessage,
        {
          ...(request.metadata ?? {}),
          provider: result.provider,
          model: result.model,
          generationNumber: request.generationNumber,
        }
      );

      return {
        generationId,
        status: "failed" as const,
        result,
        error: errorMessage,
      };
    }

    const frontAssetId = getAssetId(
      result,
      "front"
    );

    const backAssetId = getAssetId(
      result,
      "back"
    );

    await completeAiGenerationRecord(
      supabase,
      generationId,
      {
        model: result.model,
        status: "completed",
        frontAssetId,
        backAssetId,
        metadata: {
          ...(request.metadata ?? {}),
          ...(result.metadata ?? {}),
          provider: result.provider,
          model: result.model,
          generatedAssets: result.assets,
        },
      }
    );

    return {
      generationId,
      status: "completed" as const,
      result,
    };
  } catch (error) {
    const errorMessage =
      getErrorMessage(error);

    await failAiGenerationRecord(
      supabase,
      generationId,
      errorMessage,
      {
        ...(request.metadata ?? {}),
        provider: request.provider,
        generationNumber: request.generationNumber,
      }
    );

    return {
      generationId,
      status: "failed" as const,
      error: errorMessage,
    };
  }
}
