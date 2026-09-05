const sharp = require("sharp");

const SOURCE_WIDTH = 1240;
const SOURCE_HEIGHT = 1754;

const TARGET_WIDTH = 2480;
const TARGET_HEIGHT = 3508;

async function main() {
  console.log("===== SOURCE =====");

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

  console.log("width:", sourceMetadata.width);
  console.log("height:", sourceMetadata.height);
  console.log("format:", sourceMetadata.format);

  console.log("");
  console.log("===== DIRECT SHARP UPSCALE =====");

  const scaleFactor =
    Math.max(
      TARGET_WIDTH / SOURCE_WIDTH,
      TARGET_HEIGHT / SOURCE_HEIGHT
    );

  const output = await sharp(source)
    .resize({
      width: TARGET_WIDTH,
      height: TARGET_HEIGHT,
      fit: "cover",
      position: "centre",
      kernel: sharp.kernel.lanczos3,
    })
    .png({
      compressionLevel: 9,
      adaptiveFiltering: true,
    })
    .withMetadata({
      density: 300,
    })
    .toBuffer();

  const metadata =
    await sharp(output).metadata();

  console.log("provider: sharp");
  console.log("width:", metadata.width);
  console.log("height:", metadata.height);
  console.log("density:", metadata.density);
  console.log("format:", metadata.format);
  console.log("scale:", scaleFactor);
  console.log("fileSize:", output.length);

  if (metadata.width !== TARGET_WIDTH) {
    throw new Error(
      `Width mismatch: ${metadata.width}`
    );
  }

  if (metadata.height !== TARGET_HEIGHT) {
    throw new Error(
      `Height mismatch: ${metadata.height}`
    );
  }

  if (metadata.density !== 300) {
    throw new Error(
      `DPI mismatch: ${metadata.density}`
    );
  }

  if (metadata.format !== "png") {
    throw new Error(
      `Format mismatch: ${metadata.format}`
    );
  }

  if (scaleFactor !== 2) {
    throw new Error(
      `Expected 2x upscale, got ${scaleFactor}x`
    );
  }

  console.log("");
  console.log("✅ Sharp upscale runtime passed");
  console.log("✅ 2× scaling verified");
  console.log("✅ A4 dimensions verified");
  console.log("✅ 300 DPI metadata verified");
}

main().catch((error) => {
  console.error("");
  console.error("❌ UPSCALE TEST FAILED");
  console.error(error);
  process.exit(1);
});
