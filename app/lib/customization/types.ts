export const CUSTOM_COVER_VERSION = 1 as const;

export type CoverSide = "front" | "back";

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

export type CustomCoverAssetKind =
  | "original"
  | "preview"
  | "production";

export type CustomCoverAsset = {
  id?: string;
  side: CoverSide;
  kind: CustomCoverAssetKind;
  url: string;
  width: number;
  height: number;
  mimeType: string;
  fileSize?: number;
};

export type CustomCoverText = {
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

export type CustomCoverDesign = {
  front: CustomCoverSideDesign;
  back: CustomCoverSideDesign;
  branding: CustomCoverBranding;
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
  frontAssetUrl?: string;
  backAssetUrl?: string;
  metadata?: Record<string, unknown>;
};

export type CustomCoverCustomization = {
  id?: string;
  customerId?: string;
  productId: number;
  templateId?: string;
  creationMethod: CustomCoverCreationMethod;
  status: CustomCoverStatus;
  version: number;
  customerName?: string;
  customerText?: string;
  design: CustomCoverDesign;
  printSpec: CustomCoverPrintSpec;
  previewFrontUrl?: string;
  previewBackUrl?: string;
  productionFrontUrl?: string;
  productionBackUrl?: string;
  customerApprovedAt?: string;
  adminApprovedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};
