import ProductCard from "./ProductCard";
import Image from "next/image";

const notebooks = [
  {
    name: "🌸 Sakura Anime",
    image: "/images/notebooks/sakura-anime.png",
    price: "₹299",
  },
  {
    name: "☠️ Shadow Swordsman",
    image: "/images/notebooks/shadow-swordsman.png",
    price: "₹349",
  },
  {
    name: "🌌 Galaxy Hero",
    image: "/images/notebooks/galaxy-hero.png",
    price: "₹399",
  },
  {
    name: "🏔️ Mountain",
    image: "/images/notebooks/mountain.png",
    price: "₹299",
  },
];

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
    {notebooks.map((book) => (
  <ProductCard
    key={book.name}
    name={book.name}
    image={book.image}
    price={book.price}
  />
))}
      </div>
    </section>
  );
}