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
      <main className="min-h-screen bg-[var(--mn-bg)] px-4 py-[clamp(5rem,8vw,7.5rem)] text-[var(--mn-text)]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[var(--mn-accent)]">Custom Cover</p>
          <h1 className="mt-4 text-4xl font-black">
            Invalid notebook selection
          </h1>
          <p className="mt-4 text-[var(--mn-text-muted)]">
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
      <main className="min-h-screen bg-[var(--mn-bg)] px-4 py-[clamp(5rem,8vw,7.5rem)] text-[var(--mn-text)]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[var(--mn-accent)]">MineNote</p>
          <h1 className="mt-4 text-4xl font-black">
            Unable to load notebooks
          </h1>
          <p className="mt-4 text-[var(--mn-text-muted)]">
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
      <main className="min-h-screen bg-[var(--mn-bg)] px-4 py-[clamp(5rem,8vw,7.5rem)] text-[var(--mn-text)]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[var(--mn-accent)]">Custom Cover</p>
          <h1 className="mt-4 text-4xl font-black">
            Notebook unavailable
          </h1>
          <p className="mt-4 text-[var(--mn-text-muted)]">
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
    <main
      className={
        selectedProduct
          ? "min-h-0 bg-[var(--mn-bg)] text-[var(--mn-text)]"
          : "min-h-screen bg-[var(--mn-bg)] px-4 py-16 text-[var(--mn-text)] sm:px-5 lg:px-6 sm:py-[clamp(5rem,8vw,7.5rem)] lg:py-[clamp(5rem,8vw,8rem)]"
      }
    >
      <section
        className={
          selectedProduct
            ? "h-[calc(100vh-7rem)] min-h-0 max-w-none"
            : "mx-auto max-w-6xl"
        }
      >
        {!selectedProduct && (
          <div className="mb-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-[var(--mn-accent)]/20 bg-[var(--mn-accent-soft)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--mn-accent)]">
              ✨ Custom Creation Studio
            </span>

            {!selectedProduct && (
              <span className="inline-flex rounded-full border border-[var(--mn-border)] bg-[var(--mn-control-bg)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--mn-text-secondary)]">
                Create Your Own
              </span>
            )}
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-[-0.045em] sm:text-5xl lg:text-6xl">
            {selectedProduct ? (
              <>
                Make it{" "}
                <span className="text-[var(--mn-accent)]">yours.</span>
              </>
            ) : (
              <>
                Create something{" "}
                <span className="text-[var(--mn-accent)]">original.</span>
              </>
            )}
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--mn-text-secondary)] sm:text-lg sm:leading-8">
            {selectedProduct
              ? "Personalise this MineNote notebook with your own front and back cover."
              : "Start with a blank idea, choose your physical notebook, and create a cover that does not have to look like anything else in our catalogue."}
          </p>
        </div>
        )}

        {!selectedProduct && (
          <div className="mb-8 rounded-[2rem] border border-[var(--mn-accent)]/20 bg-[var(--mn-accent-soft)] p-5 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--mn-accent)]">
                  🔥 Your design. Your rules.
                </p>

                <h2 className="mt-2 text-xl font-black text-[var(--mn-text)] sm:text-2xl">
                  Nothing from the catalogue is required.
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--mn-text-secondary)]">
                  The catalogue only contains ready-made products.
                  Your custom creation remains private unless you
                  explicitly give MineNote permission to publish it.
                </p>
              </div>

              <div className="shrink-0 rounded-[1.5rem] border border-[var(--mn-border)] bg-[var(--mn-bg)]/40 px-5 py-4 text-center">
                <p className="text-2xl">🔒</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.15em] text-[var(--mn-text-muted)]">
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
