import { createClient } from "@supabase/supabase-js";
import { validateShippingSnapshot } from "@/app/services/shipping";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const orderId = process.argv[2];

if (!orderId) {
  throw new Error(
    "Usage: npx tsx scripts/test-shipping-validation.ts <order-uuid>"
  );
}

async function main() {
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, order_id, pin, shipping_snapshot")
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    throw new Error(`Order lookup failed: ${error.message}`);
  }

  if (!order) {
    throw new Error("Order not found.");
  }

  console.log(`Order: ${order.order_id}`);
  console.log(`PIN: ${order.pin}`);
  console.log(
    `Snapshot: ${order.shipping_snapshot ? "present" : "missing"}`
  );

  const result = validateShippingSnapshot(
    order.shipping_snapshot,
    order.pin
  );

  console.log("\n=== VALIDATION RESULT ===");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error("\nTEST FAILED:");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});