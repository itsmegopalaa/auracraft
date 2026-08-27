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
    <section className="mx-auto max-w-7xl py-24">
      <h2 className="text-center text-5xl font-bold">
        Featured <span className="text-yellow-400">AuraNotes</span>
      </h2>

      <p className="mb-14 mt-5 text-center text-gray-400">
        Choose a notebook that matches your personality.
      </p>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
    </section>
  );
}
