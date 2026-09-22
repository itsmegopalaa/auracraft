import ProductCard from "./ProductCard";
import { createClient } from "@/utils/supabase/server";
import { getProductRatings } from "../lib/product-rating";
import { getCatalogBasePrices } from "../lib/catalog-pricing";

export default async function FeaturedNotebooks() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(
      "id, name, price, image, category, rating, bestseller, featured"
    )
    .eq("active", true)
    .eq("featured", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Featured products error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return null;
  }

  const catalogBasePrices = await getCatalogBasePrices(
    (products ?? []).map((product) => product.id)
  );

  const productsWithCanonicalPrices = (products ?? []).map((product) => ({
    ...product,
    price:
      catalogBasePrices.get(String(product.id)) ??
      product.price,
  }));

  const ratings = await getProductRatings(
    (products ?? []).map((product) => product.id)
  );

  return (
    <section className="relative overflow-hidden border-b border-[var(--mn-border)]">
      <div className="mn-container-wide py-[clamp(5rem,8vw,7.5rem)] sm:py-[clamp(6rem,9vw,9rem)] lg:py-28">
        <div className="flex flex-col gap-6 border-b border-[var(--mn-border)] pb-8 sm:pb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-[var(--mn-accent)]"
              />
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--mn-accent)]">
                The edit
              </p>
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-[var(--mn-text)] sm:text-5xl lg:text-6xl">
              Featured AuraNotes
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--mn-text-secondary)] sm:text-base sm:leading-8">
              A considered selection of designs made for different moods,
              moments and ways of creating.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mn-text-muted)]">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-[var(--mn-accent)]"
            />
            Curated collection
          </div>
        </div>

        <div className="mt-10 grid gap-[var(--mn-space-card)] sm:mt-12 sm:grid-cols-2 sm:gap-[var(--mn-space-card)] lg:grid-cols-4 lg:gap-7">
          {productsWithCanonicalPrices.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              image={product.image ?? ""}
              price={product.price}
              category={product.category ?? undefined}
              rating={
                ratings[product.id]?.effective_rating ??
                product.rating ??
                undefined
              }
              reviewCount={ratings[product.id]?.review_count ?? 0}
              bestseller={product.bestseller}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
