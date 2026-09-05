const sharp = require("sharp");

async function main() {
  const {
    createProductionCover,
  } = await import(
    "../app/services/customization/production/pipeline.ts"
  );

  const SOURCE_WIDTH = 1240;
  const SOURCE_HEIGHT = 1754;

  console.log(
    "===== CREATE SOURCE ARTWORK ====="
  );

  const artwork = await sharp({
    create: {
      width: SOURCE_WIDTH,
      height: SOURCE_HEIGHT,
      channels: 3,
      background: {
        r: 35,
        g: 35,
        b: 35,
      },
    },
  })
    .png()
    .toBuffer();

  console.log(
    "source:",
    SOURCE_WIDTH,
    "x",
    SOURCE_HEIGHT
  );

  console.log("");
  console.log(
    "===== RUN PRODUCTION PIPELINE ====="
  );

  const result = await createProductionCover({
    artwork,

    sourceWidth: SOURCE_WIDTH,
    sourceHeight: SOURCE_HEIGHT,
    sourceMimeType: "image/png",

    customerName: "Gopalaa",

    customerText:
      "Create something worth remembering.",

    side: "front",

    branding: {
      mineNote: true,
      auraCraft: true,
    },

    upscaleProvider: "sharp",
  });

  console.log("");
  console.log("===== SOURCE =====");
  console.log("width:", result.source.width);
  console.log("height:", result.source.height);
  console.log("mime:", result.source.mimeType);

  console.log("");
  console.log("===== UPSCALE =====");
  console.log("provider:", result.upscale.provider);
  console.log("width:", result.upscale.width);
  console.log("height:", result.upscale.height);
  console.log("scale:", result.upscale.scaleFactor);
  console.log("fileSize:", result.upscale.fileSize);

  console.log("");
  console.log("===== PRODUCTION =====");
  console.log(
    "width:",
    result.final.width
  );
  console.log(
    "height:",
    result.final.height
  );
  console.log(
    "dpi:",
    result.final.dpi
  );
  console.log(
    "mime:",
    result.final.mimeType
  );
  console.log(
    "fileSize:",
    result.final.fileSize
  );

  /*
   * Inspect the actual resulting bytes.
   */
  const metadata =
    await sharp(
      result.production.buffer
    ).metadata();

  console.log("");
  console.log("===== FINAL IMAGE BYTES =====");
  console.log("width:", metadata.width);
  console.log("height:", metadata.height);
  console.log("density:", metadata.density);
  console.log("format:", metadata.format);

  if (
    metadata.width !== 2480 ||
    metadata.height !== 3508
  ) {
    throw new Error(
      "Final production dimensions are invalid."
    );
  }

  if (metadata.density !== 300) {
    throw new Error(
      "Final production DPI is invalid."
    );
  }

  if (metadata.format !== "png") {
    throw new Error(
      "Final production format is invalid."
    );
  }

  if (
    result.production.widthPx !== 2480 ||
    result.production.heightPx !== 3508
  ) {
    throw new Error(
      "Production service dimensions are invalid."
    );
  }

  console.log("");
  console.log(
    "✅ Complete production pipeline passed"
  );
  console.log(
    "✅ Artwork → Upscale → A4 Renderer"
  );
  console.log(
    "✅ 2480 × 3508 px"
  );
  console.log(
    "✅ 300 DPI"
  );
  console.log(
    "✅ PNG production output"
  );
}

main().catch((error) => {
  console.error("");
  console.error(
    "❌ PRODUCTION PIPELINE FAILED"
  );
  console.error(error);
  process.exit(1);
});
