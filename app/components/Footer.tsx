export default function Footer() {
  return (
   <footer id="footer" className="border-t border-zinc-800 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16 grid gap-12 md:grid-cols-3">
        
        {/* Brand */}
        <div>
          <h2 className="text-3xl font-bold text-yellow-400">
            AuraCraft
          </h2>

          <p className="mt-5 text-gray-400 leading-7">
            Premium personalized notebooks crafted for students,
            creators and dreamers. Designed to inspire every page
            of your journey.
          </p>
        </div>

        {/* Quick Links */}
       <ul className="space-y-3 text-gray-400">
  <li>
    <a href="/" className="hover:text-yellow-400 transition">
      Home
    </a>
  </li>

  <li>
    <a href="/products" className="hover:text-yellow-400 transition">
      Products
    </a>
  </li>

  <li>
    <a href="/#why" className="hover:text-yellow-400 transition">
      About
    </a>
  </li>

  <li>
    <a href="/#footer" className="hover:text-yellow-400 transition">
      Contact
    </a>
  </li>
</ul>

        {/* Connect */}
        <div>
          <h3 className="text-xl font-semibold mb-5">
            Connect
          </h3>

          <ul className="space-y-3 text-gray-400">
            <li>Instagram</li>
            <li>YouTube</li>
            <li>LinkedIn</li>
            <li>Email</li>
          </ul>
        </div>

      </div>

      <div className="border-t border-zinc-800 py-6 text-center text-gray-500 text-sm">
        © 2026 AuraCraft • Crafted with ❤️ in India
      </div>
    </footer>
  );
}