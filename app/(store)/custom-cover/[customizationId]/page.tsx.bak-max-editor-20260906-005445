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

  const { data: product, error: productError } =
    await supabase
      .from("products")
      .select("id, name, image")
      .eq("id", customization.product_id)
      .eq("active", true)
      .single();

  if (productError || !product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white sm:px-6 sm:py-16 lg:py-20">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-yellow-400/20 bg-yellow-400/[0.07] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-400">
              🎨 Cover Editor
            </span>

            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Make it{" "}
              <span className="text-yellow-400">
                yours.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">
              Edit your personal details and preview both sides
              of your notebook cover. Your draft stays connected
              to this specific product.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-zinc-950 px-5 py-4">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-600">
              Customization
            </p>

            <p className="mt-1 break-all font-mono text-xs text-zinc-400">
              {customization.id}
            </p>
          </div>
        </div>

        <CustomCoverEditor
          customization={{
            id: customization.id,
            productId: customization.product_id,
            productName: product.name,
            productImage: product.image,
            creationMethod:
              customization.creation_method,
            status: customization.status,
            templateId:
              customization.template_id,
            customerName:
              customization.customer_name,
            customerText:
              customization.customer_text,
            design:
              customization.design,
            aiBudget:
              customization.ai_budget,
          }}
        />
      </section>
    </main>
  );
}
