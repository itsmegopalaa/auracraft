import {
  upscaleArtwork,
} from "../upscale";

import {
  getProductionSpec,
  renderA4ProductionCover,
} from "./renderer";

import type {
  ProductionPipelineInput,
  ProductionPipelineResult,
} from "./pipeline-types";

export async function createProductionCover(
  input: ProductionPipelineInput,
): Promise<ProductionPipelineResult> {
  const selectedSize = input.size ?? "A4";
  const selectedOrientation =
    input.orientation ?? "portrait";

  const productionSpec = getProductionSpec(
    selectedSize,
    selectedOrientation,
  );

  if (!Buffer.isBuffer(input.artwork)) {
    throw new Error(
      "Production artwork must be a Buffer.",
    );
  }

  if (
    !Number.isInteger(input.sourceWidth) ||
    input.sourceWidth <= 0
  ) {
    throw new Error(
      "Invalid source artwork width.",
    );
  }

  if (
    !Number.isInteger(input.sourceHeight) ||
    input.sourceHeight <= 0
  ) {
    throw new Error(
      "Invalid source artwork height.",
    );
  }

  if (!input.sourceMimeType) {
    throw new Error(
      "Source artwork MIME type is required.",
    );
  }

  const sourceAspect =
    input.sourceWidth /
    input.sourceHeight;

  const productionAspect =
    productionSpec.widthPx /
    productionSpec.heightPx;

  const targetWidth =
    sourceAspect >= productionAspect
      ? productionSpec.widthPx
      : Math.max(
          1,
          Math.round(
            productionSpec.heightPx *
              sourceAspect,
          ),
        );

  const targetHeight =
    sourceAspect >= productionAspect
      ? Math.max(
          1,
          Math.round(
            productionSpec.widthPx /
              sourceAspect,
          ),
        )
      : productionSpec.heightPx;

  const upscale = await upscaleArtwork({
    artwork: input.artwork,
    width: input.sourceWidth,
    height: input.sourceHeight,
    mimeType: input.sourceMimeType,
    targetWidth,
    targetHeight,
    provider:
      input.upscaleProvider ?? "sharp",
  });

  const production =
    await renderA4ProductionCover({
      artwork: upscale.buffer,
      size: selectedSize,
      orientation: selectedOrientation,
      customerName: input.customerName,
      customerText: input.customerText,
      side: input.side,
      background: input.background,
      branding: input.branding,
      texts: input.texts,
      design: input.design,
      assetBuffers: input.assetBuffers,
    });

  if (
    production.size !== selectedSize ||
    production.orientation !==
      selectedOrientation ||
    production.widthPx !==
      productionSpec.widthPx ||
    production.heightPx !==
      productionSpec.heightPx
  ) {
    throw new Error(
      `Production output must be ${selectedSize} ${selectedOrientation} ${productionSpec.widthPx}×${productionSpec.heightPx}px.`,
    );
  }

  if (production.dpi !== 300) {
    throw new Error(
      "Production output must use 300 DPI metadata.",
    );
  }

  if (production.mimeType !== "image/png") {
    throw new Error(
      "Production output must be PNG.",
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
      size: selectedSize,
      orientation: selectedOrientation,
      width: production.widthPx,
      height: production.heightPx,
      dpi: production.dpi,
      mimeType: production.mimeType,
      fileSize: production.fileSize,
    },
  };
}
