import { getAiProvider } from "./registry";
import {
  validateAiGenerationRequest,
  type GenerateCoverInput,
} from "./index";
import type {
  AiCoverGenerationResult,
  AiProviderId,
} from "./types";

export type AiGenerationLifecycleStatus =
  | "pending"
  | "completed"
  | "failed";

export type CreateGenerationRecordInput = {
  customizationId: string;
  prompt: string;
  negativePrompt?: string;
  sides?: ("front" | "back")[];
  generationNumber: number;
  provider?: AiProviderId;
  metadata?: Record<string, unknown>;
};

export type AiGenerationRecord = {
  id: string;
  customizationId: string;
  provider: AiProviderId;
  generationNumber: number;
  status: AiGenerationLifecycleStatus;
  prompt: string;
  negativePrompt?: string;
  result?: AiCoverGenerationResult;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
};

function createLocalGenerationId(): string {
  return crypto.randomUUID();
}

export function createPendingGenerationRecord(
  input: CreateGenerationRecordInput
): AiGenerationRecord {
  const request = validateAiGenerationRequest(input);

  return {
    id: createLocalGenerationId(),
    customizationId: request.customizationId,
    provider: request.provider,
    generationNumber: request.generationNumber,
    status: "pending",
    prompt: request.prompt,
    negativePrompt: request.negativePrompt,
    createdAt: new Date().toISOString(),
  };
}

export async function executeAiGeneration(
  input: CreateGenerationRecordInput
): Promise<AiGenerationRecord> {
  const request = validateAiGenerationRequest(input);

  const record: AiGenerationRecord = {
    id: createLocalGenerationId(),
    customizationId: request.customizationId,
    provider: request.provider,
    generationNumber: request.generationNumber,
    status: "pending",
    prompt: request.prompt,
    negativePrompt: request.negativePrompt,
    createdAt: new Date().toISOString(),
  };

  try {
    const provider = getAiProvider(request.provider);
    const result = await provider.generateCover(request);

    if (result.status === "failed") {
      return {
        ...record,
        status: "failed",
        result,
        errorMessage:
          result.errorMessage ?? "AI generation failed.",
        completedAt: new Date().toISOString(),
      };
    }

    if (result.status !== "completed") {
      return {
        ...record,
        status: "failed",
        result,
        errorMessage:
          "AI provider returned an unexpected generation status.",
        completedAt: new Date().toISOString(),
      };
    }

    return {
      ...record,
      status: "completed",
      result,
      completedAt: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown AI generation error.";

    return {
      ...record,
      status: "failed",
      errorMessage,
      completedAt: new Date().toISOString(),
    };
  }
}
