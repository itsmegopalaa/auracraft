import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import CustomCoverEditor from "../CustomCoverEditor";

type Props = {
  params: Promise<{
    customizationId: string;
  }>;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

export default async function CustomCoverEditorPage({
  params,
}: Props) {
  const { customizationId } = await params;

  if (!isUuid(customizationId)) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?redirect=/custom-cover/${customizationId}`
    );
  }

  const { data: customization, error } =
    await supabase
      .from("custom_cover_customizations")
      .select(
        "id, customer_id, product_id, creation_method, status, template_id, customer_name, customer_text, design, print_spec, ai_budget"
      )
      .eq("id", customizationId)
      .eq("customer_id", user.id)
      .single();

  if (error || !customization) {
    notFound();
  }

  let product: {
    id: string;
    name: string;
    image: string | null;
  } | null = null;

  if (customization.product_id) {
    const { data: selectedProduct, error: productError } =
      await supabase
        .from("products")
        .select("id, name, image")
        .eq("id", customization.product_id)
        .eq("active", true)
        .single();

    if (productError || !selectedProduct) {
      notFound();
    }

    product = selectedProduct;
  }

  return (
    <main className="flex h-[calc(100dvh-4rem)] min-h-0 w-full overflow-hidden bg-[var(--mn-bg)] text-[var(--mn-text)]">
      <section className="flex h-full min-h-0 w-full min-w-0 overflow-hidden">
        <CustomCoverEditor
          customizationId={customization.id}
          productId={customization.product_id ?? undefined}
          productName={product?.name ?? "Custom Cover"}
          productImage={product?.image ?? ""}
        />
      </section>
    </main>
  );
}
