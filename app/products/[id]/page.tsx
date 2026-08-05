import Image from "next/image";
import { notebooks } from "../../data/notebooks";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Product not found
      </div>
    );
  }

  return (
  <>
    <Navbar />

    <main className="min-h-screen bg-black text-white px-6 py-24">
      <section className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

        <div>
          <Image
            src={product.image}
            alt={product.name}
            width={500}
            height={700}
            className="rounded-3xl"
          />
        </div>

        <div>
          <span className="rounded-full bg-zinc-800 px-4 py-2 text-yellow-400">
            {product.category}
          </span>

          <h1 className="mt-6 text-5xl font-bold">
            {product.name}
          </h1>

          <p className="mt-4 text-yellow-400 text-2xl">
            ⭐ {product.rating}
          </p>

          <p className="mt-4 text-3xl font-bold">
            {product.price}
          </p>

          <p className="mt-6 text-gray-400 text-lg">
  {product.description}
</p>

<div className="mt-6 space-y-3 text-gray-300">
  <p>📄 Pages: {product.pages}</p>
  <p>📃 Paper: {product.paper}</p>
  <p>📐 Size: {product.size}</p>
</div>

          <button className="mt-8 rounded-full bg-yellow-400 px-10 py-4 font-bold text-black hover:scale-105 transition">
            Add to Cart
          </button>

        </div>

      </section>
    </main>

    <Footer />
  </>
);
}