import { fluxProvider } from "./providers/flux";
import { openAiProvider } from "./providers/openai";
import { replicateProvider } from "./providers/replicate";
import { customAiProvider } from "./providers/custom";

import type {
  AiProvider,
  AiProviderId,
} from "./types";

const providers: Record<AiProviderId, AiProvider> = {
  flux: fluxProvider,
  openai: openAiProvider,
  replicate: replicateProvider,
  custom: customAiProvider,
};

export function getAiProvider(
  providerId: AiProviderId
): AiProvider {
  const provider = providers[providerId];

  if (!provider) {
    throw new Error(
      `Unsupported AI provider: ${providerId}`
    );
  }

  return provider;
}

export function listAiProviders(): AiProvider[] {
  return Object.values(providers);
}
