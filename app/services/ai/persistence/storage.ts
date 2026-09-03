import type { CoverSide } from "@/app/lib/customization";

export type CustomCoverStorageBucket =
  | "custom-cover-uploads"
  | "custom-cover-previews"
  | "custom-cover-production";

export function buildCustomCoverStoragePath(input: {
  customerId: string;
  customizationId: string;
  generationId?: string;
  side: CoverSide;
  kind: "original" | "preview" | "production";
  extension: string;
}): string {
  const extension = input.extension
    .replace(/^\./, "")
    .toLowerCase();

  if (!/^[a-z0-9]+$/.test(extension)) {
    throw new Error("Invalid asset extension.");
  }

  return [
    input.customerId,
    input.customizationId,
    input.generationId ?? "current",
    input.side,
    `${input.kind}.${extension}`,
  ].join("/");
}

export function getCustomCoverStorageBucket(
  kind: "original" | "preview" | "production"
): CustomCoverStorageBucket {
  switch (kind) {
    case "original":
      return "custom-cover-uploads";

    case "preview":
      return "custom-cover-previews";

    case "production":
      return "custom-cover-production";

    default:
      throw new Error("Unsupported custom cover asset kind.");
  }
}
