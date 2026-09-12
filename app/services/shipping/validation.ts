import type {
  ResolvedShippingPackage,
  ShippingSnapshot,
  ShippingValidationIssue,
  ShippingValidationResult,
} from "./types";

const SUPPORTED_SNAPSHOT_VERSION = 1;

function isPositiveFiniteNumber(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  );
}

function addIssue(
  issues: ShippingValidationIssue[],
  issue: ShippingValidationIssue
) {
  issues.push(issue);
}

export function validateShippingSnapshot(
  snapshot: unknown,
  destinationPin?: unknown
): ShippingValidationResult {
  const errors: ShippingValidationIssue[] = [];
  const warnings: ShippingValidationIssue[] = [];

  if (!snapshot || typeof snapshot !== "object") {
    addIssue(errors, {
      code: "MISSING_SNAPSHOT",
      message: "Shipping snapshot is missing.",
    });

    return {
      valid: false,
      errors,
      warnings,
      package: null,
    };
  }

  const value = snapshot as Partial<ShippingSnapshot>;

  if (value.version !== SUPPORTED_SNAPSHOT_VERSION) {
    addIssue(errors, {
      code: "UNSUPPORTED_SNAPSHOT_VERSION",
      message: `Unsupported shipping snapshot version. Expected ${SUPPORTED_SNAPSHOT_VERSION}.`,
    });
  }

  if (!Array.isArray(value.items) || value.items.length === 0) {
    addIssue(errors, {
      code: "INVALID_SNAPSHOT",
      message: "Shipping snapshot contains no items.",
    });
  }

  if (!isPositiveFiniteNumber(value.total_weight_grams)) {
    addIssue(errors, {
      code: "INVALID_TOTAL_WEIGHT",
      message: "Shipping snapshot total weight must be greater than zero.",
    });
  }

  let calculatedWeight = 0;

  if (Array.isArray(value.items)) {
    for (const item of value.items) {
      if (!item || typeof item !== "object") {
        addIssue(errors, {
          code: "INVALID_ITEM",
          message: "Shipping snapshot contains an invalid item.",
        });
        continue;
      }

      const shippingItem = item as ShippingSnapshot["items"][number];

      if (
        typeof shippingItem.product_id !== "string" ||
        !shippingItem.product_id.trim()
      ) {
        addIssue(errors, {
          code: "INVALID_ITEM",
          message: "Shipping snapshot contains an item without a valid product ID.",
        });
      }

      if (
        !Number.isInteger(shippingItem.quantity) ||
        shippingItem.quantity < 1
      ) {
        addIssue(errors, {
          code: "INVALID_QUANTITY",
          message: `Invalid quantity for ${shippingItem.name || "shipping item"}.`,
          product_id: shippingItem.product_id,
        });
      }

      if (!isPositiveFiniteNumber(shippingItem.shipping_weight_grams)) {
        addIssue(errors, {
          code: "MISSING_WEIGHT",
          message: `Shipping weight is missing for ${shippingItem.name || "product"}.`,
          product_id: shippingItem.product_id,
        });
      } else if (
        Number.isInteger(shippingItem.quantity) &&
        shippingItem.quantity > 0
      ) {
        calculatedWeight +=
          shippingItem.shipping_weight_grams * shippingItem.quantity;
      }

      const dimensions = [
        shippingItem.package_length_cm,
        shippingItem.package_width_cm,
        shippingItem.package_height_cm,
      ];

      if (dimensions.some((dimension) => dimension == null)) {
        addIssue(errors, {
          code: "MISSING_DIMENSIONS",
          message: `Package dimensions are incomplete for ${shippingItem.name || "product"}.`,
          product_id: shippingItem.product_id,
        });
      } else if (
        dimensions.some((dimension) => !isPositiveFiniteNumber(dimension))
      ) {
        addIssue(errors, {
          code: "INVALID_DIMENSIONS",
          message: `Package dimensions are invalid for ${shippingItem.name || "product"}.`,
          product_id: shippingItem.product_id,
        });
      }
    }
  }

  if (
    isPositiveFiniteNumber(value.total_weight_grams) &&
    calculatedWeight !== value.total_weight_grams
  ) {
    addIssue(errors, {
      code: "WEIGHT_MISMATCH",
      message: "Shipping snapshot total weight does not match its item weights.",
    });
  }

  const pin = String(destinationPin ?? "").trim();

  if (!pin) {
    addIssue(errors, {
      code: "MISSING_DESTINATION",
      message: "Destination PIN code is required.",
    });
  } else if (!/^\d{6}$/.test(pin)) {
    addIssue(errors, {
      code: "INVALID_PIN",
      message: "Destination PIN code must contain exactly 6 digits.",
    });
  }

  let resolvedPackage: ResolvedShippingPackage | null = null;

  if (errors.length === 0 && Array.isArray(value.items)) {
    const firstItem = value.items[0];

    if (
      firstItem &&
      isPositiveFiniteNumber(firstItem.package_length_cm) &&
      isPositiveFiniteNumber(firstItem.package_width_cm) &&
      isPositiveFiniteNumber(firstItem.package_height_cm)
    ) {
      resolvedPackage = {
        weight_grams: calculatedWeight,
        length_cm: firstItem.package_length_cm,
        width_cm: firstItem.package_width_cm,
        height_cm: firstItem.package_height_cm,
      };
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    package: resolvedPackage,
  };
}