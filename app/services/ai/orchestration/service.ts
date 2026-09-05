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

export async function orchestrateAiGeneration(
  dependencies: AiGenerationOrchestrationDependencies,
  request: AiCoverGenerationRequest
) {
  const {
    supabase,
    generate,
    ingestAssets,
  } = dependencies;

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

    const ingested = await ingestAssets(
      supabase,
      {
        customerId: request.customerId,
        customizationId: request.customizationId,
        generationId,
        assets: result.assets,
      }
    );

    const frontAssetId =
      ingested.frontAssetId;

    const insideFrontAssetId =
      ingested.insideFrontAssetId;

    const insideBackAssetId =
      ingested.insideBackAssetId;

    const backAssetId =
      ingested.backAssetId;

    await completeAiGenerationRecord(
      supabase,
      generationId,
      {
        model: result.model,
        status: "completed",
        frontAssetId,
        insideFrontAssetId,
        insideBackAssetId,
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
