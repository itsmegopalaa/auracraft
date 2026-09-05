export const CUSTOM_COVER_VERSION = 2 as const;

export type CoverSide = "front" | "insideFront" | "back" | "insideBack";

export type CustomCoverCreationMethod =
  | "ai"
  | "upload"
  | "template";

export type CustomCoverStatus =
  | "draft"
  | "customer_approved"
  | "admin_review"
  | "approved_for_print"
  | "rejected"
  | "archived";

export type CustomCoverSurface =
  | "front"
  | "insideFront"
  | "insideBack"
  | "back";

export type CustomCoverSize = "A5" | "A4";

export type CustomCoverPages = 100 | 150 | 200;

export type CustomCoverPaper =
  | "plain"
  | "ruled"
  | "dotGrid";

export type CustomCoverOrientation =
  | "portrait"
  | "landscape";

export type CustomCoverPhysicalConfig = {
  size: CustomCoverSize;
  pages: CustomCoverPages;
  paper: CustomCoverPaper;
  orientation: CustomCoverOrientation;
  quantity: number;
};

export type CustomCoverAssetKind =
  | "original"
  | "preview"
  | "production";

export type CustomCoverAsset = {
  id: string;
  side: CustomCoverSurface;
  kind: CustomCoverAssetKind;
  storagePath?: string;
  width?: number;
  height?: number;
  mimeType?: string;
  fileSize?: number | null;
  previewUrl?: string | null;
  metadata?: Record<string, unknown>;
};

export type CustomCoverText = {
  id?: string;
  content: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  x?: number;
  y?: number;
  rotation?: number;
};

export type CustomCoverBranding = {
  mineNote: boolean;
  auraCraft: boolean;
  logoVariant?: string;
};

export type CustomCoverSideDesign = {
  artworkUrl?: string;
  assets: CustomCoverAsset[];
  texts: CustomCoverText[];
  background?: string;
};

export type CustomCoverCreativeDirection = {
  category: string;
  theme: string;
};

export type CustomCoverDesign = {
  front: CustomCoverSideDesign;
  insideFront: CustomCoverSideDesign;
  insideBack: CustomCoverSideDesign;
  back: CustomCoverSideDesign;
  branding: CustomCoverBranding;
  creativeDirection?: CustomCoverCreativeDirection;
};

export type CustomCoverPrintSpec = {
  widthMm: number;
  heightMm: number;
  bleedMm: number;
  safeZoneMm: number;
  dpi: number;
  colorProfile: string;
};

export type CustomCoverTemplate = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  active: boolean;
  featured: boolean;
  previewImage: string;
  frontBackground?: string;
  backBackground?: string;
  printSpec: CustomCoverPrintSpec;
  branding: CustomCoverBranding;
};

export type CustomCoverGeneration = {
  id?: string;
  provider: string;
  model: string;
  prompt: string;
  negativePrompt?: string;
  generationNumber: number;
  status: "pending" | "completed" | "failed";
  surfaces?: CustomCoverSurface[];
  frontAssetUrl?: string;
  backAssetUrl?: string;
  metadata?: Record<string, unknown>;
};

export type CustomCoverAiBudget = {
  total: number;
  used: number;
  remaining: number;
};

export type CustomCoverCustomization = {
  id?: string;
  customerId?: string;
  productId: string;
  templateId?: string;
  creationMethod: CustomCoverCreationMethod;
  status: CustomCoverStatus;
  version: number;
  customerName?: string;
  customerText?: string;
  physicalConfig: CustomCoverPhysicalConfig;
  design: CustomCoverDesign;
  printSpec: CustomCoverPrintSpec;
  aiBudget: CustomCoverAiBudget;
  previewFrontUrl?: string;
  previewBackUrl?: string;
  productionFrontUrl?: string;
  productionBackUrl?: string;
  customerApprovedAt?: string;
  adminApprovedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};
