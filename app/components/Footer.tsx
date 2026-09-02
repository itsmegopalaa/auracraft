import Link from "next/link";

const exploreLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Contact" },
];

const policyLinks = [
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/return-refund-policy", label: "Return & Refund" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/[0.10] bg-black">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-16">

          {/* Brand */}
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center outline-none"
              aria-label="MineNote home"
            >
              <span className="text-3xl font-extrabold tracking-tight text-yellow-400">
                MineNote
              </span>
            </Link>

            <p className="mt-5 text-sm leading-7 text-zinc-300">
              Premium personalized notebooks crafted for students,
              creators and dreamers. Designed to make every page feel
              like your own.
            </p>

            <div className="mt-7 flex items-center gap-3">
              <span
                className="h-px w-8 bg-yellow-400/40"
                aria-hidden="true"
              />

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
                A brand by AuraCraft
              </p>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-zinc-300">
              Explore
            </h3>

            <ul className="mt-5 space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="
                      inline-flex min-h-9 items-center
                      text-sm text-zinc-300
                      outline-none transition-colors duration-200
                      hover:text-yellow-400
                      focus-visible:text-yellow-400
                    "
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-zinc-300">
              Policies
            </h3>

            <ul className="mt-5 space-y-3">
              {policyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="
                      inline-flex min-h-9 items-center
                      text-sm text-zinc-300
                      outline-none transition-colors duration-200
                      hover:text-yellow-400
                      focus-visible:text-yellow-400
                    "
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-zinc-300">
              Connect
            </h3>

            <ul className="mt-5 space-y-3 text-sm text-zinc-300">
              <li>
                Instagram 📸
              </li>

              <li>
                YouTube ▶️
              </li>

              <li>
                LinkedIn 💼
              </li>

              <li>
                <a
                  href="mailto:orders@minenote.in"
                  className="
                    inline-flex min-h-9 items-center
                    outline-none transition-colors duration-200
                    hover:text-yellow-400
                    focus-visible:text-yellow-400
                  "
                >
                  orders@minenote.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 flex flex-col gap-4 border-t border-white/[0.10] pt-7 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-sm text-zinc-300">
            © 2026 MineNote. All rights reserved.
          </p>

          <p className="text-sm text-zinc-300">
            Crafted with <span className="text-zinc-300">❤️</span> in India
          </p>
        </div>
      </div>
    </footer>
  );
}
