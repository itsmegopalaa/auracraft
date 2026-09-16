import type { AiCoverGenerationRequest } from "../types";

import {
  createAiGenerationRecord,
  finalizeAiGenerationRecord,
  failAiGenerationRecord,
} from "../persistence/repository";

import {
  cleanupCustomCoverAssets,
} from "../assets/service";

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
): Promise<void> {
  await cleanupCustomCoverAssets(
    supabase,
    assetIds
  );
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
      await finalizeAiGenerationRecord(
        supabase,
        generationId,
        {
          model: result.model,
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
       * The finalize RPC may have committed successfully even if
       * the client did not receive its response (for example,
       * a transient network failure after the database commit).
       *
       * Re-check the database before treating finalization as
       * failed. This prevents deleting valid assets or consuming
       * a successful generation as failed.
       */
      try {
        const { data: currentGeneration, error: statusError } =
          await supabase
            .from("custom_cover_generations")
            .select("id, status")
            .eq("id", generationId)
            .maybeSingle();

        if (!statusError && currentGeneration?.status === "completed") {
          return {
            generationId,
            status: "completed" as const,
            result,
          };
        }
      } catch (statusCheckError) {
        console.error(
          "CUSTOM COVER AI GENERATION FINALIZATION STATUS CHECK ERROR:",
          statusCheckError
        );
      }

      /*
       * Finalization was not committed. The assets were already
       * inserted successfully, so remove them before marking the
       * pending generation as failed.
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
