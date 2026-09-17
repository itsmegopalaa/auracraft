import type {
  A4ProductionResult,
  ProductionCoverSide,
  ProductionOrientation,
  ProductionSize,
  ProductionText,
  ProductionDesignState,
} from "./types";

import type { UpscaleProviderId } from "../upscale";

export type ProductionPipelineInput = {
  artwork: Buffer;

  size?: ProductionSize;
  orientation?: ProductionOrientation;

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

  canvasWidth?: number;
  canvasHeight?: number;

  design?: ProductionDesignState;
  assetBuffers?: Record<string, Buffer>;

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
    size: ProductionSize;
    orientation: ProductionOrientation;
    width: number;
    height: number;
    dpi: number;
    mimeType: "image/png";
    fileSize: number;
  };
};
