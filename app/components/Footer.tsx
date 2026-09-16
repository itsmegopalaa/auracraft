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

const socialLinks = [
  ["Instagram", "#"],
  ["YouTube", "#"],
  ["LinkedIn", "#"],
] as const;

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex w-fit items-center gap-2 text-sm text-[var(--mn-text-secondary)] transition-colors duration-300 hover:text-[var(--mn-text)]"
    >
      <span className="relative">
        {children}
        <span
          aria-hidden="true"
          className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[var(--mn-accent)] transition-transform duration-300 group-hover:scale-x-100"
        />
      </span>
      <span
        aria-hidden="true"
        className="translate-x-[-3px] text-[var(--mn-accent)] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
      >
        →
      </span>
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-[var(--mn-border)] bg-[var(--mn-surface)]">
      <div className="mn-container-wide">
        {/* Main footer */}
        <div className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.8fr_1fr_1.15fr_1fr] lg:gap-12 lg:py-24">
          {/* Brand */}
          <div className="max-w-md">
            <Link
              href="/"
              className="group inline-flex items-baseline gap-2 text-[30px] font-black tracking-[-0.07em] text-[var(--mn-text)]"
              aria-label="MineNote home"
            >
              <span className="transition-colors duration-300 group-hover:text-[var(--mn-accent)]">
                MineNote
              </span>
              <span
                aria-hidden="true"
                className="text-[var(--mn-accent)] opacity-70"
              >
                .
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-[var(--mn-text-secondary)]">
              Personalized notebooks made for ideas, stories, plans, and the
              things that make your world yours.
            </p>

            <div className="mt-7 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-px w-7 bg-[var(--mn-accent)]"
              />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--mn-accent)]">
                Craft Your Identity
              </p>
            </div>

            <p className="mt-5 text-xs font-medium text-[var(--mn-text-muted)]">
              MineNote — a brand by AuraCraft
            </p>
          </div>

          {/* Explore */}
          <div>
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-[var(--mn-accent)]"
              />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--mn-text-muted)]">
                Explore
              </h2>
            </div>

            <nav className="mt-6 flex flex-col gap-4">
              {exploreLinks.map(([href, label]) => (
                <FooterLink key={href} href={href}>
                  {label}
                </FooterLink>
              ))}
            </nav>
          </div>

          {/* Information */}
          <div>
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-[var(--mn-accent)]"
              />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--mn-text-muted)]">
                Information
              </h2>
            </div>

            <nav className="mt-6 flex flex-col gap-4">
              {policyLinks.map(([href, label]) => (
                <FooterLink key={href} href={href}>
                  {label}
                </FooterLink>
              ))}
            </nav>
          </div>

          {/* Connect */}
          <div>
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-[var(--mn-accent)]"
              />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--mn-text-muted)]">
                Connect
              </h2>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              {socialLinks.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  className="group inline-flex w-fit items-center gap-2 text-sm text-[var(--mn-text-secondary)] transition-colors duration-300 hover:text-[var(--mn-text)]"
                >
                  <span className="relative">
                    {label}
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[var(--mn-accent)] transition-transform duration-300 group-hover:scale-x-100"
                    />
                  </span>
                  <span
                    aria-hidden="true"
                    className="translate-x-[-3px] text-[var(--mn-accent)] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                  >
                    ↗
                  </span>
                </a>
              ))}

              <a
                href="mailto:orders@minenote.in"
                className="group mt-1 inline-flex w-fit flex-col text-sm text-[var(--mn-text-secondary)] transition-colors duration-300 hover:text-[var(--mn-text)]"
              >
                <span>orders@minenote.in</span>
                <span
                  aria-hidden="true"
                  className="mt-1 h-px w-0 bg-[var(--mn-accent)] transition-all duration-300 group-hover:w-full"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--mn-border)] py-6">
          <div className="flex flex-col gap-4 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--mn-text-muted)] sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 MineNote • A brand by AuraCraft</p>

            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-px w-5 bg-[var(--mn-border-strong)]"
              />
              <span>Crafted with</span>
              <span aria-hidden="true" className="text-sm">
                ❤️
              </span>
              <span>in India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
