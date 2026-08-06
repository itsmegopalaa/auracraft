export default function Audience() {
  return (
    <section className="py-20 max-w-6xl mx-auto">
      <div className="grid md:grid-cols-3 gap-8">

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-yellow-400 transition">
          <h3 className="text-2xl font-bold text-yellow-400">
            Students
          </h3>
          <p className="mt-4 text-gray-400">
            Personalized notebooks that make learning more creative and inspiring.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-yellow-400 transition">
          <h3 className="text-2xl font-bold text-yellow-400">
            Creators
          </h3>
          <p className="mt-4 text-gray-400">
            Premium journals for ideas, visions and your next big creation.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-yellow-400 transition">
          <h3 className="text-2xl font-bold text-yellow-400">
            Professionals
          </h3>
          <p className="mt-4 text-gray-400">
            Elegant notebooks designed for meetings, planning and success.
          </p>
        </div>

      </div>
    </section>
  );
}