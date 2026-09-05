import type { AiProvider } from "../types";
import type {
  AiCoverGenerationRequest,
  AiCoverGenerationResult,
  AiGeneratedAsset,
  AiProviderId,
} from "../types";

type HttpProviderConfig = {
  id: AiProviderId;
  name: string;
  endpoint: string;
  apiKey?: string;
  model: string;
};

type HttpGenerationResponse = {
  model?: string;
  assets?: Array<{
    side: "front" | "insideFront" | "insideBack" | "back";
    url: string;
    width: number;
    height: number;
    mimeType: string;
    metadata?: Record<string, unknown>;
  }>;
  images?: Array<{
    side?: "front" | "insideFront" | "insideBack" | "back";
    url: string;
    width?: number;
    height?: number;
    mimeType?: string;
  }>;
};

function isValidAsset(
  asset: unknown
): asset is AiGeneratedAsset {
  if (!asset || typeof asset !== "object") {
    return false;
  }

  const value = asset as Record<string, unknown>;

  return (
    (
      value.side === "front" ||
      value.side === "insideFront" ||
      value.side === "insideBack" ||
      value.side === "back"
    ) &&
    typeof value.url === "string" &&
    value.url.length > 0 &&
    typeof value.width === "number" &&
    value.width > 0 &&
    typeof value.height === "number" &&
    value.height > 0 &&
    typeof value.mimeType === "string" &&
    value.mimeType.length > 0
  );
}

function normalizeAssets(
  response: HttpGenerationResponse
): AiGeneratedAsset[] {
  if (Array.isArray(response.assets)) {
    return response.assets.filter(isValidAsset);
  }

  if (!Array.isArray(response.images)) {
    return [];
  }

  return response.images
    .map((image, index) => ({
      side: image.side ?? (index === 0 ? "front" : "back"),
      url: image.url,
      width: image.width ?? 0,
      height: image.height ?? 0,
      mimeType: image.mimeType ?? "image/png",
    }))
    .filter(isValidAsset);
}

export function createHttpAiProvider(
  config: HttpProviderConfig
): AiProvider {
  return {
    id: config.id,
    name: config.name,

    capabilities: {
      supportedSides: [
      "front",
      "insideFront",
      "insideBack",
      "back",
    ],
      supportsNegativePrompt: true,
      supportsImageToImage: true,
      supportsReferenceImages: true,
    },

    async generateCover(
      request: AiCoverGenerationRequest
    ): Promise<AiCoverGenerationResult> {
      if (!config.endpoint) {
        throw new Error(
          `${config.name} endpoint is not configured.`
        );
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (config.apiKey) {
        headers.Authorization = `Bearer ${config.apiKey}`;
      }

      const response = await fetch(config.endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: config.model,
          customizationId: request.customizationId,
          prompt: request.prompt,
          negativePrompt: request.negativePrompt,
          sides: request.sides,
          generationNumber: request.generationNumber,
          metadata: request.metadata,
        }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");

        throw new Error(
          `${config.name} request failed (${response.status})${
            body ? `: ${body.slice(0, 500)}` : "."
          }`
        );
      }

      const payload =
        (await response.json()) as HttpGenerationResponse;

      const assets = normalizeAssets(payload);

      if (assets.length === 0) {
        throw new Error(
          `${config.name} returned no valid generated assets.`
        );
      }

      const requestedSides = new Set(request.sides);
      const returnedSides = new Set(
        assets.map((asset) => asset.side)
      );

      for (const side of requestedSides) {
        if (!returnedSides.has(side)) {
          throw new Error(
            `${config.name} did not return a valid ${side} cover.`
          );
        }
      }

      return {
        provider: config.id,
        model: payload.model ?? config.model,
        status: "completed",
        assets,
        metadata: {
          ...(request.metadata ?? {}),
          transport: "http",
        },
      };
    },
  };
}
