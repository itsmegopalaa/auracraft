import { notebooks } from "../data/notebooks";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";

export default function ProductsPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black text-white">

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-zinc-800">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#facc1520,transparent_65%)]" />

          <div className="relative mx-auto max-w-7xl px-6 py-24">

            <p className="inline-flex rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-300">
              ✨ Premium Collection
            </p>

            <h1 className="mt-6 text-5xl font-extrabold md:text-7xl">
              Find Your
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                Perfect Notebook
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-gray-400">
              Every AuraNotes notebook is crafted to inspire creativity,
              productivity and ambition. Discover premium designs made to
              match your personality.
            </p>

            <div className="mt-10 flex flex-wrap gap-4 text-sm text-gray-300">

              <div className="rounded-full border border-zinc-700 px-5 py-2">
                📚 {notebooks.length} Designs
              </div>

              <div className="rounded-full border border-zinc-700 px-5 py-2">
                ⭐ Premium Quality
              </div>

              <div className="rounded-full border border-zinc-700 px-5 py-2">
                🚚 Fast Delivery
              </div>

            </div>

          </div>

        </section>

        {/* Products */}
        <section className="mx-auto max-w-7xl px-6 py-20">

          <div className="mb-12 flex items-center justify-between">

            <h2 className="text-3xl font-bold">
              All Products
            </h2>

            <p className="text-gray-400">
              {notebooks.length} Products
            </p>

          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

            {notebooks.map((book) => (
              <ProductCard
                key={book.id}
                id={book.id}
                name={book.name}
                image={book.image}
                price={book.price}
                category={book.category}
                rating={book.rating}
                bestseller={book.bestseller}
              />
            ))}

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}