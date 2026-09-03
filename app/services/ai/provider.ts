import type { AiProvider } from "./types";

export function assertAiProvider(
  provider: AiProvider | null | undefined
): asserts provider is AiProvider {
  if (!provider) {
    throw new Error("AI provider is not configured.");
  }
}

export type { AiProvider };
