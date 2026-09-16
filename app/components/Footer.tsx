import Link from "next/link";

const exploreLinks = [
  ["/", "Home"],
  ["/products", "Products"],
  ["/about", "Our Story"],
  ["/contact", "Contact"],
] as const;

const policyLinks = [
  ["/shipping-policy", "Shipping Policy"],
  ["/return-refund", "Return & Refund"],
  ["/privacy-policy", "Privacy Policy"],
  ["/terms", "Terms & Conditions"],
] as const;

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--mn-border)] bg-[var(--mn-surface)]">
      <div className="mn-container-wide py-14 sm:py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1.2fr_1fr] lg:gap-10">
          <div className="max-w-md">
            <Link
              href="/"
              className="inline-flex text-[28px] font-black tracking-[-0.065em] text-[var(--mn-text)]"
            >
              MineNote
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 text-[var(--mn-text-secondary)]">
              Personalized notebooks made for ideas, stories, plans and the
              things that make your world yours.
            </p>

            <p className="mt-5 text-xs font-medium text-[var(--mn-text-muted)]">
              A brand by AuraCraft
            </p>
          </div>

          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--mn-text-muted)]">
              Explore
            </h2>

            <nav className="mt-5 flex flex-col gap-3">
              {exploreLinks.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="w-fit text-sm text-[var(--mn-text-secondary)] transition-colors hover:text-[var(--mn-text)]"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--mn-text-muted)]">
              Information
            </h2>

            <nav className="mt-5 flex flex-col gap-3">
              {policyLinks.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="w-fit text-sm text-[var(--mn-text-secondary)] transition-colors hover:text-[var(--mn-text)]"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--mn-text-muted)]">
              Connect
            </h2>

            <div className="mt-5 flex flex-col gap-3 text-sm text-[var(--mn-text-secondary)]">
              <span>Instagram</span>
              <span>YouTube</span>
              <span>LinkedIn</span>

              <a
                href="mailto:orders@minenote.in"
                className="w-fit transition-colors hover:text-[var(--mn-text)]"
              >
                orders@minenote.in
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-[var(--mn-border)] pt-6 text-xs text-[var(--mn-text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 MineNote • A brand by AuraCraft</p>
          <p>Crafted with ❤️ in India.</p>
        </div>
      </div>
    </footer>
  );
}
