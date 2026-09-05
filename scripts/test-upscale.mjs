import sharp from "sharp";
import { upscaleArtwork } from "../app/services/customization/upscale/index.ts";

const SOURCE_WIDTH = 1240;
const SOURCE_HEIGHT = 1754;

const TARGET_WIDTH = 2480;
const TARGET_HEIGHT = 3508;

const source = await sharp({
  create: {
    width: SOURCE_WIDTH,
    height: SOURCE_HEIGHT,
    channels: 3,
    background: {
      r: 30,
      g: 30,
      b: 30,
    },
  },
})
  .png()
  .toBuffer();

const sourceMetadata =
  await sharp(source).metadata();

console.log("===== SOURCE =====");
console.log("width:", sourceMetadata.width);
console.log("height:", sourceMetadata.height);
console.log("format:", sourceMetadata.format);

const result = await upscaleArtwork({
  artwork: source,
  width: SOURCE_WIDTH,
  height: SOURCE_HEIGHT,
  mimeType: "image/png",
  targetWidth: TARGET_WIDTH,
  targetHeight: TARGET_HEIGHT,
  provider: "sharp",
});

console.log("");
console.log("===== UPSCALE RESULT =====");
console.log("provider:", result.provider);
console.log("width:", result.width);
console.log("height:", result.height);
console.log("scale:", result.scaleFactor);
console.log("format:", result.mimeType);
console.log("fileSize:", result.fileSize);

const outputMetadata =
  await sharp(result.buffer).metadata();

console.log("");
console.log("===== OUTPUT METADATA =====");
console.log("width:", outputMetadata.width);
console.log("height:", outputMetadata.height);
console.log("format:", outputMetadata.format);

if (outputMetadata.width !== TARGET_WIDTH) {
  throw new Error("Upscale width mismatch.");
}

if (outputMetadata.height !== TARGET_HEIGHT) {
  throw new Error("Upscale height mismatch.");
}

if (outputMetadata.format !== "png") {
  throw new Error("Upscale output is not PNG.");
}

if (result.scaleFactor !== 2) {
  throw new Error(
    `Expected 2x upscale, got ${result.scaleFactor}x.`
  );
}

console.log("");
console.log("✅ Upscale runtime test passed");
