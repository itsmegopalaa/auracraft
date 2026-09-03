import type {
  AiCoverGenerationRequest,
  AiCoverGenerationResult,
  AiProvider,
} from "../types";

export const openAiProvider: AiProvider = {
  id: "openai",
  name: "OpenAI",

  capabilities: {
    supportsFrontBack: true,
    supportsNegativePrompt: false,
    supportsImageToImage: true,
    supportsReferenceImages: true,
  },

  async generateCover(
    _request: AiCoverGenerationRequest
  ): Promise<AiCoverGenerationResult> {
    throw new Error(
      "OpenAI image provider is not configured."
    );
  },
};
