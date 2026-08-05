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
          <div
            key={book.name}
            className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-yellow-400 hover:-translate-y-2 transition-all duration-300"
          >
            <Image
              src={book.image}
              alt={book.name}
              width={500}
              height={700}
              className="w-full h-[360px] object-cover"
            />

            <div className="p-6">
              <h3 className="text-xl font-bold">{book.name}</h3>

              <p className="text-yellow-400 mt-2 text-lg font-semibold">
                {book.price}
              </p>

              <button className="mt-5 w-full rounded-full bg-yellow-400 py-3 font-semibold text-black hover:scale-105 transition">
                Customize
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}