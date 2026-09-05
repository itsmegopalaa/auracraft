import {
  CUSTOM_COVER_VERSION,
  DEFAULT_CUSTOM_COVER_PRINT_SPEC,
  DEFAULT_CUSTOM_COVER_PHYSICAL_CONFIG,
  DEFAULT_CUSTOM_COVER_AI_BUDGET,
  validateCustomization,
  validateCustomerText,
} from "@/app/lib/customization";

import type {
  CustomCoverCustomization,
  CustomCoverCreationMethod,
} from "@/app/lib/customization";

export type CreateCustomizationInput = {
  productId: string;
  creationMethod: CustomCoverCreationMethod;
  customerId?: string;
  templateId?: string;
  customerName?: string;
  customerText?: string;
  creativeDirection?: {
    category: string;
    theme: string;
  };
};

export function createDraftCustomization(
  input: CreateCustomizationInput
): CustomCoverCustomization {
  const customization: CustomCoverCustomization = {
    productId: input.productId,
    customerId: input.customerId,
    templateId: input.templateId,
    creationMethod: input.creationMethod,
    status: "draft",
    version: CUSTOM_COVER_VERSION,
    customerName: validateCustomerText(input.customerName) ?? undefined,
    customerText: validateCustomerText(input.customerText) ?? undefined,
    physicalConfig: DEFAULT_CUSTOM_COVER_PHYSICAL_CONFIG,
    aiBudget: DEFAULT_CUSTOM_COVER_AI_BUDGET,
    design: {
      front: {
        assets: [],
        texts: [],
      },
      insideFront: {
        assets: [],
        texts: [],
      },
      back: {
        assets: [],
        texts: [],
      },
      insideBack: {
        assets: [],
        texts: [],
      },
      branding: {
        mineNote: true,
        auraCraft: false,
        logoVariant: "default",
      },
      ...(input.creativeDirection
        ? {
            creativeDirection: {
              category: input.creativeDirection.category,
              theme: input.creativeDirection.theme,
            },
          }
        : {}),
    },
    printSpec: DEFAULT_CUSTOM_COVER_PRINT_SPEC,
  };

  validateCustomization(customization);

  return customization;
}
