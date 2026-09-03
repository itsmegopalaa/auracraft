import type {
  AiCoverGenerationRequest,
  AiCoverGenerationResult,
  AiProvider,
} from "../types";

export const fluxProvider: AiProvider = {
  id: "flux",
  name: "FLUX",

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
      "FLUX provider is not configured yet."
    );
  },
};
