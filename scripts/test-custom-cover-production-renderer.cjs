async function main() {
  const { default: sharp } = await import("sharp");

  const {
    renderDesignStateToProduction,
    getProductionSpec,
  } = await import(
    "../app/services/customization/production/renderer.ts"
  );

  const surfaces = [
    "front",
    "insideFront",
    "insideBack",
    "back",
  ];

  const sizes = [
    ["A4", "portrait"],
    ["A4", "landscape"],
    ["A5", "portrait"],
    ["A5", "landscape"],
  ];

  console.log("===== CUSTOM COVER PRODUCTION RENDER TEST =====");

  for (const [size, orientation] of sizes) {
    const spec = getProductionSpec(size, orientation);

    console.log("");
    console.log(`--- ${size} ${orientation} ---`);
    console.log(
      "expected:",
      `${spec.widthPx} x ${spec.heightPx}`
    );

    for (const side of surfaces) {
      const canvasWidth = 600;
      const canvasHeight =
        orientation === "portrait"
          ? size === "A4"
            ? 848
            : 850
          : size === "A4"
            ? 848
            : 850;

      const design = {
        background: "#ffffff",
        canvasWidth,
        canvasHeight,
        canvasSize: size,
        canvasOrientation: orientation,

        elements: [
          {
            id: "test-shape",
            type: "shape",
            x: 40,
            y: 40,
            width: 180,
            height: 120,
            rotation: 8,
            opacity: 1,
            shape: "rectangle",
            fill: "#222222",
            borderRadius: 20,
            zIndex: 1,
          },
          {
            id: "test-text",
            type: "text",
            x: 100,
            y: 220,
            width: 400,
            height: 100,
            rotation: 0,
            opacity: 1,
            text: `${side} — ${size} ${orientation}`,
            fontSize: 32,
            fontWeight: "700",
            textAlign: "center",
            color: "#111111",
            lineHeight: 1.2,
            letterSpacing: 0,
            zIndex: 2,
          },
        ],
      };

      const result =
        await renderDesignStateToProduction(
          design,
          {
            size,
            orientation,
            assetBuffers: {},
          },
        );

      const metadata =
        await sharp(result.buffer).metadata();

      if (
        metadata.width !== spec.widthPx ||
        metadata.height !== spec.heightPx
      ) {
        throw new Error(
          `${size} ${orientation} ${side}: invalid dimensions ` +
          `${metadata.width}x${metadata.height}; ` +
          `expected ${spec.widthPx}x${spec.heightPx}`
        );
      }

      if (metadata.density !== 300) {
        throw new Error(
          `${size} ${orientation} ${side}: invalid DPI ${metadata.density}`
        );
      }

      if (metadata.format !== "png") {
        throw new Error(
          `${size} ${orientation} ${side}: invalid format ${metadata.format}`
        );
      }

      console.log(
        `✅ ${side}: ${metadata.width}x${metadata.height}, 300 DPI, PNG`
      );
    }
  }

  console.log("");
  console.log("==============================================");
  console.log("✅ CUSTOM COVER PRODUCTION RENDERER PASSED");
  console.log("✅ A4 portrait");
  console.log("✅ A4 landscape");
  console.log("✅ A5 portrait");
  console.log("✅ A5 landscape");
  console.log("✅ All 4 cover surfaces");
  console.log("✅ 300 DPI");
  console.log("✅ PNG output");
  console.log("==============================================");
}

main().catch((error) => {
  console.error("");
  console.error("❌ CUSTOM COVER RENDER TEST FAILED");
  console.error(error);
  process.exit(1);
});
