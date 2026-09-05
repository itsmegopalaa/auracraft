import type {
  CustomCoverAiBudget,
  CustomCoverOrientation,
  CustomCoverPages,
  CustomCoverPaper,
  CustomCoverPhysicalConfig,
  CustomCoverPrintSpec,
  CustomCoverSize,
} from "./types";

export const CUSTOM_COVER_LIMITS = {
  maxTextLength: 120,
  maxPromptLength: 1000,
  maxUploadBytes: 15 * 1024 * 1024,

  // Customer receives seven AI generations per customization.
  maxAiGenerations: 7,

  minQuantity: 1,
} as const;

export const CUSTOM_COVER_SIZES = [
  "A5",
  "A4",
] as const satisfies readonly CustomCoverSize[];

export const CUSTOM_COVER_PAGE_OPTIONS = [
  100,
  150,
  200,
] as const satisfies readonly CustomCoverPages[];

export const CUSTOM_COVER_PAPER_OPTIONS = [
  "plain",
  "ruled",
  "dotGrid",
] as const satisfies readonly CustomCoverPaper[];

export const CUSTOM_COVER_ORIENTATIONS = [
  "portrait",
  "landscape",
] as const satisfies readonly CustomCoverOrientation[];

export const CUSTOM_COVER_CREATION_METHODS = [
  "ai",
  "upload",
  "template",
] as const;

export const CUSTOM_COVER_STATUSES = [
  "draft",
  "customer_approved",
  "admin_review",
  "approved_for_print",
  "rejected",
  "archived",
] as const;

export const DEFAULT_CUSTOM_COVER_PHYSICAL_CONFIG: CustomCoverPhysicalConfig = {
  size: "A5",
  pages: 100,
  paper: "plain",
  orientation: "portrait",
  quantity: 1,
};

export const DEFAULT_CUSTOM_COVER_PRINT_SPEC: CustomCoverPrintSpec = {
  // Temporary foundation values. These must eventually come from
  // the actual printer/manufacturer specification.
  widthMm: 216,
  heightMm: 279,
  bleedMm: 3,
  safeZoneMm: 5,
  dpi: 300,
  colorProfile: "sRGB",
};

export const DEFAULT_CUSTOM_COVER_AI_BUDGET: CustomCoverAiBudget = {
  total: CUSTOM_COVER_LIMITS.maxAiGenerations,
  used: 0,
  remaining: CUSTOM_COVER_LIMITS.maxAiGenerations,
};
