const categories = [
  {
    name: "Anime",
    icon: "🌸",
    description: "Aesthetic anime inspired designs",
  },
  {
    name: "Nature",
    icon: "🏔️",
    description: "Mountains, forests and calm vibes",
  },
  {
    name: "Superhero",
    icon: "🦸",
    description: "Powerful hero collections",
  },
  {
    name: "Fantasy",
    icon: "☠️",
    description: "Dark and mysterious artwork",
  },
  {
    name: "Galaxy",
    icon: "🌌",
    description: "Space and cosmic designs",
  },
];

export default function Categories() {
  return (
    <section className="max-w-7xl mx-auto py-24">
      <h2 className="text-5xl font-bold text-center">
        Explore{" "}
        <span className="text-yellow-400">
          Collections
        </span>
      </h2>

      <p className="text-center text-gray-400 mt-5 mb-14">
        Find a notebook that matches your style.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {categories.map((category) => (
          <div
            key={category.name}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-center transition hover:-translate-y-2 hover:border-yellow-400"
          >
            <div className="text-5xl">
              {category.icon}
            </div>

            <h3 className="mt-4 text-xl font-bold">
              {category.name}
            </h3>

            <p className="mt-2 text-sm text-gray-400">
              {category.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}