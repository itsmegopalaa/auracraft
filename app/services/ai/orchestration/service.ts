import type {
  AiCoverGenerationRequest,
  AiCoverGenerationResult,
} from "../types";

import {
  createAiGenerationRecord,
  completeAiGenerationRecord,
  failAiGenerationRecord,
  deleteCustomCoverAssetRecord,
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

async function safelyFailGeneration(
  supabase: AiGenerationOrchestrationDependencies["supabase"],
  generationId: string,
  errorMessage: string,
  metadata: Record<string, unknown>
) {
  try {
    await failAiGenerationRecord(
      supabase,
      generationId,
      errorMessage,
      metadata
    );
  } catch (failureError) {
    /*
     * Never replace the original generation/provider error with
     * a secondary database failure while attempting to mark the
     * generation as failed.
     *
     * The generation may remain pending if the database itself is
     * unavailable, but the original error is still preserved in
     * server logs for diagnosis.
     */
    console.error(
      "CUSTOM COVER AI GENERATION FAILURE RECORD ERROR:",
      failureError
    );
  }
}

async function cleanupIngestedAssets(
  supabase: AiGenerationOrchestrationDependencies["supabase"],
  assetIds: Array<string | null | undefined>
) {
  const uniqueAssetIds = [
    ...new Set(
      assetIds.filter(
        (assetId): assetId is string =>
          typeof assetId === "string" && assetId.length > 0
      )
    ),
  ];

  for (const assetId of uniqueAssetIds) {
    try {
      await deleteCustomCoverAssetRecord(
        supabase,
        assetId
      );
    } catch (cleanupError) {
      /*
       * Asset cleanup is best-effort. Do not hide the generation
       * failure if cleanup itself fails.
       */
      console.error(
        "CUSTOM COVER AI ASSET CLEANUP ERROR:",
        {
          assetId,
          error: cleanupError,
        }
      );
    }
  }
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

      await safelyFailGeneration(
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

      await safelyFailGeneration(
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

    let ingested:
      Awaited<ReturnType<typeof ingestAssets>>;

    try {
      ingested = await ingestAssets(
        supabase,
        {
          customerId: request.customerId,
          customizationId: request.customizationId,
          generationId,
          assets: result.assets,
        }
      );
    } catch (error) {
      const errorMessage =
        getErrorMessage(error);

      await safelyFailGeneration(
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

    const frontAssetId =
      ingested.frontAssetId;

    const insideFrontAssetId =
      ingested.insideFrontAssetId;

    const insideBackAssetId =
      ingested.insideBackAssetId;

    const backAssetId =
      ingested.backAssetId;

    try {
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
    } catch (error) {
      const errorMessage =
        getErrorMessage(error);

      /*
       * Assets were already inserted successfully, but the
       * generation record could not be completed. Remove the
       * inserted assets so a failed generation does not leave
       * orphaned customization assets behind.
       */
      await cleanupIngestedAssets(
        supabase,
        [
          frontAssetId,
          insideFrontAssetId,
          insideBackAssetId,
          backAssetId,
        ]
      );

      await safelyFailGeneration(
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

    return {
      generationId,
      status: "completed" as const,
      result,
    };
  } catch (error) {
    const errorMessage =
      getErrorMessage(error);

    await safelyFailGeneration(
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
