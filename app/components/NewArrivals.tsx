import ProductCard from "./ProductCard";
import { notebooks } from "../data/notebooks";

export default function NewArrivals() {
  return (
    <section className="max-w-7xl mx-auto py-24">
      <h2 className="text-5xl font-bold text-center">
        New{" "}
        <span className="text-yellow-400">
          Arrivals
        </span>
      </h2>

      <p className="text-center text-gray-400 mt-5 mb-14">
        Fresh designs added to the AuraCraft collection.
      </p>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {notebooks
          .filter((book) => book.newArrival)
          .map((book) => (
            <ProductCard
              key={book.id}
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
  );
}