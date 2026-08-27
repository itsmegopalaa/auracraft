import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-zinc-800 bg-black">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">

        <div>
          <h2 className="text-3xl font-bold text-yellow-400">
            MineNote
          </h2>

          <p className="mt-5 leading-7 text-gray-400">
            Premium personalized notebooks crafted for students,
            creators and dreamers. Designed to inspire every page
            of your journey.
          </p>

          <p className="mt-5 text-sm text-gray-500">
            A brand by AuraCraft
          </p>
        </div>

        <div>
          <h3 className="mb-5 text-xl font-semibold">
            Explore
          </h3>

          <ul className="space-y-3 text-gray-400">
            <li>
              <Link href="/" className="transition hover:text-yellow-400">
                Home
              </Link>
            </li>

            <li>
              <Link
                href="/products"
                className="transition hover:text-yellow-400"
              >
                Products
              </Link>
            </li>

            <li>
              <Link
                href="/about"
                className="transition hover:text-yellow-400"
              >
                About
              </Link>
            </li>

            <li>
              <Link
                href="/contact"
                className="transition hover:text-yellow-400"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-5 text-xl font-semibold">
            Policies
          </h3>

          <ul className="space-y-3 text-gray-400">
            <li>
              <Link
                href="/shipping-policy"
                className="transition hover:text-yellow-400"
              >
                Shipping Policy
              </Link>
            </li>

            <li>
              <Link
                href="/return-refund-policy"
                className="transition hover:text-yellow-400"
              >
                Return & Refund
              </Link>
            </li>

            <li>
              <Link
                href="/privacy-policy"
                className="transition hover:text-yellow-400"
              >
                Privacy Policy
              </Link>
            </li>

            <li>
              <Link
                href="/terms-and-conditions"
                className="transition hover:text-yellow-400"
              >
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-5 text-xl font-semibold">
            Connect
          </h3>

          <ul className="space-y-3 text-gray-400">
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
              hello@auracraft.com
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-zinc-800 py-6 text-center text-sm text-gray-500">
        © 2026 MineNote • A brand by AuraCraft • Crafted with ❤️ in India
      </div>
    </footer>
  );
}
