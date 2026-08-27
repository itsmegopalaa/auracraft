import ProductGallery from "../../components/products/ProductGallery";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { Product } from "../../lib/products";
import { getProductRating, getProductRatings } from "../../lib/product-rating";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "./WishlistButton";
import ShareButton from "./ShareButton";
import RelatedProducts from "../../components/products/RelatedProducts";
import ProductReviews from "../../components/products/ProductReviews";
import TrustBadges from "../../components/TrustBadges";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id, name, price, description, category, image, stock, active, rating, bestseller, featured, new_arrival, pages, paper, size"
    )
    .eq("id", id)
    .eq("active", true)
    .single();

  if (error || !product) {
    console.error("PRODUCT DETAIL LOAD FAILED:", error);
    notFound();
  }

  const typedProduct = product as Product;

  const productRating = await getProductRating(typedProduct.id);

  const { data: relatedProductsData, error: relatedProductsError } =
    await supabase
      .from("products")
      .select(
        "id, name, price, description, category, image, stock, active, rating, bestseller, featured, new_arrival, pages, paper, size"
      )
      .eq("active", true)
      .neq("id", typedProduct.id)
      .order("created_at", { ascending: false })
      .limit(3);

  if (relatedProductsError) {
    console.error(
      "RELATED PRODUCTS LOAD FAILED:",
      relatedProductsError
    );
  }

  const relatedProductsBase = (relatedProductsData ?? []) as Product[];

  const relatedRatings = await getProductRatings(
    relatedProductsBase.map((product) => product.id)
  );

  const relatedProducts = relatedProductsBase.map((product) => {
    const rating = relatedRatings[product.id];

    return {
      ...product,
      rating: rating?.effective_rating ?? product.rating,
      review_count: rating?.review_count ?? 0,
    };
  });

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black px-6 py-24 text-white">
        <section className="mx-auto grid max-w-7xl items-center gap-16 md:grid-cols-2">
          {/* Gallery */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            {typedProduct.bestseller && (
              <span className="absolute left-6 top-6 z-10 rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-black">
                🔥 BEST SELLER
              </span>
            )}

            <ProductGallery
              image={typedProduct.image ?? "/images/notebooks/placeholder.png"}
              name={typedProduct.name}
            />
          </div>

          {/* Product Details */}
          <div>
            <span className="inline-block rounded-full bg-zinc-800 px-5 py-2 text-yellow-400">
              {typedProduct.category}
            </span>

            <h1 className="mt-6 text-5xl font-extrabold md:text-6xl">
              {typedProduct.name}
            </h1>

            <div className="mt-5 flex items-center gap-3">
              <p className="text-2xl text-yellow-400">
                ⭐ {productRating?.effective_rating?.toFixed(1) ?? typedProduct.rating ?? "—"}
              </p>

              {productRating && productRating.review_count > 0 && (
                <span className="text-sm text-gray-400">
                  ({productRating.review_count}{" "}
                  {productRating.review_count === 1 ? "review" : "reviews"})
                </span>
              )}
            </div>

            <p className="mt-6 text-4xl font-extrabold text-yellow-400">
              ₹{typedProduct.price}
            </p>

            <p className="mt-8 text-lg leading-8 text-gray-400">
              {typedProduct.description}
            </p>

            {/* Product Specs */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-center">
                <div>📄</div>
                <p className="text-sm text-gray-400">
                  Pages
                </p>
                <b>{typedProduct.pages}</b>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-center">
                <div>📃</div>
                <p className="text-sm text-gray-400">
                  Paper
                </p>
                <b>{typedProduct.paper}</b>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-center">
                <div>📐</div>
                <p className="text-sm text-gray-400">
                  Size
                </p>
                <b>{typedProduct.size}</b>
              </div>
            </div>

            {/* Shopping Actions */}
            <div className="mt-8 flex flex-col gap-4">
              <AddToCartButton
                product={{
                  id: String(typedProduct.id),
                  name: typedProduct.name,
                  price: typedProduct.price,
                  image: typedProduct.image ?? "/images/notebooks/placeholder.png",
                }}
              />

              <WishlistButton
                product={{
                  id: String(typedProduct.id),
                  name: typedProduct.name,
                  price: typedProduct.price,
                  image: typedProduct.image ?? "/images/notebooks/placeholder.png",
                }}
              />

              <ShareButton
                productName={typedProduct.name}
              />
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="mx-auto mt-24 max-w-7xl">
          <TrustBadges />
        </section>

        {/* Reviews */}
        <section className="mx-auto mt-24 max-w-7xl">
          <ProductReviews productId={typedProduct.id} />
        </section>

        {/* Related Products */}
        <section className="mx-auto mt-24 max-w-7xl">
          <h2 className="mb-8 text-4xl font-extrabold">
            You may also{" "}
            <span className="text-yellow-400">
              like
            </span>
          </h2>

          <RelatedProducts
            currentId={typedProduct.id}
            products={relatedProducts}
          />
        </section>
      </main>

      <Footer />
    </>
  );
}
