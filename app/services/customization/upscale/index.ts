import {
  sharpUpscaleProvider,
} from "./service";

import type {
  UpscaleInput,
  UpscaleResult,
  UpscaleProviderId,
} from "./types";

const PROVIDERS: Partial<
  Record<
    UpscaleProviderId,
    typeof sharpUpscaleProvider
  >
> = {
  sharp: sharpUpscaleProvider,
};

export async function upscaleArtwork(
  input: UpscaleInput
): Promise<UpscaleResult> {
  const providerId =
    input.provider ?? "sharp";

  const provider =
    PROVIDERS[providerId];

  if (!provider) {
    throw new Error(
      `Upscale provider "${providerId}" is not configured.`
    );
  }

  return provider.upscale(input);
}

export function getUpscaleProvider(
  providerId: UpscaleProviderId = "sharp"
) {
  const provider =
    PROVIDERS[providerId];

  if (!provider) {
    throw new Error(
      `Upscale provider "${providerId}" is not configured.`
    );
  }

  return provider;
}

export * from "./types";
export * from "./service";
