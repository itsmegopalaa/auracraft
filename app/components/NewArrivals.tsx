import ProductCard from "./ProductCard";
import { createClient } from "@/utils/supabase/server";

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

  return (
    <section className="mx-auto max-w-7xl py-24">
      <h2 className="text-center text-5xl font-bold">
        New <span className="text-yellow-400">Arrivals</span>
      </h2>

      <p className="mb-14 mt-5 text-center text-gray-400">
        Fresh AuraNotes designs made for your ideas.
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
            rating={product.rating ?? undefined}
            bestseller={product.bestseller}
          />
        ))}
      </div>
    </section>
  );
}
