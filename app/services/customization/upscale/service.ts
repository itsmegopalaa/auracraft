import sharp from "sharp";

import type {
  UpscaleInput,
  UpscaleResult,
  UpscaleProvider,
} from "./types";

function validateDimensions(
  width: number,
  height: number
) {
  if (!Number.isInteger(width) || width <= 0) {
    throw new Error("Invalid source width.");
  }

  if (!Number.isInteger(height) || height <= 0) {
    throw new Error("Invalid source height.");
  }
}

function calculateScaleFactor(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
) {
  const widthScale = targetWidth / sourceWidth;
  const heightScale = targetHeight / sourceHeight;

  return Math.max(widthScale, heightScale);
}

/**
 * Fallback/local enhancement provider.
 *
 * This is high-quality Lanczos resampling, NOT AI super-resolution.
 * A real AI provider can replace this implementation later without
 * changing the production pipeline.
 */
export const sharpUpscaleProvider: UpscaleProvider = {
  id: "sharp",
  name: "Sharp High Quality Resampling",

  async upscale(
    input: UpscaleInput
  ): Promise<UpscaleResult> {
    validateDimensions(
      input.width,
      input.height
    );

    validateDimensions(
      input.targetWidth,
      input.targetHeight
    );

    if (!Buffer.isBuffer(input.artwork)) {
      throw new Error("Upscale artwork must be a Buffer.");
    }

    const scaleFactor =
      calculateScaleFactor(
        input.width,
        input.height,
        input.targetWidth,
        input.targetHeight
      );

    const buffer = await sharp(input.artwork)
      .resize({
        width: input.targetWidth,
        height: input.targetHeight,
        fit: "cover",
        position: "centre",
        kernel: sharp.kernel.lanczos3,
      })
      .png({
        compressionLevel: 9,
        adaptiveFiltering: true,
      })
      .toBuffer();

    return {
      buffer,
      width: input.targetWidth,
      height: input.targetHeight,
      mimeType: "image/png",
      provider: "sharp",
      scaleFactor,
      fileSize: buffer.length,
    };
  },
};
