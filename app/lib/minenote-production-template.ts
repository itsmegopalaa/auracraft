import {
  PRODUCT_PRODUCTION_SIDES,
  type ProductProductionSide,
} from "@/app/lib/product-production-assets";

export const MINENOTE_TEMPLATE_KEY = "minenote-notebook";

export const MINENOTE_TEMPLATE_VERSION = "v1";

export const MINENOTE_TEMPLATE_STATUSES = [
  "draft",
  "active",
  "retired",
] as const;

export type MineNoteTemplateStatus =
  (typeof MINENOTE_TEMPLATE_STATUSES)[number];

export const MINENOTE_REQUIRED_ELEMENTS = [
  "minenote_branding",
  "product_information",
  "production_metadata",
] as const;

export type MineNoteRequiredElement =
  (typeof MINENOTE_REQUIRED_ELEMENTS)[number];

export type MineNoteProductionTemplate = {
  id: string;
  templateKey: string;
  version: string;
  name: string;
  description?: string | null;
  status: MineNoteTemplateStatus;
  locked: boolean;
  requiredElements: MineNoteRequiredElement[];
};

export type MineNoteProductionTemplateAsset = {
  id: string;
  templateId: string;
  side: ProductProductionSide;
  storagePath: string;
  width?: number | null;
  height?: number | null;
  mimeType?: string | null;
  metadata?: Record<string, unknown>;
};

export function isMineNoteTemplateStatus(
  value: unknown,
): value is MineNoteTemplateStatus {
  return (
    typeof value === "string" &&
    (MINENOTE_TEMPLATE_STATUSES as readonly string[]).includes(value)
  );
}

export function isMineNoteRequiredElement(
  value: unknown,
): value is MineNoteRequiredElement {
  return (
    typeof value === "string" &&
    (MINENOTE_REQUIRED_ELEMENTS as readonly string[]).includes(value)
  );
}

export function hasAllMineNoteRequiredElements(
  value: unknown,
): value is MineNoteRequiredElement[] {
  if (!Array.isArray(value)) {
    return false;
  }

  return MINENOTE_REQUIRED_ELEMENTS.every((element) =>
    value.includes(element),
  );
}

export function hasAllTemplateSides(
  assets: Array<{ side?: unknown }>,
): boolean {
  if (assets.length !== PRODUCT_PRODUCTION_SIDES.length) {
    return false;
  }

  return PRODUCT_PRODUCTION_SIDES.every((side) =>
    assets.some((asset) => asset.side === side),
  );
}

export function canEditMineNoteTemplate(
  template: Pick<MineNoteProductionTemplate, "status" | "locked">,
): boolean {
  return template.status === "draft" && !template.locked;
}
