const BASE_URL =
  process.env.MINENOTE_BASE_URL || "http://localhost:3000";

const productIds = process.argv.slice(2);

if (productIds.length === 0) {
  console.error(
    "Usage: node scripts/prepare-all-notebook-production.mjs PRODUCT_ID..."
  );
  process.exit(1);
}

for (const productId of productIds) {
  console.log(`\nPreparing ${productId}...`);

  const response = await fetch(
    `${BASE_URL}/api/admin/products/${productId}/production`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const body = await response.json().catch(() => null);

  console.log(
    JSON.stringify(
      {
        productId,
        status: response.status,
        body,
      },
      null,
      2,
    ),
  );

  if (!response.ok) {
    process.exitCode = 1;
  }
}
