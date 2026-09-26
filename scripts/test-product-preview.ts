import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const { createSupabaseAdminClient } =
    await import("../app/lib/supabase");

  const { getProductProductionPreview } =
    await import("../app/lib/product-production-preview");

  const supabase = createSupabaseAdminClient();

  const productId =
    "4a076972-33ad-4370-a15f-2d9595a7b25d";

  const { data, error } = await supabase
    .from("products")
    .select("id, name, production_assets")
    .eq("id", productId)
    .single();

  if (error || !data) {
    throw new Error(
      `Product load failed: ${error?.message ?? "not found"}`,
    );
  }

  console.log("\n========== PRODUCT ==========");
  console.log(data.name);

  console.log(
    "raw asset count:",
    Array.isArray(data.production_assets)
      ? data.production_assets.length
      : 0,
  );

  console.log(
    "\n========== EXACT PRODUCT PREVIEW HELPER ==========",
  );

  const assets = await getProductProductionPreview(
    data.production_assets,
  );

  console.log("preview asset count:", assets.length);

  for (const asset of assets) {
    console.log({
      side: asset.side,
      sheetId: asset.sheetId,
      sheetSide: asset.sheetSide,
      hasSignedUrl:
        typeof asset.url === "string" &&
        asset.url.length > 0,
      urlPrefix:
        typeof asset.url === "string"
          ? asset.url.slice(0, 90)
          : "",
    });
  }

  console.log(
    "\nCOMPLETE:",
    assets.length === 4 ? "✅ YES" : "❌ NO",
  );
}

main().catch((error) => {
  console.error("\n❌ TEST FAILED");
  console.error(error);
  process.exitCode = 1;
});
