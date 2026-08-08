import ProductGallery from "../../components/products/ProductGallery";
import { notebooks } from "../../data/notebooks";
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

  const product = notebooks.find(
    (book) => book.id === Number(id)
  );

  if (!product) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
          <h1 className="text-3xl font-bold">
            Product not found
          </h1>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black px-6 py-24 text-white">
        <section className="mx-auto grid max-w-7xl items-center gap-16 md:grid-cols-2">
          {/* Gallery */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            {product.bestseller && (
              <span className="absolute left-6 top-6 z-10 rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-black">
                🔥 BEST SELLER
              </span>
            )}

            <ProductGallery
              image={product.image}
              name={product.name}
            />
          </div>

          {/* Product Details */}
          <div>
            <span className="inline-block rounded-full bg-zinc-800 px-5 py-2 text-yellow-400">
              {product.category}
            </span>

            <h1 className="mt-6 text-5xl font-extrabold md:text-6xl">
              {product.name}
            </h1>

            <p className="mt-5 text-2xl text-yellow-400">
              ⭐ {product.rating}
            </p>

            <p className="mt-6 text-4xl font-extrabold text-yellow-400">
              ₹{product.price}
            </p>

            <p className="mt-8 text-lg leading-8 text-gray-400">
              {product.description}
            </p>

            {/* Product Specs */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-center">
                <div>📄</div>
                <p className="text-sm text-gray-400">
                  Pages
                </p>
                <b>{product.pages}</b>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-center">
                <div>📃</div>
                <p className="text-sm text-gray-400">
                  Paper
                </p>
                <b>{product.paper}</b>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-center">
                <div>📐</div>
                <p className="text-sm text-gray-400">
                  Size
                </p>
                <b>{product.size}</b>
              </div>
            </div>

            {/* Shopping Actions */}
            <div className="mt-8 flex flex-col gap-4">
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                }}
              />

              <WishlistButton
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                }}
              />

              <ShareButton
                productName={product.name}
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
          <ProductReviews />
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
            currentId={product.id}
            category={product.category ?? "All"}
          />
        </section>
      </main>

      <Footer />
    </>
  );
}
