import type { CustomCoverPrintSpec } from "./types";

export const CUSTOM_COVER_LIMITS = {
  maxTextLength: 120,
  maxPromptLength: 1000,
  maxUploadBytes: 15 * 1024 * 1024,
  maxAiGenerations: 2,
} as const;

/**
 * Temporary foundation specification.
 *
 * IMPORTANT:
 * Replace these values once the physical notebook printer/manufacturer
 * specification is finalized. Nothing in the editor should hard-code
 * dimensions outside this object.
 */
export const DEFAULT_CUSTOM_COVER_PRINT_SPEC: CustomCoverPrintSpec = {
  widthMm: 216,
  heightMm: 279,
  bleedMm: 3,
  safeZoneMm: 5,
  dpi: 300,
  colorProfile: "sRGB",
};

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
