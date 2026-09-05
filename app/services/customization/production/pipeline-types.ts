import type {
  A4ProductionResult,
  ProductionCoverSide,
  ProductionText,
} from "./types";

import type {
  UpscaleProviderId,
} from "../upscale";

export type ProductionPipelineInput = {
  artwork: Buffer;

  sourceWidth: number;
  sourceHeight: number;
  sourceMimeType: string;

  customerName?: string;
  customerText?: string;

  side: ProductionCoverSide;

  background?: string;

  branding?: {
    mineNote?: boolean;
    auraCraft?: boolean;
  };

  texts?: ProductionText[];

  upscaleProvider?: UpscaleProviderId;
};

export type ProductionPipelineResult = {
  production: A4ProductionResult;

  source: {
    width: number;
    height: number;
    mimeType: string;
  };

  upscale: {
    provider: UpscaleProviderId;
    width: number;
    height: number;
    scaleFactor: number;
    fileSize: number;
  };

  final: {
    width: number;
    height: number;
    dpi: number;
    mimeType: "image/png";
    fileSize: number;
  };
};
