
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductsClient from "./ProductsClient";
import { notebooks } from "../data/notebooks";

export default function ProductsPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black text-white">

        <section className="border-b border-zinc-800">
         <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">

            <p className="inline-flex rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-300">
              ✨ Premium Collection
            </p>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-7xl">
              Find Your
              <br />
              <span className="text-yellow-400">
                Perfect Notebook
              </span>
            </h1>

           <p className="mt-6 max-w-2xl text-base leading-7 text-gray-400 md:text-lg">
              Discover premium AuraNotes designs crafted for students,
              creators and dreamers.
            </p>

           <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">

              <div className="rounded-full border border-zinc-700 px-5 py-2">
                📚 {notebooks.length} Designs
              </div>

              <div className="rounded-full border border-zinc-700 px-5 py-2">
                ⭐ Premium Quality
              </div>

            </div>

          </div>
        </section>


       <section className="mx-auto max-w-7xl px-6 py-14 md:py-20">

          <h2 className="mb-10 text-3xl font-bold">
            All Products
          </h2>

          <ProductsClient />

        </section>

      </main>


      <Footer />
    </>
  );
}