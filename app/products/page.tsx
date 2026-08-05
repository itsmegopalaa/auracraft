import { notebooks } from "../data/notebooks";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";

export default function ProductsPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black px-6 py-24 text-white">

        <section className="mx-auto max-w-7xl">

          <div className="text-center mb-16">

            <h1 className="text-5xl md:text-6xl font-extrabold">
              Explore
              <span className="text-yellow-400">
                {" "}AuraNotes
              </span>
            </h1>

            <p className="mt-5 text-lg text-gray-400">
              Discover premium notebooks designed for your ideas,
              creativity and ambition.
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