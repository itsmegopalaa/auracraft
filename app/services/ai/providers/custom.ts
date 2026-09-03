import type {
  AiCoverGenerationRequest,
  AiCoverGenerationResult,
  AiProvider,
} from "../types";

export const customAiProvider: AiProvider = {
  id: "custom",
  name: "Custom / Self-hosted",

  capabilities: {
    supportsFrontBack: true,
    supportsNegativePrompt: true,
    supportsImageToImage: true,
    supportsReferenceImages: true,
  },

  async generateCover(
    _request: AiCoverGenerationRequest
  ): Promise<AiCoverGenerationResult> {
    throw new Error(
      "Custom AI provider is not configured."
    );
  },
};
