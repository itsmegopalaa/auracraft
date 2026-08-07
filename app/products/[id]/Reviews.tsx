export default function Reviews() {
  const reviews = [
    {
      name: "Aarav",
      rating: 5,
      text: "Beautiful design and premium paper quality.",
    },
    {
      name: "Riya",
      rating: 5,
      text: "Perfect notebook for journaling and creativity.",
    },
    {
      name: "Kabir",
      rating: 4,
      text: "Loved the cover design. Feels premium.",
    },
  ];

  return (
    <section className="mt-12">
      <h2 className="text-3xl font-bold text-white mb-6">
        Customer Reviews ⭐
      </h2>

      <div className="grid gap-5 md:grid-cols-3">
        {reviews.map((review, index) => (
          <div
            key={index}
            className="
              rounded-2xl
              border
              border-zinc-800
              bg-zinc-900
              p-5
            "
          >
            <div className="text-yellow-400">
              {"⭐".repeat(review.rating)}
            </div>

            <p className="mt-3 text-gray-300">
              {review.text}
            </p>

            <p className="mt-4 font-bold text-white">
              — {review.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}