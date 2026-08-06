import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black px-6 py-24 text-white">

        <section className="mx-auto max-w-5xl">

          <div className="text-center">

            <p className="inline-flex rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-300">
              ✨ Contact AuraCraft
            </p>

            <h1 className="mt-8 text-5xl font-extrabold md:text-7xl">
              Let's Create
              <br />
              <span className="text-yellow-400">
                Something Amazing
              </span>
            </h1>

            <p className="mt-6 text-lg text-gray-400">
              Have a question, custom notebook idea or business inquiry?
              We would love to hear from you.
            </p>

          </div>


          <div className="mt-16 grid gap-8 md:grid-cols-2">


            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

              <h2 className="text-2xl font-bold">
                Get In Touch
              </h2>

              <div className="mt-6 space-y-4 text-gray-400">

                <p>
                  📧 Email: hello@auracraft.com
                </p>

                <p>
                  📱 Instagram: @auracraft
                </p>

                <p>
                  🇮🇳 Made with ❤️ in India
                </p>

              </div>

            </div>


            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

              <h2 className="text-2xl font-bold mb-6">
                Send Message
              </h2>

              <input
                placeholder="Your Name"
                className="w-full rounded-xl border border-zinc-700 bg-black p-4 mb-4"
              />

              <input
                placeholder="Your Email"
                className="w-full rounded-xl border border-zinc-700 bg-black p-4 mb-4"
              />

              <textarea
                placeholder="Your Message"
                rows={4}
                className="w-full rounded-xl border border-zinc-700 bg-black p-4"
              />

              <button className="mt-5 w-full rounded-full bg-yellow-400 py-4 font-bold text-black hover:scale-105 transition">
                Send Message →
              </button>

            </div>


          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}