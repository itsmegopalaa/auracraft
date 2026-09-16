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

      <main className="min-h-screen bg-[var(--mn-bg)] px-6 py-24 text-[var(--mn-text)]">

        <section className="mx-auto max-w-6xl text-center">

          <p className="inline-flex rounded-full border border-[var(--mn-accent)] bg-[var(--mn-accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--mn-accent)]">
            ✨About MineNote
          </p>


          <h1 className="mt-8 text-5xl font-extrabold md:text-7xl">
            Every Idea
            <br />
            Deserves A
            <span className="text-[var(--mn-accent)]">
              {" "}Legacy
            </span>
          </h1>


          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-[var(--mn-text-muted)]">
            MineNote creates premium notebooks that are more than paper and
            covers. They are a space for your dreams, ideas, creativity and
            the stories you are building every day.
          </p>



          <div className="mt-20 grid gap-8 md:grid-cols-3">


            <div className="rounded-3xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-8 transition hover:-translate-y-2 hover:border-[var(--mn-accent)]">

              <div className="text-5xl">
                🎨
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                Designed For You
              </h2>

              <p className="mt-3 text-[var(--mn-text-muted)]">
                Unique designs created for different personalities and
                creative minds.
              </p>

            </div>



            <div className="rounded-3xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-8 transition hover:-translate-y-2 hover:border-[var(--mn-accent)]">

              <div className="text-5xl">
                📖
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                Premium Experience
              </h2>

              <p className="mt-3 text-[var(--mn-text-muted)]">
                Quality materials and thoughtful details that make writing
                enjoyable.
              </p>

            </div>



            <div className="rounded-3xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-8 transition hover:-translate-y-2 hover:border-[var(--mn-accent)]">

              <div className="text-5xl">
                🚀
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                Built For Dreamers
              </h2>

              <p className="mt-3 text-[var(--mn-text-muted)]">
                Helping students, creators and ambitious people capture their
                next big idea.
              </p>

            </div>


          </div>



          <div className="mt-20 rounded-3xl border border-[var(--mn-accent)] bg-[var(--mn-surface)] p-10">

            <h2 className="text-4xl font-bold">
              Your Story Starts On A Blank Page.
            </h2>

            <p className="mt-5 text-[var(--mn-text-muted)] text-lg">
              Choose a notebook that represents who you are and what you want
              to create.
            </p>


            <Link
              href="/products"
              className="mt-8 inline-block rounded-full bg-[var(--mn-accent)] px-8 py-4 font-bold text-[var(--mn-accent-contrast)] transition hover:scale-105"
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