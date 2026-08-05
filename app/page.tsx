import FeaturedNotebooks from "./components/FeaturedNotebooks";
import NewArrivals from "./components/NewArrivals";
import Image from "next/image";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WhyAuraCraft from "./components/WhyAuraCraft";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <Hero />

      {/* Featured Products */}
      <FeaturedNotebooks />

      {/* Why AuraCraft */}
      <WhyAuraCraft />

      {/* Notebook Showcase */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center">

        <div>
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Your Notebook.
            <br />
            <span className="text-yellow-400">
              Your Identity.
            </span>
          </h2>

          <p className="mt-8 text-lg text-gray-400 leading-8">
            AuraNotes transforms ordinary notebooks into premium creations
            that reflect your personality, dreams, creativity and ambition.
            Every page is designed to inspire your next big idea.
          </p>

          <button className="mt-10 rounded-full bg-yellow-400 px-8 py-4 font-semibold text-black transition hover:scale-105">
            Explore Collection →
          </button>
        </div>

        <div className="flex justify-center">
          <Image
            src="/images/notebook.png"
            alt="AuraNotes Notebook"
            width={450}
            height={600}
            className="rounded-3xl shadow-2xl shadow-yellow-500/20 transition duration-500 hover:scale-105"
          />
        </div>

      </section>

      {/* New Arrivals */}
      <NewArrivals />

      {/* Footer */}
      <Footer />

    </main>
  );
}