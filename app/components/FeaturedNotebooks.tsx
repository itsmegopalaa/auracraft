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
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-64 w-[30rem] -translate-x-1/2 rounded-full bg-yellow-400/[0.035] blur-3xl sm:h-72 sm:w-[36rem]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:py-28 xl:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-yellow-400/80 sm:mb-4 sm:tracking-[0.3em]">
            Curated for you
          </p>

          <h2 className="text-3xl font-extrabold tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
            Featured <span className="text-yellow-400">AuraNotes</span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-300 sm:mt-5 sm:text-base">
            Choose a notebook that matches your personality, your ideas,
            and the way you create.
          </p>

          <div
            className="mx-auto mt-6 h-px w-12 bg-yellow-400/60 sm:mt-7"
            aria-hidden="true"
          />
        </div>

        <div className="mt-11 grid gap-5 sm:mt-13 sm:grid-cols-2 sm:gap-6 lg:mt-15 lg:grid-cols-4 lg:gap-7">
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
