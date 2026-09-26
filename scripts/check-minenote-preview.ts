import { loadEnvConfig } from "@next/env";

async function main() {
  loadEnvConfig(process.cwd());

  const { createSupabaseAdminClient } =
    await import("../app/lib/supabase");

  const {
    getProductProductionPreview,
  } = await import(
    "../app/lib/product-production-preview"
  );

  const supabase = createSupabaseAdminClient();

  const productId =
    "4a076972-33ad-4370-a15f-2d9595a7b25d";

  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id, name, production_assets, production_template_version",
    )
    .eq("id", productId)
    .single();

  console.log("\n=== PRODUCT ===");
  console.log(JSON.stringify(product, null, 2));

  if (error) {
    console.error("\n❌ PRODUCT QUERY ERROR");
    console.error(error);
    process.exit(1);
  }

  console.log("\n=== PREVIEW RESOLVER ===");

  const preview = await getProductProductionPreview(
    product.production_assets,
  );

  console.log(
    JSON.stringify(
      preview.map((asset) => ({
        side: asset.side,
        sheetId: asset.sheetId,
        sheetSide: asset.sheetSide,
        storagePath: asset.storagePath,
        hasUrl: Boolean(asset.url),
        urlStart: asset.url?.slice(0, 100),
      })),
      null,
      2,
    ),
  );

  console.log(
    `\nPreview asset count: ${preview.length}`,
  );

  if (preview.length === 4) {
    console.log(
      "✅ PREVIEW RESOLVER IS WORKING",
    );
  } else {
    console.log(
      "❌ PREVIEW RESOLVER RETURNED LESS THAN 4 ASSETS",
    );
  }
}

main().catch((error) => {
  console.error("\n❌ Diagnostic failed:");
  console.error(error);
  process.exitCode = 1;
});
