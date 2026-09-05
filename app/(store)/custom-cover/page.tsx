import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";
import CustomCoverBuilder from "./CustomCoverBuilder";

type Props = {
  searchParams: Promise<{
    productId?: string;
  }>;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

export const metadata: Metadata = {
  title: "Create Your Custom Cover | MineNote",
  description:
    "Create a personalised MineNote notebook cover with AI, your own design, or a ready-made template.",
};

export default async function CustomCoverPage({
  searchParams,
}: Props) {
  const { productId } = await searchParams;

  const supabase = await createClient();

  /*
   * Product-specific customization:
   *
   * /custom-cover?productId=<uuid>
   *
   * Create Your Own:
   *
   * /custom-cover
   *
   * In Create Your Own mode the customer chooses
   * the physical notebook/base product inside the builder.
   */

  if (productId && !isUuid(productId)) {
    return (
      <main className="min-h-screen bg-black px-4 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-yellow-400">Custom Cover</p>
          <h1 className="mt-4 text-4xl font-black">
            Invalid notebook selection
          </h1>
          <p className="mt-4 text-zinc-500">
            Please choose a valid MineNote notebook and try again.
          </p>
        </div>
      </main>
    );
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, image, active")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("CUSTOM COVER PRODUCT LOOKUP ERROR:", error);

    return (
      <main className="min-h-screen bg-black px-4 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-yellow-400">MineNote</p>
          <h1 className="mt-4 text-4xl font-black">
            Unable to load notebooks
          </h1>
          <p className="mt-4 text-zinc-500">
            Please refresh the page and try again.
          </p>
        </div>
      </main>
    );
  }

  const selectedProduct =
    productId && isUuid(productId)
      ? products?.find(
          (product) => String(product.id) === productId
        )
      : null;

  if (productId && !selectedProduct) {
    return (
      <main className="min-h-screen bg-black px-4 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-yellow-400">Custom Cover</p>
          <h1 className="mt-4 text-4xl font-black">
            Notebook unavailable
          </h1>
          <p className="mt-4 text-zinc-500">
            This notebook is no longer available for customization.
          </p>
        </div>
      </main>
    );
  }

  const availableProducts =
    products?.map((product) => ({
      id: String(product.id),
      name: product.name,
      price: Number(product.price),
      image: product.image,
    })) ?? [];

  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white sm:px-6 sm:py-20 lg:py-24">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-yellow-400/20 bg-yellow-400/[0.07] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-400">
              ✨ Custom Creation Studio
            </span>

            {!selectedProduct && (
              <span className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                Create Your Own
              </span>
            )}
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-[-0.045em] sm:text-5xl lg:text-6xl">
            {selectedProduct ? (
              <>
                Make it{" "}
                <span className="text-yellow-400">yours.</span>
              </>
            ) : (
              <>
                Create something{" "}
                <span className="text-yellow-400">original.</span>
              </>
            )}
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
            {selectedProduct
              ? "Personalise this MineNote notebook with your own front and back cover."
              : "Start with a blank idea, choose your physical notebook, and create a cover that does not have to look like anything else in our catalogue."}
          </p>
        </div>

        {!selectedProduct && (
          <div className="mb-8 rounded-[2rem] border border-yellow-400/20 bg-yellow-400/[0.045] p-5 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-400">
                  🔥 Your design. Your rules.
                </p>

                <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
                  Nothing from the catalogue is required.
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                  The catalogue only contains ready-made products.
                  Your custom creation remains private unless you
                  explicitly give MineNote permission to publish it.
                </p>
              </div>

              <div className="shrink-0 rounded-2xl border border-white/[0.08] bg-black/40 px-5 py-4 text-center">
                <p className="text-2xl">🔒</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500">
                  Private by default
                </p>
              </div>
            </div>
          </div>
        )}

        <CustomCoverBuilder
          product={
            selectedProduct
              ? {
                  id: String(selectedProduct.id),
                  name: selectedProduct.name,
                  price: Number(selectedProduct.price),
                  image: selectedProduct.image,
                }
              : null
          }
          products={availableProducts}
          createYourOwn={!selectedProduct}
        />
      </section>
    </main>
  );
}
