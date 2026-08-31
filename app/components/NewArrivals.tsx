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
    <section className="relative overflow-hidden border-y border-white/[0.06]">
      <div
        className="pointer-events-none absolute right-[-10rem] top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-yellow-400/[0.025] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-6 sm:py-28">
        <div className="mb-12 flex flex-col gap-5 sm:mb-14 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-400/80">
              Just dropped
            </p>

            <h2 className="text-4xl font-extrabold tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
              New <span className="text-yellow-400">Arrivals</span>
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8">
              Fresh AuraNotes designs, recently added for your ideas,
              creativity, and everyday moments.
            </p>
          </div>

          <span className="w-fit rounded-full border border-white/[0.09] bg-white/[0.025] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            New designs • Limited rotation
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
