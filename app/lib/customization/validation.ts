import {
  CUSTOM_COVER_LIMITS,
  CUSTOM_COVER_CREATION_METHODS,
  CUSTOM_COVER_STATUSES,
} from "./constants";
import type {
  CustomCoverCustomization,
  CustomCoverCreationMethod,
  CustomCoverStatus,
} from "./types";

export function isCustomCoverCreationMethod(
  value: unknown
): value is CustomCoverCreationMethod {
  return (
    typeof value === "string" &&
    CUSTOM_COVER_CREATION_METHODS.includes(
      value as CustomCoverCreationMethod
    )
  );
}

export function isCustomCoverStatus(
  value: unknown
): value is CustomCoverStatus {
  return (
    typeof value === "string" &&
    CUSTOM_COVER_STATUSES.includes(value as CustomCoverStatus)
  );
}

export function validateCustomerText(
  value: string | undefined
): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();

  if (normalized.length > CUSTOM_COVER_LIMITS.maxTextLength) {
    throw new Error(
      `Custom text cannot exceed ${CUSTOM_COVER_LIMITS.maxTextLength} characters.`
    );
  }

  return normalized || null;
}

export function validateAiPrompt(value: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error("AI cover prompt is required.");
  }

  if (normalized.length > CUSTOM_COVER_LIMITS.maxPromptLength) {
    throw new Error(
      `AI prompt cannot exceed ${CUSTOM_COVER_LIMITS.maxPromptLength} characters.`
    );
  }

  return normalized;
}

export function validateCustomization(
  customization: CustomCoverCustomization
): void {
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(customization.productId)) {
    throw new Error("Invalid product ID.");
  }

  if (!isCustomCoverCreationMethod(customization.creationMethod)) {
    throw new Error("Invalid custom cover creation method.");
  }

  if (!isCustomCoverStatus(customization.status)) {
    throw new Error("Invalid custom cover status.");
  }

  if (customization.version < 1) {
    throw new Error("Invalid customization version.");
  }

  validateCustomerText(customization.customerName);
  validateCustomerText(customization.customerText);
}
