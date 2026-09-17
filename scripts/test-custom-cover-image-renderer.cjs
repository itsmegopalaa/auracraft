const sharp = require("sharp");

async function main() {
  const { renderDesignStateToProduction } = await import(
    "../app/services/customization/production/renderer.ts"
  );

  const assetId = "test-image-asset";

  const sourceImage = await sharp({
    create: {
      width: 800,
      height: 600,
      channels: 4,
      background: { r: 220, g: 80, b: 80, alpha: 1 },
    },
  })
    .png()
    .toBuffer();

  const design = {
    background: "#ffffff",
    canvasWidth: 600,
    canvasHeight: 848,
    elements: [
      {
        id: "test-image",
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
        [assetId]: sourceImage,
      },
    },
  );

  const metadata = await sharp(result.buffer).metadata();

  if (metadata.width !== 2480 || metadata.height !== 3508) {
    throw new Error(
      `Unexpected dimensions: ${metadata.width}x${metadata.height}`,
    );
  }

  if (metadata.density !== 300) {
    throw new Error(
      `Unexpected DPI: ${metadata.density}`,
    );
  }

  if (metadata.format !== "png") {
    throw new Error(
      `Unexpected format: ${metadata.format}`,
    );
  }

  console.log("IMAGE RENDERER TEST PASSED");
  console.log({
    width: metadata.width,
    height: metadata.height,
    density: metadata.density,
    format: metadata.format,
    fileSize: result.buffer.length,
  });
}

main().catch((error) => {
  console.error("IMAGE RENDERER TEST FAILED");
  console.error(error);
  process.exit(1);
});
