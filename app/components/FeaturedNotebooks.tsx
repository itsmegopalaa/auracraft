import ProductCard from "./ProductCard";
import { createClient } from "@/utils/supabase/server";
import { getProductRatings } from "../lib/product-rating";

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

  const ratings = await getProductRatings(
    (products ?? []).map((product) => product.id)
  );

  return (
    <section className="relative overflow-hidden">
      {/* Subtle section atmosphere */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-yellow-400/[0.035] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-6 sm:py-28 lg:py-32">

        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-400/80">
            Curated for you
          </p>

          <h2 className="text-4xl font-extrabold tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
            Featured{" "}
            <span className="text-yellow-400">AuraNotes</span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">
            Choose a notebook that matches your personality, your ideas,
            and the way you create.
          </p>

          <div
            className="mx-auto mt-7 h-px w-12 bg-yellow-400/60"
            aria-hidden="true"
          />
        </div>

        {/* Products */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 sm:gap-7 lg:mt-16 lg:grid-cols-4 lg:gap-7">
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
              reviewCount={
                ratings[product.id]?.review_count ?? 0
              }
              bestseller={product.bestseller}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
