import { customCoverTemplates } from "@/app/data/custom-cover/templates";
import type { CustomCoverTemplate } from "@/app/lib/customization";

export function getCustomCoverTemplates(): CustomCoverTemplate[] {
  return customCoverTemplates.filter((template) => template.active);
}

export function getCustomCoverTemplate(
  id: string
): CustomCoverTemplate | null {
  return (
    customCoverTemplates.find(
      (template) => template.id === id && template.active
    ) ?? null
  );
}
