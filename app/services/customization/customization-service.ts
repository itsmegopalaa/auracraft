import {
  CUSTOM_COVER_VERSION,
  DEFAULT_CUSTOM_COVER_PRINT_SPEC,
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
    design: {
      front: {
        assets: [],
        texts: [],
      },
      back: {
        assets: [],
        texts: [],
      },
      branding: {
        mineNote: true,
        auraCraft: false,
        logoVariant: "default",
      },
    },
    printSpec: DEFAULT_CUSTOM_COVER_PRINT_SPEC,
  };

  validateCustomization(customization);

  return customization;
}
