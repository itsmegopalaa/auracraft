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
  sides?: CoverSide[];
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

  /*
   * Generation number is an attempt number, not a credit count.
   *
   * Failed attempts intentionally do not consume AI credits,
   * so a customization may legitimately reach generation #8,
   * #9, etc. while still having included credits remaining.
   *
   * The customer-facing 7-credit hard cap is enforced by the
   * custom-cover generation API using pending + completed records.
   */
  if (
    !Number.isInteger(input.generationNumber) ||
    input.generationNumber < 1
  ) {
    throw new Error(
      "AI generation number must be a positive integer."
    );
  }

  const sides: CoverSide[] =
    input.sides && input.sides.length > 0
      ? input.sides
      : ["front"];

  const uniqueSides: CoverSide[] = [
    ...new Set(sides),
  ];

  const validSides = new Set<CoverSide>([
    "front",
    "insideFront",
    "insideBack",
    "back",
  ]);

  if (uniqueSides.some((side) => !validSides.has(side))) {
    throw new Error(
      "AI generation sides must be valid custom cover surfaces."
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
