export default function Testimonials() {
  return (
    <section className="py-24 max-w-6xl mx-auto px-6">
      <h2 className="text-5xl font-bold text-center">
        What People <span className="text-yellow-400">Say</span>
      </h2>

      <div className="grid md:grid-cols-2 gap-8 mt-16">
        <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
          <p className="text-gray-300 text-lg">
            "MineNote feels different from ordinary notebooks. The cover
            design is elegant and inspiring."
          </p>

          <p className="mt-6 font-bold text-white">
            — MineNote Customer
          </p>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
          <p className="text-gray-300 text-lg">
            Thousands of creators trust MineNote to capture ideas, dreams,
            plans, and memories.
          </p>

          <p className="mt-6 font-bold text-white">
            — MineNote Community
          </p>
        </div>
      </div>
    </section>
  );
}