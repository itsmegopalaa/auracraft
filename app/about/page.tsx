import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black px-6 py-24 text-white">

        <section className="mx-auto max-w-5xl text-center">

          <p className="inline-flex rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-300">
            ✨ About AuraCraft
          </p>

          <h1 className="mt-8 text-5xl font-extrabold md:text-7xl">
            More Than A
            <br />
            <span className="text-yellow-400">
              Notebook
            </span>
          </h1>

          <p className="mt-8 text-lg leading-8 text-gray-400">
            AuraCraft creates premium personalized notebooks designed for
            students, creators and dreamers. We believe every idea deserves
            a beautiful place to grow.
          </p>


          <div className="mt-16 grid gap-8 md:grid-cols-3">

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <div className="text-5xl">🎨</div>
              <h2 className="mt-5 text-2xl font-bold">
                Creative Designs
              </h2>
              <p className="mt-3 text-gray-400">
                Unique covers created to match your personality.
              </p>
            </div>


            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <div className="text-5xl">📖</div>
              <h2 className="mt-5 text-2xl font-bold">
                Premium Quality
              </h2>
              <p className="mt-3 text-gray-400">
                Quality pages built for your everyday ideas.
              </p>
            </div>


            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <div className="text-5xl">🚀</div>
              <h2 className="mt-5 text-2xl font-bold">
                Inspire Growth
              </h2>
              <p className="mt-3 text-gray-400">
                Turning simple notes into meaningful journeys.
              </p>
            </div>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}