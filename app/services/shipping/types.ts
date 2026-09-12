export type ShippingSnapshotItem = {
  product_id: string;
  name: string;
  quantity: number;
  shipping_weight_grams: number | null;
  package_length_cm: number | null;
  package_width_cm: number | null;
  package_height_cm: number | null;
};

export type ShippingSnapshotPackage = {
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  source: string;
};

export type ShippingSnapshot = {
  version: number;
  captured_at: string;
  total_weight_grams: number;
  items: ShippingSnapshotItem[];
  package: ShippingSnapshotPackage;
};

export type ShippingValidationErrorCode =
  | "MISSING_SNAPSHOT"
  | "UNSUPPORTED_SNAPSHOT_VERSION"
  | "INVALID_SNAPSHOT"
  | "INVALID_ITEM"
  | "INVALID_QUANTITY"
  | "MISSING_WEIGHT"
  | "INVALID_WEIGHT"
  | "MISSING_DIMENSIONS"
  | "INVALID_DIMENSIONS"
  | "INVALID_TOTAL_WEIGHT"
  | "WEIGHT_MISMATCH"
  | "MISSING_DESTINATION"
  | "INVALID_PIN";

export type ShippingValidationIssue = {
  code: ShippingValidationErrorCode;
  message: string;
  product_id?: string;
};

export type ResolvedShippingPackage = {
  weight_grams: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
};

export type ShippingValidationResult = {
  valid: boolean;
  errors: ShippingValidationIssue[];
  warnings: ShippingValidationIssue[];
  package: ResolvedShippingPackage | null;
};