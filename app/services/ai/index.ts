import {
  CUSTOM_COVER_LIMITS,
  validateAiPrompt,
} from "@/app/lib/customization";

import type { CoverSide } from "@/app/lib/customization";

import { getAiProvider } from "./registry";

import type {
  AiCoverGenerationRequest,
  AiCoverGenerationResult,
  AiProviderId,
} from "./types";

export type GenerateCoverInput = {
  customerId: string;
  customizationId: string;
  prompt: string;
  negativePrompt?: string;
  sides?: ("front" | "back")[];
  generationNumber: number;
  provider?: AiProviderId;
  metadata?: Record<string, unknown>;
};

const DEFAULT_PROVIDER: AiProviderId = "flux";

export function validateAiGenerationRequest(
  input: GenerateCoverInput
): AiCoverGenerationRequest {
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(input.customerId)) {
    throw new Error("Invalid customer ID.");
  }

  if (!uuidPattern.test(input.customizationId)) {
    throw new Error("Invalid customization ID.");
  }

  const prompt = validateAiPrompt(input.prompt);

  if (
    input.negativePrompt !== undefined &&
    typeof input.negativePrompt !== "string"
  ) {
    throw new Error(
      "Negative prompt must be a string."
    );
  }

  if (
    !Number.isInteger(input.generationNumber) ||
    input.generationNumber < 1 ||
    input.generationNumber >
      CUSTOM_COVER_LIMITS.maxAiGenerations
  ) {
    throw new Error(
      `AI generation number must be between 1 and ${CUSTOM_COVER_LIMITS.maxAiGenerations}.`
    );
  }

  const sides =
    input.sides && input.sides.length > 0
      ? input.sides
      : ["front", "back"];

  const uniqueSides: CoverSide[] = [
    ...new Set(sides as CoverSide[]),
  ];

  if (
    uniqueSides.some(
      (side) => side !== "front" && side !== "back"
    )
  ) {
    throw new Error(
      "AI generation sides must be front or back."
    );
  }

  return {
    customerId: input.customerId,
    customizationId: input.customizationId,
    prompt,
    negativePrompt:
      input.negativePrompt?.trim() || undefined,
    sides: uniqueSides,
    generationNumber: input.generationNumber,
    provider: input.provider ?? DEFAULT_PROVIDER,
    metadata: input.metadata,
  };
}

export async function generateCustomCover(
  input: GenerateCoverInput
): Promise<AiCoverGenerationResult> {
  const request =
    validateAiGenerationRequest(input);

  const provider = getAiProvider(request.provider);

  return provider.generateCover(request);
}

export * from "./types";
export * from "./provider";
export * from "./registry";
export * from "./generation-service";
export * from "./generation-limits";
export * from "./errors";
export * from "./persistence";
export * from "./config";
export * from "./orchestration";

export * from "./assets";
