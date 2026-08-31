import { ValidationError } from "@/app/lib/errors";

export async function parseJsonBody<T>(
  request: Request
): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new ValidationError(
      "Invalid JSON request body."
    );
  }
}

export function getRequiredParam(
  value: string | undefined,
  name: string
): string {
  const normalized = value?.trim();

  if (!normalized) {
    throw new ValidationError(
      `${name} is required.`
    );
  }

  return normalized;
}
