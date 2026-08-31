export function isNonEmptyString(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

export function isPositiveInteger(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value > 0
  );
}

export function isPositiveNumber(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  );
}

export function isValidEmail(
  value: unknown
): value is string {
  if (typeof value !== "string") return false;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value.trim()
  );
}

export function isValidIndianPin(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    /^[1-9][0-9]{5}$/.test(value.trim())
  );
}

export function isValidIndianPhone(
  value: unknown
): value is string {
  if (typeof value !== "string") return false;

  const normalized = value
    .replace(/\s+/g, "")
    .replace(/^(\+91|91)/, "");

  return /^[6-9][0-9]{9}$/.test(normalized);
}

export function requireString(
  value: unknown,
  fieldName: string
): string {
  if (!isNonEmptyString(value)) {
    throw new Error(`${fieldName} is required.`);
  }

  return value.trim();
}
