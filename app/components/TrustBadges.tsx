export default function TrustBadges() {
  return (
    <section className="mt-10 grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-center">
        <div className="text-2xl">📖</div>

        <h3 className="mt-3 font-bold text-white">
          Premium Paper
        </h3>

        <p className="mt-2 text-sm text-gray-400">
          Smooth pages crafted for daily writing.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-center">
        <div className="text-2xl">📦</div>

        <h3 className="mt-3 font-bold text-white">
          Secure Packaging
        </h3>

        <p className="mt-2 text-sm text-gray-400">
          Carefully packed before delivery.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-center">
        <div className="text-2xl">✨</div>

        <h3 className="mt-3 font-bold text-white">
          AuraCraft Quality
        </h3>

        <p className="mt-2 text-sm text-gray-400">
          Designed for creators and dreamers.
        </p>
      </div>
    </section>
  );
}