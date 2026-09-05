export type ProductionCoverSide = "front" | "back";

export type A4ProductionSpec = {
  widthPx: 2480;
  heightPx: 3508;
  widthMm: 210;
  heightMm: 297;
  dpi: 300;
  safeZoneMm: 5;
};

export type ProductionText = {
  content: string;
  x?: number;
  y?: number;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  align?: "left" | "center" | "right";
};

export type A4ProductionInput = {
  artwork: Buffer;
  customerName?: string;
  customerText?: string;
  side: ProductionCoverSide;
  background?: string;
  branding?: {
    mineNote?: boolean;
    auraCraft?: boolean;
  };
  texts?: ProductionText[];
};

export type A4ProductionResult = {
  buffer: Buffer;
  widthPx: number;
  heightPx: number;
  dpi: number;
  mimeType: "image/png";
  fileSize: number;
};
