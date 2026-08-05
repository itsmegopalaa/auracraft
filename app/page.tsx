import Image from "next/image";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Audience from "./components/Audience";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white px-6">

      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <Hero />

      {/* Audience */}
      <Audience />

      {/* Notebook Preview */}
      <section className="py-24 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-5xl font-bold">
            Your Notebook.
            <span className="text-yellow-400"> Your Identity.</span>
          </h2>

          <p className="mt-6 text-gray-400 text-lg">
            AuraNotes transforms ordinary notebooks into personalized pieces
            that represent your personality, dreams and creativity.
          </p>

          <button className="mt-8 bg-yellow-400 text-black px-8 py-4 rounded-full font-semibold hover:scale-105 transition">
            Create Your AuraNote
          </button>
        </div>

        <div className="flex justify-center">
          <Image
            src="/images/notebook.png"
            alt="AuraNotes Notebook"
            width={420}
            height={550}
            className="rounded-3xl shadow-2xl hover:scale-105 transition duration-500"
          />
        </div>
      </section>

      {/* Why AuraCraft */}
      <section className="py-24 max-w-6xl mx-auto text-center">
        <h2 className="text-5xl font-bold">
          Why <span className="text-yellow-400">AuraCraft?</span>
        </h2>

        <p className="mt-6 text-gray-400 max-w-3xl mx-auto text-lg">
          We believe a notebook is more than paper. It carries your ideas,
          dreams, memories and ambitions. Every AuraNote is designed to inspire
          you every single day.
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