import type { AiProviderId } from "./types";

const VALID_PROVIDERS: AiProviderId[] = [
  "flux",
  "openai",
  "replicate",
  "custom",
];

export function getDefaultAiProviderId(): AiProviderId {
  const configured =
    process.env.AI_DEFAULT_PROVIDER?.trim() as
      | AiProviderId
      | undefined;

  if (
    configured &&
    VALID_PROVIDERS.includes(configured)
  ) {
    return configured;
  }

  return "flux";
}

export function isAiProviderConfigured(
  providerId: AiProviderId
): boolean {
  switch (providerId) {
    case "flux":
      return Boolean(
        process.env.BFL_API_KEY?.trim() ||
          process.env.FLUX_API_KEY?.trim()
      );

    case "openai":
      return Boolean(
        process.env.OPENAI_IMAGE_ENDPOINT?.trim() &&
          process.env.OPENAI_API_KEY?.trim()
      );

    case "replicate":
      return Boolean(
        process.env.REPLICATE_API_ENDPOINT?.trim() &&
          process.env.REPLICATE_API_TOKEN?.trim()
      );

    case "custom":
      return Boolean(
        process.env.CUSTOM_AI_API_ENDPOINT?.trim()
      );

    default:
      return false;
  }
}
