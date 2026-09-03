import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AiCoverGenerationRequest,
  AiCoverGenerationResult,
} from "../types";

export type AiGenerationOrchestrationStatus =
  | "completed"
  | "failed";

export type AiGenerationOrchestrationResult = {
  generationId: string;
  status: AiGenerationOrchestrationStatus;
  result?: AiCoverGenerationResult;
  error?: string;
};

export type AiGenerationOrchestrationDependencies = {
  supabase: SupabaseClient;
  generate: (
    request: AiCoverGenerationRequest
  ) => Promise<AiCoverGenerationResult>;
  ingestAssets: (
    supabase: SupabaseClient,
    input: {
      customerId: string;
      customizationId: string;
      generationId: string;
      assets: AiCoverGenerationResult["assets"];
    }
  ) => Promise<{
    frontAssetId: string | null;
    backAssetId: string | null;
  }>;
};
