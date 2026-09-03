import type { CoverSide } from "@/app/lib/customization";
import type {
  AiGenerationStatus,
  AiProviderId,
} from "../types";

export type AiGenerationRow = {
  id: string;
  customization_id: string;
  provider: AiProviderId;
  model: string | null;
  prompt: string;
  negative_prompt: string | null;
  generation_number: number;
  status: AiGenerationStatus;
  front_asset_id: string | null;
  back_asset_id: string | null;
  metadata: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
};

export type CustomCoverAssetRow = {
  id: string;
  customization_id: string;
  side: CoverSide;
  kind: "original" | "preview" | "production";
  storage_path: string;
  width: number | null;
  height: number | null;
  mime_type: string | null;
  file_size: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type CreateAiGenerationRowInput = {
  id: string;
  customizationId: string;
  provider: AiProviderId;
  model?: string | null;
  prompt: string;
  negativePrompt?: string;
  generationNumber: number;
  status?: AiGenerationStatus;
  metadata?: Record<string, unknown>;
};

export type CreateCustomCoverAssetRowInput = {
  customizationId: string;
  side: CoverSide;
  kind: "original" | "preview" | "production";
  storagePath: string;
  width?: number;
  height?: number;
  mimeType: string;
  fileSize?: number;
  metadata?: Record<string, unknown>;
};
