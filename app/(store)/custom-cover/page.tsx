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
