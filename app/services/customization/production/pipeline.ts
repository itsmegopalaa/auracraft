import {
  upscaleArtwork,
} from "../upscale";

import {
  renderA4ProductionCover,
} from "./renderer";

import type {
  ProductionPipelineInput,
  ProductionPipelineResult,
} from "./pipeline-types";

const A4_WIDTH = 2480;
const A4_HEIGHT = 3508;

export async function createProductionCover(
  input: ProductionPipelineInput
): Promise<ProductionPipelineResult> {
  if (!Buffer.isBuffer(input.artwork)) {
    throw new Error(
      "Production artwork must be a Buffer."
    );
  }

  if (
    !Number.isInteger(input.sourceWidth) ||
    input.sourceWidth <= 0
  ) {
    throw new Error(
      "Invalid source artwork width."
    );
  }

  if (
    !Number.isInteger(input.sourceHeight) ||
    input.sourceHeight <= 0
  ) {
    throw new Error(
      "Invalid source artwork height."
    );
  }

  if (!input.sourceMimeType) {
    throw new Error(
      "Source artwork MIME type is required."
    );
  }

  /*
   * Stage 1
   *
   * Normalize/enhance source artwork to the exact
   * A4 production dimensions.
   *
   * Current provider is high-quality Sharp/Lanczos
   * resampling. A real AI super-resolution provider
   * can replace it later.
   */
  const upscale = await upscaleArtwork({
    artwork: input.artwork,
    width: input.sourceWidth,
    height: input.sourceHeight,
    mimeType: input.sourceMimeType,
    targetWidth: A4_WIDTH,
    targetHeight: A4_HEIGHT,
    provider: input.upscaleProvider ?? "sharp",
  });

  /*
   * Stage 2
   *
   * Apply customer text, branding and final
   * print metadata on top of the normalized A4 art.
   */
  const production =
    await renderA4ProductionCover({
      artwork: upscale.buffer,
      customerName: input.customerName,
      customerText: input.customerText,
      side: input.side,
      background: input.background,
      branding: input.branding,
      texts: input.texts,
    });

  /*
   * Hard production invariant.
   *
   * Nothing leaves this pipeline unless it is
   * exactly A4 at 300 DPI.
   */
  if (
    production.widthPx !== A4_WIDTH ||
    production.heightPx !== A4_HEIGHT
  ) {
    throw new Error(
      `Production output must be ${A4_WIDTH}×${A4_HEIGHT}px.`
    );
  }

  if (production.dpi !== 300) {
    throw new Error(
      "Production output must use 300 DPI metadata."
    );
  }

  if (production.mimeType !== "image/png") {
    throw new Error(
      "Production output must be PNG."
    );
  }

  return {
    production,

    source: {
      width: input.sourceWidth,
      height: input.sourceHeight,
      mimeType: input.sourceMimeType,
    },

    upscale: {
      provider: upscale.provider,
      width: upscale.width,
      height: upscale.height,
      scaleFactor: upscale.scaleFactor,
      fileSize: upscale.fileSize,
    },

    final: {
      width: production.widthPx,
      height: production.heightPx,
      dpi: production.dpi,
      mimeType: production.mimeType,
      fileSize: production.fileSize,
    },
  };
}
