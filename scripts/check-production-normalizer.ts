import { loadEnvConfig } from "@next/env";

async function main() {
  loadEnvConfig(process.cwd());

  const { createSupabaseAdminClient } =
    await import("../app/lib/supabase");

  const {
    normalizeProductProductionAssets,
    hasCompleteProductProductionAssets,
  } = await import("../app/lib/product-production-assets");

  const supabase = createSupabaseAdminClient();

  const productId =
    "4a076972-33ad-4370-a15f-2d9595a7b25d";

  const { data, error } = await supabase
    .from("products")
    .select("production_assets")
    .eq("id", productId)
    .single();

  if (error) {
    throw error;
  }

  const normalized =
    normalizeProductProductionAssets(
      data.production_assets,
    );

  console.log("\n=== NORMALIZED ASSETS ===");
  console.log(
    JSON.stringify(
      normalized.map((asset) => ({
        side: asset.side,
        sheetId: asset.sheetId,
        sheetSide: asset.sheetSide,
        storagePath: asset.storagePath,
        hasUrl: Boolean(asset.url),
      })),
      null,
      2,
    ),
  );

  console.log(
    `\nNormalized count: ${normalized.length}`,
  );

  console.log(
    `Complete check: ${hasCompleteProductProductionAssets(normalized)}`,
  );
}

main().catch((error) => {
  console.error("\n❌ Diagnostic failed:");
  console.error(error);
  process.exitCode = 1;
});
