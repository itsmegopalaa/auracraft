import sharp from "sharp";
import type {
  A4ProductionInput,
  A4ProductionResult,
  ProductionText,
} from "./types";

export const A4_PRODUCTION_SPEC = {
  widthPx: 2480,
  heightPx: 3508,
  widthMm: 210,
  heightMm: 297,
  dpi: 300,
  safeZoneMm: 5,
} as const;

const SAFE_ZONE_PX =
  (A4_PRODUCTION_SPEC.safeZoneMm / 25.4) *
  A4_PRODUCTION_SPEC.dpi;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function textAnchor(
  align: ProductionText["align"]
): "start" | "middle" | "end" {
  if (align === "right") return "end";
  if (align === "center") return "middle";
  return "start";
}

function buildTextLayer(input: A4ProductionInput): Buffer {
  const customerName = input.customerName?.trim() ?? "";
  const customerText = input.customerText?.trim() ?? "";

  const customTexts = input.texts ?? [];

  const generatedTexts: ProductionText[] = [];

  if (customerName) {
    generatedTexts.push({
      content: customerName,
      x: A4_PRODUCTION_SPEC.widthPx / 2,
      y: A4_PRODUCTION_SPEC.heightPx - SAFE_ZONE_PX - 190,
      fontSize: 92,
      fontWeight: 700,
      color: "#ffffff",
      align: "center",
    });
  }

  if (customerText) {
    generatedTexts.push({
      content: customerText,
      x: A4_PRODUCTION_SPEC.widthPx / 2,
      y: A4_PRODUCTION_SPEC.heightPx - SAFE_ZONE_PX - 80,
      fontSize: 52,
      fontWeight: 400,
      color: "#ffffff",
      align: "center",
    });
  }

  const allTexts = [...generatedTexts, ...customTexts];

  const textElements = allTexts
    .filter((text) => text.content.trim())
    .map((text) => {
      const x = clamp(
        text.x ?? A4_PRODUCTION_SPEC.widthPx / 2,
        SAFE_ZONE_PX,
        A4_PRODUCTION_SPEC.widthPx - SAFE_ZONE_PX
      );

      const y = clamp(
        text.y ?? A4_PRODUCTION_SPEC.heightPx / 2,
        SAFE_ZONE_PX,
        A4_PRODUCTION_SPEC.heightPx - SAFE_ZONE_PX
      );

      const fontSize = clamp(
        text.fontSize ?? 64,
        16,
        240
      );

      return `
        <text
          x="${x}"
          y="${y}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${fontSize}px"
          font-weight="${text.fontWeight ?? 400}"
          fill="${escapeXml(text.color ?? "#ffffff")}"
          text-anchor="${textAnchor(text.align ?? "center")}"
          dominant-baseline="middle"
        >${escapeXml(text.content)}</text>
      `;
    })
    .join("");

  const branding = input.branding ?? {};

  const brandingElements: string[] = [];

  if (branding.mineNote !== false) {
    brandingElements.push(`
      <text
        x="${A4_PRODUCTION_SPEC.widthPx - SAFE_ZONE_PX}"
        y="${A4_PRODUCTION_SPEC.heightPx - SAFE_ZONE_PX}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="42px"
        font-weight="700"
        fill="#ffffff"
        text-anchor="end"
        dominant-baseline="ideographic"
      >MineNote</text>
    `);
  }

  if (branding.auraCraft) {
    brandingElements.push(`
      <text
        x="${SAFE_ZONE_PX}"
        y="${A4_PRODUCTION_SPEC.heightPx - SAFE_ZONE_PX}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="32px"
        font-weight="400"
        fill="#ffffff"
        text-anchor="start"
        dominant-baseline="ideographic"
      >by AuraCraft</text>
    `);
  }

  const svg = `
    <svg
      width="${A4_PRODUCTION_SPEC.widthPx}"
      height="${A4_PRODUCTION_SPEC.heightPx}"
      viewBox="0 0 ${A4_PRODUCTION_SPEC.widthPx} ${A4_PRODUCTION_SPEC.heightPx}"
      xmlns="http://www.w3.org/2000/svg"
    >
      ${textElements}
      ${brandingElements.join("")}
    </svg>
  `;

  return Buffer.from(svg);
}

export async function renderA4ProductionCover(
  input: A4ProductionInput
): Promise<A4ProductionResult> {
  if (!Buffer.isBuffer(input.artwork) || input.artwork.length === 0) {
    throw new Error("Production artwork is required.");
  }

  const artwork = sharp(input.artwork, {
    failOn: "error",
  });

  const metadata = await artwork.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Unable to read artwork dimensions.");
  }

  const outputWidth = A4_PRODUCTION_SPEC.widthPx;
  const outputHeight = A4_PRODUCTION_SPEC.heightPx;

  const background =
    input.background?.trim() || "#111111";

  const resizedArtwork = await artwork
    .resize({
      width: outputWidth,
      height: outputHeight,
      fit: "cover",
      position: "centre",
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer();

  const textLayer = buildTextLayer(input);

  const result = await sharp({
    create: {
      width: outputWidth,
      height: outputHeight,
      channels: 4,
      background,
    },
  })
    .composite([
      {
        input: resizedArtwork,
        left: 0,
        top: 0,
      },
      {
        input: textLayer,
        left: 0,
        top: 0,
      },
    ])
    .withMetadata({
      density: A4_PRODUCTION_SPEC.dpi,
    })
    .png({
      compressionLevel: 9,
      adaptiveFiltering: true,
    })
    .toBuffer();

  return {
    buffer: result,
    widthPx: outputWidth,
    heightPx: outputHeight,
    dpi: A4_PRODUCTION_SPEC.dpi,
    mimeType: "image/png",
    fileSize: result.length,
  };
}
