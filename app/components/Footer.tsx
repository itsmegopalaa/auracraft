import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 mt-24 bg-black">

      <div className="max-w-7xl mx-auto px-6 py-16 grid gap-12 md:grid-cols-3">


        {/* Brand */}
        <div>

          <h2 className="text-3xl font-bold text-yellow-400">
            MineNote

          </h2>

          <p className="mt-5 leading-7 text-gray-400">
            Premium personalized notebooks crafted for students,
            creators and dreamers. Designed to inspire every page
            of your journey.
          </p>

        </div>



        {/* Quick Links */}
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
              <Link href="/products" className="transition hover:text-yellow-400">
                Products
              </Link>
            </li>


            <li>
              <Link href="/about" className="transition hover:text-yellow-400">
                About
              </Link>
            </li>


            <li>
              <Link href="/contact" className="transition hover:text-yellow-400">
                Contact
              </Link>
            </li>

          </ul>

        </div>




        {/* Connect */}
        <div>

          <h3 className="mb-5 text-xl font-semibold">
            Connect
          </h3>


          <ul className="space-y-3 text-gray-400">

            <li className="transition hover:text-yellow-400 cursor-pointer">
              Instagram 📸
            </li>

            <li className="transition hover:text-yellow-400 cursor-pointer">
              YouTube ▶️
            </li>

            <li className="transition hover:text-yellow-400 cursor-pointer">
              LinkedIn 💼
            </li>

            <li className="transition hover:text-yellow-400 cursor-pointer">
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