import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const { prepareAllCatalogProduction } =
    await import(
      "../app/api/admin/products/production/prepare-all/route"
    );

  console.log("🚀 Preparing catalog production assets...");

  const result = await prepareAllCatalogProduction();

  console.log(JSON.stringify(result, null, 2));

  if (!result.ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("❌ Bulk production preparation failed:");
  console.error(error);
  process.exitCode = 1;
});
