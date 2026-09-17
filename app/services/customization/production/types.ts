export type ProductionCoverSide =
  | "front"
  | "insideFront"
  | "insideBack"
  | "back";

export type ProductionSize = "A4" | "A5";

export type ProductionOrientation = "portrait" | "landscape";

export type ProductionSpec = {
  widthPx: number;
  heightPx: number;
  widthMm: number;
  heightMm: number;
  dpi: 300;
  safeZoneMm: number;
  size: ProductionSize;
  orientation: ProductionOrientation;
};

export type ProductionText = {
  content: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fontSize?: number;
  fontWeight?: number | string;
  color?: string;
  align?: "left" | "center" | "right";
  lineHeight?: number;
  letterSpacing?: number;
  rotation?: number;
  opacity?: number;
};

export type ProductionDesignElement = {
  id: string;
  type: "text" | "image" | "shape";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;

  text?: string;
  fontSize?: number;
  fontWeight?: string | number;
  textAlign?: "left" | "center" | "right";
  color?: string;
  letterSpacing?: number;
  lineHeight?: number;

  src?: string;
  objectFit?: "cover" | "contain" | "fill";
  imageScale?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
  assetId?: string;

  shape?: "rectangle" | "circle";
  fill?: string;
  borderRadius?: number;

  zIndex?: number;
};

export type ProductionDesignState = {
  background?: string;
  elements?: ProductionDesignElement[];
  canvasWidth?: number;
  canvasHeight?: number;
  canvasSize?: ProductionSize;
  canvasOrientation?: ProductionOrientation;
  branding?: {
    mineNote?: boolean;
    auraCraft?: boolean;
  };
};

export type A4ProductionInput = {
  artwork: Buffer;
  size?: ProductionSize;
  orientation?: ProductionOrientation;
  customerName?: string;
  customerText?: string;
  side: ProductionCoverSide;
  background?: string;
  branding?: {
    mineNote?: boolean;
    auraCraft?: boolean;
  };
  texts?: ProductionText[];

  design?: ProductionDesignState;
  assetBuffers?: Record<string, Buffer>;
};

export type A4ProductionResult = {
  buffer: Buffer;
  size: ProductionSize;
  orientation: ProductionOrientation;
  widthPx: number;
  heightPx: number;
  dpi: number;
  mimeType: "image/png";
  fileSize: number;
};
