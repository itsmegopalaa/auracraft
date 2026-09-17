const sharp = require("sharp");

async function main() {
  const { renderDesignStateToProduction } = await import(
    "../app/services/customization/production/renderer.ts"
  );

  const formats = [
    { name: "PNG", mimeType: "image/png", format: "png" },
    { name: "JPEG", mimeType: "image/jpeg", format: "jpeg" },
    { name: "WebP", mimeType: "image/webp", format: "webp" },
  ];

  for (const item of formats) {
    const assetId = `test-${item.format}`;

    const sourceImage = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 4,
        background: { r: 220, g: 80, b: 80, alpha: 1 },
      },
    })
      [item.format]()
      .toBuffer();

    const design = {
      background: "#ffffff",
      canvasWidth: 600,
      canvasHeight: 848,
      elements: [
        {
          id: `image-${item.format}`,
          type: "image",
          assetId,
          x: 100,
          y: 120,
          width: 400,
          height: 300,
          rotation: 12,
          opacity: 0.9,
          objectFit: "contain",
          imageScale: 0.85,
          imageOffsetX: 20,
          imageOffsetY: -15,
          borderRadius: 24,
          zIndex: 1,
        },
      ],
    };

    const result = await renderDesignStateToProduction(
      design,
      {
        size: "A4",
        orientation: "portrait",
        assetBuffers: {
          [assetId]: {
            buffer: sourceImage,
            mimeType: item.mimeType,
          },
        },
      },
    );

    const metadata = await sharp(result.buffer).metadata();

    if (
      metadata.width !== 2480 ||
      metadata.height !== 3508 ||
      metadata.density !== 300 ||
      metadata.format !== "png"
    ) {
      throw new Error(
        `${item.name}: unexpected output ${JSON.stringify({
          width: metadata.width,
          height: metadata.height,
          density: metadata.density,
          format: metadata.format,
        })}`,
      );
    }

    console.log(
      `${item.name} source → production PNG: PASS`,
    );
  }

  console.log("\nALL IMAGE MIME TESTS PASSED");
}

main().catch((error) => {
  console.error("IMAGE MIME TEST FAILED");
  console.error(error);
  process.exit(1);
});
