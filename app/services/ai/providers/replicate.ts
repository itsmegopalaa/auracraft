import type {
  AiCoverGenerationRequest,
  AiCoverGenerationResult,
  AiProvider,
} from "../types";

export const replicateProvider: AiProvider = {
  id: "replicate",
  name: "Replicate",

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
      "Replicate provider is not configured."
    );
  },
};
