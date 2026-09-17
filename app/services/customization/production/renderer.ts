import sharp from "sharp";

import type {
  A4ProductionInput,
  A4ProductionResult,
  ProductionCoverSide,
  ProductionDesignElement,
  ProductionDesignState,
  ProductionOrientation,
  ProductionSize,
  ProductionSpec,
  ProductionText,
} from "./types";

export const PRODUCTION_SPECS: Record<
  ProductionSize,
  Record<ProductionOrientation, ProductionSpec>
> = {
  A4: {
    portrait: {
      widthPx: 2480,
      heightPx: 3508,
      widthMm: 210,
      heightMm: 297,
      dpi: 300,
      safeZoneMm: 5,
      size: "A4",
      orientation: "portrait",
    },
    landscape: {
      widthPx: 3508,
      heightPx: 2480,
      widthMm: 297,
      heightMm: 210,
      dpi: 300,
      safeZoneMm: 5,
      size: "A4",
      orientation: "landscape",
    },
  },
  A5: {
    portrait: {
      widthPx: 1748,
      heightPx: 2480,
      widthMm: 148,
      heightMm: 210,
      dpi: 300,
      safeZoneMm: 5,
      size: "A5",
      orientation: "portrait",
    },
    landscape: {
      widthPx: 2480,
      heightPx: 1748,
      widthMm: 210,
      heightMm: 148,
      dpi: 300,
      safeZoneMm: 5,
      size: "A5",
      orientation: "landscape",
    },
  },
};

export const A4_PRODUCTION_SPEC = PRODUCTION_SPECS.A4.portrait;

