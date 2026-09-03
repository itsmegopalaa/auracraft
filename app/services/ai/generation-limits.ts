import { CUSTOM_COVER_LIMITS } from "@/app/lib/customization";

export function assertGenerationNumberAllowed(
  generationNumber: number
): void {
  if (
    !Number.isInteger(generationNumber) ||
    generationNumber < 1 ||
    generationNumber > CUSTOM_COVER_LIMITS.maxAiGenerations
  ) {
    throw new Error(
      `AI generation number must be between 1 and ${CUSTOM_COVER_LIMITS.maxAiGenerations}.`
    );
  }
}

export function hasAiGenerationsRemaining(
  completedOrPendingGenerations: number
): boolean {
  return (
    Number.isInteger(completedOrPendingGenerations) &&
    completedOrPendingGenerations <
      CUSTOM_COVER_LIMITS.maxAiGenerations
  );
}
