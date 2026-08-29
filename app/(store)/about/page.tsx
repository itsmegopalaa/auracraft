import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "About MineNote | Our Story",
  description:
    "Learn about MineNote, a notebook brand creating premium designs for students, creators and dreamers.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About MineNote | Our Story",
    description:
      "Discover the story and vision behind MineNote.",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <>

      <main className="min-h-screen bg-black px-6 py-24 text-white">

        <section className="mx-auto max-w-6xl text-center">

          <p className="inline-flex rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-300">
            ✨About MineNote
          </p>


          <h1 className="mt-8 text-5xl font-extrabold md:text-7xl">
            Every Idea
            <br />
            Deserves A
            <span className="text-yellow-400">
              {" "}Legacy
            </span>
          </h1>


          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-gray-400">
            MineNote creates premium notebooks that are more than paper and
            covers. They are a space for your dreams, ideas, creativity and
            the stories you are building every day.
          </p>



          <div className="mt-20 grid gap-8 md:grid-cols-3">


            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 transition hover:-translate-y-2 hover:border-yellow-400">

              <div className="text-5xl">
                🎨
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                Designed For You
              </h2>

              <p className="mt-3 text-gray-400">
                Unique designs created for different personalities and
                creative minds.
              </p>

            </div>



            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 transition hover:-translate-y-2 hover:border-yellow-400">

              <div className="text-5xl">
                📖
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                Premium Experience
              </h2>

              <p className="mt-3 text-gray-400">
                Quality materials and thoughtful details that make writing
                enjoyable.
              </p>

            </div>



            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 transition hover:-translate-y-2 hover:border-yellow-400">

              <div className="text-5xl">
                🚀
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                Built For Dreamers
              </h2>

              <p className="mt-3 text-gray-400">
                Helping students, creators and ambitious people capture their
                next big idea.
              </p>

            </div>


          </div>



          <div className="mt-20 rounded-3xl border border-yellow-400/30 bg-zinc-900 p-10">

            <h2 className="text-4xl font-bold">
              Your Story Starts On A Blank Page.
            </h2>

            <p className="mt-5 text-gray-400 text-lg">
              Choose a notebook that represents who you are and what you want
              to create.
            </p>


            <Link
              href="/products"
              className="mt-8 inline-block rounded-full bg-yellow-400 px-8 py-4 font-bold text-black transition hover:scale-105"
            >
              Explore Collection →
            </Link>

          </div>


        </section>

      </main>


      <Footer />
    </>
  );
}