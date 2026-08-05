import ProductCard from "./ProductCard";
import { notebooks } from "../data/notebooks";
export default function FeaturedNotebooks() {
  return (
    <section className="max-w-7xl mx-auto py-24">
      <h2 className="text-5xl font-bold text-center">
        Featured <span className="text-yellow-400">AuraNotes</span>
      </h2>

      <p className="text-center text-gray-400 mt-5 mb-14">
        Choose a notebook that matches your personality.
      </p>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
{notebooks
  .filter((book) => book.featured)
  .map((book) => (
  <ProductCard
  id={book.id}
    key={book.id}
    name={book.name}
    image={book.image}
    price={book.price}
    category={book.category}
    rating={book.rating}
    bestseller={book.bestseller}
  />
))}      </div>
    </section>
  );
}