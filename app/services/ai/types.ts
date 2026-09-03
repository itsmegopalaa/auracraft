import type { CoverSide } from "@/app/lib/customization";

export type AiProviderId =
  | "flux"
  | "openai"
  | "replicate"
  | "custom";

export type AiGenerationStatus =
  | "pending"
  | "completed"
  | "failed";

export type AiCoverGenerationRequest = {
  customizationId: string;
  prompt: string;
  negativePrompt?: string;
  sides: CoverSide[];
  generationNumber: number;
  provider: AiProviderId;
  metadata?: Record<string, unknown>;
};

export type AiGeneratedAsset = {
  side: CoverSide;
  url: string;
  width: number;
  height: number;
  mimeType: string;
  metadata?: Record<string, unknown>;
};

export type AiCoverGenerationResult = {
  provider: AiProviderId;
  model: string;
  status: AiGenerationStatus;
  assets: AiGeneratedAsset[];
  metadata?: Record<string, unknown>;
  errorMessage?: string;
};

export type AiProviderCapabilities = {
  supportsFrontBack: boolean;
  supportsNegativePrompt: boolean;
  supportsImageToImage: boolean;
  supportsReferenceImages: boolean;
};

export type AiProvider = {
  id: AiProviderId;
  name: string;
  capabilities: AiProviderCapabilities;

  generateCover(
    request: AiCoverGenerationRequest
  ): Promise<AiCoverGenerationResult>;
};
