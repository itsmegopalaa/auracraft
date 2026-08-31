export default function WhyAuraCraft() {
  const features = [
    {
      number: "01",
      icon: "✦",
      title: "Premium Design",
      description:
        "Thoughtfully designed covers with a refined look that feels personal, distinctive, and made to last.",
    },
    {
      number: "02",
      icon: "✎",
      title: "Made Personal",
      description:
        "Choose designs that reflect your personality, interests, and the way you want your notebook to feel.",
    },
    {
      number: "03",
      icon: "♡",
      title: "Made to Inspire",
      description:
        "A notebook should invite you to write, plan, create, and keep coming back to the next page.",
    },
  ];

  return (
    <section
      id="why"
      className="relative overflow-hidden border-y border-white/[0.06]"
    >
      {/* Subtle background glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-yellow-400/[0.025] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-6 sm:py-28 lg:py-32">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-400/80">
            The MineNote difference
          </p>

          <h2 className="text-4xl font-extrabold tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
            Why <span className="text-yellow-400">MineNote?</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8">
            We believe your notebook should feel like more than something you
            write in. It should reflect your ideas, your personality, and the
            things you want to create.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mt-14 grid gap-5 md:mt-16 md:grid-cols-3 md:gap-6">
          {features.map((feature) => (
            <article
              key={feature.number}
              className="
                group relative overflow-hidden rounded-3xl
                border border-white/[0.08]
                bg-white/[0.025]
                p-7
                shadow-[0_12px_40px_rgba(0,0,0,0.18)]
                transition-all duration-300
                hover:-translate-y-1
                hover:border-yellow-400/25
                hover:bg-white/[0.04]
                hover:shadow-[0_18px_45px_rgba(0,0,0,0.28)]
                sm:p-8
              "
            >
              {/* Number */}
              <span
                className="
                  absolute right-6 top-5
                  text-[11px] font-bold tracking-[0.2em]
                  text-zinc-700
                  transition-colors duration-300
                  group-hover:text-yellow-400/30
                "
              >
                {feature.number}
              </span>

              {/* Icon */}
              <div
                className="
                  flex h-12 w-12 items-center justify-center
                  rounded-2xl
                  border border-yellow-400/15
                  bg-yellow-400/[0.06]
                  text-xl text-yellow-400
                  transition-all duration-300
                  group-hover:border-yellow-400/30
                  group-hover:bg-yellow-400/[0.10]
                "
                aria-hidden="true"
              >
                {feature.icon}
              </div>

              <h3 className="mt-7 text-xl font-bold tracking-[-0.01em] text-white">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-zinc-400">
                {feature.description}
              </p>

              {/* Bottom accent */}
              <div
                className="
                  mt-7 h-px w-8
                  bg-yellow-400/40
                  transition-all duration-300
                  group-hover:w-14
                  group-hover:bg-yellow-400/70
                "
                aria-hidden="true"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