export function getProductionSpec(
  size: ProductionSize = "A4",
  orientation: ProductionOrientation = "portrait",
): ProductionSpec {
  return PRODUCTION_SPECS[size][orientation];
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeAttr(value: string): string {
  return escapeXml(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function safeNumber(
  value: unknown,
  fallback: number,
): number {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : fallback;
}

function textAnchor(
  align: ProductionText["align"],
): "start" | "middle" | "end" {
  if (align === "right") return "end";
  if (align === "center") return "middle";
  return "start";
}

function wrapText(
  text: string,
  maxChars: number,
): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current
      ? `${current} ${word}`
      : word;

    if (
      candidate.length > maxChars &&
      current
    ) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.length ? lines : [""];
}

function renderTextElement(
  element: ProductionDesignElement,
  scaleX: number,
  scaleY: number,
): string {
  const x = element.x * scaleX;
  const y = element.y * scaleY;
  const width = Math.max(1, element.width * scaleX);
  const height = Math.max(1, element.height * scaleY);

  const fontSize =
    Math.max(8, safeNumber(element.fontSize, 32) * Math.min(scaleX, scaleY));

  const lineHeight =
    safeNumber(element.lineHeight, 1.2);

  const weight =
    element.fontWeight ?? 400;

  const color =
    element.color || "#111111";

  const align =
    element.textAlign || "center";

  const anchor =
    align === "right"
      ? "end"
      : align === "left"
        ? "start"
        : "middle";

  const anchorX =
    align === "right"
      ? x + width
      : align === "left"
        ? x
        : x + width / 2;

  const lines = wrapText(
    element.text || "",
    Math.max(
      4,
      Math.floor(
        width /
          Math.max(fontSize * 0.55, 1),
      ),
    ),
  );

  const totalHeight =
    lines.length *
    fontSize *
    lineHeight;

  const firstBaseline =
    y +
    Math.max(
      fontSize,
      (height - totalHeight) / 2 + fontSize,
    );

  const tspans = lines
    .map(
      (line, index) =>
        `<tspan x="${anchorX}" dy="${
          index === 0
            ? 0
            : fontSize * lineHeight
        }">${escapeXml(line)}</tspan>`,
    )
    .join("");

  const letterSpacing =
    safeNumber(element.letterSpacing, 0) *
    Math.min(scaleX, scaleY);

  const rotation =
    safeNumber(element.rotation, 0);

  const opacity =
    clamp(
      safeNumber(element.opacity, 1),
      0,
      1,
    );

  return `
    <g
      transform="rotate(${rotation} ${x + width / 2} ${y + height / 2})"
      opacity="${opacity}"
    >
      <text
        x="${anchorX}"
        y="${firstBaseline}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${fontSize}px"
        font-weight="${escapeAttr(String(weight))}"
        fill="${escapeAttr(color)}"
        text-anchor="${anchor}"
        letter-spacing="${letterSpacing}px"
      >${tspans}</text>
    </g>
  `;
}

function renderShapeElement(
  element: ProductionDesignElement,
  scaleX: number,
  scaleY: number,
): string {
  const x = element.x * scaleX;
  const y = element.y * scaleY;
  const width = Math.max(1, element.width * scaleX);
  const height = Math.max(1, element.height * scaleY);

  const fill = element.fill || "#000000";

  const opacity =
    clamp(
      safeNumber(element.opacity, 1),
      0,
      1,
    );

  const rotation =
    safeNumber(element.rotation, 0);

  const radius =
    safeNumber(element.borderRadius, 0) *
    Math.min(scaleX, scaleY);

  const cx = x + width / 2;
  const cy = y + height / 2;

  if (element.shape === "circle") {
    return `
      <ellipse
        cx="${cx}"
        cy="${cy}"
        rx="${width / 2}"
        ry="${height / 2}"
        fill="${escapeAttr(fill)}"
        opacity="${opacity}"
        transform="rotate(${rotation} ${cx} ${cy})"
      />
    `;
  }

  return `
    <rect
      x="${x}"
      y="${y}"
      width="${width}"
      height="${height}"
      rx="${radius}"
      ry="${radius}"
      fill="${escapeAttr(fill)}"
      opacity="${opacity}"
      transform="rotate(${rotation} ${cx} ${cy})"
    />
  `;
}

type ProductionAssetBuffer =
  | Buffer
  | {
      buffer: Buffer;
      mimeType?: string | null;
    };

function renderImageElement(
  element: ProductionDesignElement,
  scaleX: number,
  scaleY: number,
  assetBuffers: Record<string, ProductionAssetBuffer>,
): string {
  const assetId = element.assetId;

  if (!assetId) {
    return "";
  }

  const asset = assetBuffers[assetId];

  if (!asset) {
    throw new Error(
      `Production asset ${assetId} is missing.`,
    );
  }

  const buffer =
    Buffer.isBuffer(asset)
      ? asset
      : asset.buffer;

  const mime =
    Buffer.isBuffer(asset)
      ? "image/png"
      : asset.mimeType || "image/png";

  const x = element.x * scaleX;
  const y = element.y * scaleY;
  const width = Math.max(1, element.width * scaleX);
  const height = Math.max(1, element.height * scaleY);

  const imageScale =
    Math.max(
      0.01,
      safeNumber(element.imageScale, 1),
    );

  const offsetX =
    safeNumber(element.imageOffsetX, 0) *
    scaleX;

  const offsetY =
    safeNumber(element.imageOffsetY, 0) *
    scaleY;

  const rotation =
    safeNumber(element.rotation, 0);

  const opacity =
    clamp(
      safeNumber(element.opacity, 1),
      0,
      1,
    );

  const objectFit =
    element.objectFit || "contain";

  const dataUrl =
    `data:${mime};base64,${buffer.toString("base64")}`;

  const clipId =
    `clip-${element.id.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const preserveAspectRatio =
    objectFit === "cover"
      ? "xMidYMid slice"
      : objectFit === "fill"
        ? "none"
        : "xMidYMid meet";

  const cx = x + width / 2;
  const cy = y + height / 2;

  return `
    <defs>
      <clipPath id="${clipId}">
        <rect
          x="${x}"
          y="${y}"
          width="${width}"
          height="${height}"
          rx="${Math.max(
            0,
            safeNumber(element.borderRadius, 0) *
              Math.min(scaleX, scaleY),
          )}"
        />
      </clipPath>
    </defs>

    <g
      opacity="${opacity}"
      transform="
        rotate(${rotation} ${cx} ${cy})
        translate(${offsetX} ${offsetY})
      "
    >
      <image
        href="${dataUrl}"
        x="${x + (width * (1 - imageScale)) / 2}"
        y="${y + (height * (1 - imageScale)) / 2}"
        width="${width * imageScale}"
        height="${height * imageScale}"
        preserveAspectRatio="${preserveAspectRatio}"
        clip-path="url(#${clipId})"
      />
    </g>
  `;
}

function buildDesignSvg(
  design: ProductionDesignState,
  spec: ProductionSpec,
  assetBuffers: Record<string, ProductionAssetBuffer>,
): string {
  const sourceWidth =
    safeNumber(
      design.canvasWidth,
      600,
    );

  const sourceHeight =
    safeNumber(
      design.canvasHeight,
      800,
    );

  const scaleX =
    spec.widthPx / sourceWidth;

  const scaleY =
    spec.heightPx / sourceHeight;

  const background =
    design.background || "#ffffff";

  const elements =
    [...(design.elements || [])]
      .sort(
        (a, b) =>
          safeNumber(a.zIndex, 0) -
          safeNumber(b.zIndex, 0),
      );

  const renderedElements =
    elements
      .map((element) => {
        if (element.type === "text") {
          return renderTextElement(
            element,
            scaleX,
            scaleY,
          );
        }

        if (element.type === "image") {
          return renderImageElement(
            element,
            scaleX,
            scaleY,
            assetBuffers,
          );
        }

        if (element.type === "shape") {
          return renderShapeElement(
            element,
            scaleX,
            scaleY,
          );
        }

        return "";
      })
      .join("");

  return `
    <svg
      width="${spec.widthPx}"
      height="${spec.heightPx}"
      viewBox="0 0 ${spec.widthPx} ${spec.heightPx}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0"
        y="0"
        width="${spec.widthPx}"
        height="${spec.heightPx}"
        fill="${escapeAttr(background)}"
      />

      ${renderedElements}
    </svg>
  `;
}

function buildLegacyTextLayer(
  input: A4ProductionInput,
  spec: ProductionSpec,
): Buffer {
  const safeZonePx =
    (spec.safeZoneMm / 25.4) * spec.dpi;

  const generatedTexts: ProductionText[] = [];

  if (input.customerName?.trim()) {
    generatedTexts.push({
      content: input.customerName.trim(),
      x: spec.widthPx / 2,
      y: spec.heightPx - safeZonePx - 190,
      fontSize: 92,
      fontWeight: 700,
      color: "#ffffff",
      align: "center",
    });
  }

  if (input.customerText?.trim()) {
    generatedTexts.push({
      content: input.customerText.trim(),
      x: spec.widthPx / 2,
      y: spec.heightPx - safeZonePx - 80,
      fontSize: 52,
      fontWeight: 400,
      color: "#ffffff",
      align: "center",
    });
  }

  const branding = input.branding ?? {};

  const texts = [
    ...generatedTexts,
    ...(input.texts ?? []),
  ]
    .filter((text) => text.content.trim())
    .map((text) => {
      const x = clamp(
        text.x ?? spec.widthPx / 2,
        safeZonePx,
        spec.widthPx - safeZonePx,
      );

      const y = clamp(
        text.y ?? spec.heightPx / 2,
        safeZonePx,
        spec.heightPx - safeZonePx,
      );

      return `
        <text
          x="${x}"
          y="${y}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${clamp(text.fontSize ?? 64, 16, 240)}px"
          font-weight="${text.fontWeight ?? 400}"
          fill="${escapeAttr(text.color ?? "#ffffff")}"
          text-anchor="${textAnchor(text.align ?? "center")}"
          dominant-baseline="middle"
        >${escapeXml(text.content)}</text>
      `;
    })
    .join("");

  const brandingElements: string[] = [];

  if (branding.mineNote !== false) {
    brandingElements.push(`
      <text
        x="${spec.widthPx - safeZonePx}"
        y="${spec.heightPx - safeZonePx}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="42px"
        font-weight="700"
        fill="#ffffff"
        text-anchor="end"
      >MineNote</text>
    `);
  }

  if (branding.auraCraft) {
    brandingElements.push(`
      <text
        x="${safeZonePx}"
        y="${spec.heightPx - safeZonePx}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="32px"
        fill="#ffffff"
      >by AuraCraft</text>
    `);
  }

  return Buffer.from(`
    <svg
      width="${spec.widthPx}"
      height="${spec.heightPx}"
      viewBox="0 0 ${spec.widthPx} ${spec.heightPx}"
      xmlns="http://www.w3.org/2000/svg"
    >
      ${texts}
      ${brandingElements.join("")}
    </svg>
  `);
}

export async function renderDesignStateToProduction(
  design: ProductionDesignState,
  options: {
    size: ProductionSize;
    orientation: ProductionOrientation;
    assetBuffers?: Record<string, ProductionAssetBuffer>;
  },
): Promise<A4ProductionResult> {
  const spec = getProductionSpec(
    options.size,
    options.orientation,
  );

  const svg = buildDesignSvg(
    design,
    spec,
    options.assetBuffers ?? {},
  );

  const result = await sharp(Buffer.from(svg), {
    failOn: "error",
  })
    .png({
      compressionLevel: 9,
      adaptiveFiltering: true,
    })
    .withMetadata({
      density: spec.dpi,
    })
    .toBuffer();

  return {
    buffer: result,
    size: options.size,
    orientation: options.orientation,
    widthPx: spec.widthPx,
    heightPx: spec.heightPx,
    dpi: spec.dpi,
    mimeType: "image/png",
    fileSize: result.length,
  };
}

export async function renderA4ProductionCover(
  input: A4ProductionInput,
): Promise<A4ProductionResult> {
  const size = input.size ?? "A4";
  const orientation = input.orientation ?? "portrait";
  const spec = getProductionSpec(size, orientation);

  if (input.design) {
    return renderDesignStateToProduction(
      input.design,
      {
        size,
        orientation,
        assetBuffers: input.assetBuffers,
      },
    );
  }

  if (
    !Buffer.isBuffer(input.artwork) ||
    input.artwork.length === 0
  ) {
    throw new Error("Production artwork is required.");
  }

  const artwork = sharp(input.artwork, {
    failOn: "error",
  });

  const metadata = await artwork.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(
      "Unable to read artwork dimensions.",
    );
  }

  const background =
    input.background?.trim() || "#111111";

  const resizedArtwork = await artwork
    .resize({
      width: spec.widthPx,
      height: spec.heightPx,
      fit: "contain",
      position: "centre",
      background,
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer();

  const textLayer =
    buildLegacyTextLayer(input, spec);

  const result = await sharp({
    create: {
      width: spec.widthPx,
      height: spec.heightPx,
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
      density: spec.dpi,
    })
    .png({
      compressionLevel: 9,
      adaptiveFiltering: true,
    })
    .toBuffer();

  return {
    buffer: result,
    size,
    orientation,
    widthPx: spec.widthPx,
    heightPx: spec.heightPx,
    dpi: spec.dpi,
    mimeType: "image/png",
    fileSize: result.length,
  };
}
