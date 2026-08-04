import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white px-6">

      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center text-center">

        <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
          Create Your
          <span className="text-yellow-400"> AuraCraft 🚀📓</span>
        </h1>

        <p className="mt-8 text-xl md:text-2xl text-gray-300 max-w-2xl">
          Premium personalized notebooks crafted for students,
          creators and dreamers.
        </p>

        <div className="mt-10 flex gap-5">

          <button className="bg-yellow-400 text-black px-8 py-4 rounded-full font-semibold hover:scale-105 transition">
            Explore AuraNotes
          </button>

          <button className="border border-gray-600 px-8 py-4 rounded-full hover:border-yellow-400 transition">
            Our Story
          </button>

        </div>

      </section>

      {/* Product Showcase */}
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

      {/* Notebook Preview */}
      <section className="py-24 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

        <div>

          <h2 className="text-5xl font-bold">
            Your Notebook.
            <span className="text-yellow-400"> Your Identity.</span>
          </h2>

          <p className="mt-6 text-gray-400 text-lg">
            AuraNotes transforms ordinary notebooks into
            personalized pieces that represent your personality,
            dreams and creativity.
          </p>

          <button className="mt-8 bg-yellow-400 text-black px-8 py-4 rounded-full font-semibold hover:scale-105 transition">
            Create Your AuraNote
          </button>

        </div>

        <div className="h-[450px] bg-gradient-to-br from-zinc-900 to-black rounded-3xl border border-zinc-800 flex items-center justify-center">

          <div className="relative w-64 h-80 bg-black rounded-xl border border-yellow-400 shadow-2xl flex flex-col items-center justify-center overflow-hidden">

            <div className="absolute top-0 left-0 w-full h-2 bg-yellow-400"></div>

            <h3 className="text-4xl font-bold text-yellow-400 tracking-wide">
              AuraNotes
            </h3>

            <p className="mt-4 text-gray-400 text-sm">
              Craft Your Identity
            </p>

            <div className="absolute bottom-5 text-xs text-gray-500">
              Premium Collection
            </div>

          </div>

        </div>

      </section>

      {/* Why AuraCraft */}
      <section className="py-24 max-w-6xl mx-auto text-center">

        <h2 className="text-5xl font-bold">
          Why <span className="text-yellow-400">AuraCraft?</span>
        </h2>

        <p className="mt-6 text-gray-400 max-w-3xl mx-auto text-lg">
          We believe a notebook is more than paper.
          It carries your ideas, dreams, memories and ambitions.
          Every AuraNote is designed to inspire you every single day.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mt-16">

          <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
            <div className="text-5xl">✨</div>
            <h3 className="mt-5 text-2xl font-bold">Premium Design</h3>
            <p className="mt-4 text-gray-400">
              Elegant covers crafted with attention to every detail.
            </p>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
            <div className="text-5xl">🎨</div>
            <h3 className="mt-5 text-2xl font-bold">Personalized</h3>
            <p className="mt-4 text-gray-400">
              Your name, your photo and your own unique style.
            </p>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
            <div className="text-5xl">💛</div>
            <h3 className="mt-5 text-2xl font-bold">Made with Passion</h3>
            <p className="mt-4 text-gray-400">
              Every notebook is created to make ordinary moments unforgettable.
            </p>
          </div>

        </div>

      </section>

    </main>
  );
}