import type { CoverSide } from "@/app/lib/customization";

import type { AiGeneratedAsset } from "../types";

export type IngestedAiAsset = {
  id: string;
  side: CoverSide;
  storagePath: string;
  width: number;
  height: number;
  mimeType: string;
  fileSize: number;
};

export type AiAssetIngestionResult = {
  assets: IngestedAiAsset[];
  frontAssetId: string | null;
  insideFrontAssetId: string | null;
  insideBackAssetId: string | null;
  backAssetId: string | null;
};

export type AiAssetIngestionInput = {
  customerId: string;
  customizationId: string;
  generationId: string;
  assets: AiGeneratedAsset[];
};
