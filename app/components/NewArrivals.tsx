import ProductCard from "./ProductCard";
import { createClient } from "@/utils/supabase/server";
import { getProductRatings } from "../lib/product-rating";

export default async function NewArrivals() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(
      "id, name, price, image, category, rating, bestseller, new_arrival, created_at"
    )
    .eq("active", true)
    .eq("new_arrival", true)
    .order("created_at", { ascending: false })
    .limit(4);

  if (error) {
    console.error("New arrivals error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return null;
  }

  const ratings = await getProductRatings(
    (products ?? []).map((product) => product.id)
  );

  return (
    <section className="relative overflow-hidden border-b border-[var(--mn-border)] bg-[var(--mn-surface-soft)]">
      <div className="mn-container-wide py-[clamp(5rem,8vw,7.5rem)] sm:py-[clamp(6rem,9vw,9rem)] lg:py-28">
        <div className="mb-10 flex flex-col gap-6 border-b border-[var(--mn-border)] pb-8 sm:mb-12 sm:pb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-[var(--mn-accent)]"
              />
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--mn-accent)]">
                Fresh from the studio
              </p>
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-[var(--mn-text)] sm:text-5xl lg:text-6xl">
              New Arrivals
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--mn-text-secondary)] sm:text-base sm:leading-8">
              New designs for the next idea, the next plan, and everything
              waiting to be written down.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mn-text-muted)]">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-[var(--mn-accent)]"
            />
            Recently added
          </div>
        </div>

        <div className="grid gap-[var(--mn-space-card)] sm:grid-cols-2 sm:gap-[var(--mn-space-card)] lg:grid-cols-4 lg:gap-7">
          {products?.map((product) => (
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
