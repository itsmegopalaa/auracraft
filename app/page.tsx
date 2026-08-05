import FeaturedNotebooks from "./components/FeaturedNotebooks";
import Image from "next/image";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Audience from "./components/Audience";
import WhyAuraCraft from "./components/WhyAuraCraft";
import Footer from "./components/Footer";
export default function Home() {
  return (    <main className="min-h-screen bg-black text-white px-6">

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
<FeaturedNotebooks />
<WhyAuraCraft />
<Footer />
    </main>
  );
}