import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black px-6 py-24 text-white">

        <section className="mx-auto max-w-6xl">


          <div className="text-center">

            <p className="inline-flex rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-300">
              ✨ Contact AuraCraft
            </p>


            <h1 className="mt-8 text-5xl font-extrabold md:text-7xl">
              Let's Build
              <br />
              <span className="text-yellow-400">
                Your Next Idea
              </span>
            </h1>


            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-400">
              Have a custom notebook idea, collaboration request or any
              question? Our team would love to hear from you.
            </p>

          </div>



          <div className="mt-16 grid gap-10 md:grid-cols-2">


            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 transition hover:border-yellow-400">

              <h2 className="text-3xl font-bold">
                Connect With Us
              </h2>


              <div className="mt-8 space-y-5 text-gray-400 text-lg">

                <p>
                  📧 hello@auracraft.com
                </p>

                <p>
                  📱 @auracraft
                </p>

                <p>
                  🇮🇳 Crafted with passion in India
                </p>


              </div>



              <div className="mt-10 rounded-2xl border border-zinc-700 bg-black p-5">

                <p className="text-yellow-400 font-bold">
                  AuraCraft Promise
                </p>

                <p className="mt-2 text-gray-400">
                  Premium designs. Meaningful pages. Ideas that deserve a
                  beautiful home.
                </p>

              </div>


            </div>




            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10">

              <h2 className="text-3xl font-bold mb-8">
                Send Message
              </h2>


              <input
                placeholder="Your Name"
                className="mb-4 w-full rounded-xl border border-zinc-700 bg-black p-4 outline-none focus:border-yellow-400"
              />


              <input
                placeholder="Your Email"
                className="mb-4 w-full rounded-xl border border-zinc-700 bg-black p-4 outline-none focus:border-yellow-400"
              />


              <textarea
                placeholder="Your Message"
                rows={5}
                className="w-full rounded-xl border border-zinc-700 bg-black p-4 outline-none focus:border-yellow-400"
              />


              <button className="mt-6 w-full rounded-full bg-yellow-400 py-4 font-bold text-black transition hover:scale-105">
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