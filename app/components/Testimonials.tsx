export default function Testimonials() {
  const testimonials = [
    {
      name: "Aarav Sharma",
      role: "Engineering Student",
      review:
        "The notebook quality is outstanding. Premium paper, beautiful design, and perfect for daily notes.",
    },
    {
      name: "Riya Kapoor",
      role: "Content Creator",
      review:
        "AuraCraft feels different from ordinary notebooks. The cover design is elegant and inspiring.",
    },
    {
      name: "Kabir Verma",
      role: "Entrepreneur",
      review:
        "Excellent build quality. It genuinely feels like a luxury notebook worth carrying everywhere.",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
          Testimonials
        </p>

        <h2 className="mt-4 text-4xl font-extrabold md:text-5xl">
          Loved by{" "}
          <span className="text-yellow-400">
            Students & Creators
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-400">
          Thousands of creators trust AuraCraft to capture ideas,
          dreams and daily inspiration.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {testimonials.map((item) => (
          <div
            key={item.name}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 transition duration-300 hover:-translate-y-2 hover:border-yellow-400"
          >
            <div className="text-2xl">⭐⭐⭐⭐⭐</div>

            <p className="mt-6 leading-8 text-gray-300">
              "{item.review}"
            </p>

            <div className="mt-8">
              <h3 className="font-bold text-lg">
                {item.name}
              </h3>

              <p className="text-sm text-gray-500">
                {item.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}