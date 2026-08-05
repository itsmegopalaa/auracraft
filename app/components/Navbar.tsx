export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-black/50 border-b border-zinc-800">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-5">
        
        <h1 className="text-3xl font-extrabold tracking-wide text-yellow-400">
          AuraCraft
        </h1>

        <div className="hidden md:flex items-center gap-8 text-gray-300">
          <a href="#" className="hover:text-yellow-400 transition">
            Home
          </a>

          <a href="#" className="hover:text-yellow-400 transition">
            Products
          </a>

          <a href="#" className="hover:text-yellow-400 transition">
            About
          </a>

          <a href="#" className="hover:text-yellow-400 transition">
            Contact
          </a>
        </div>

        <button className="rounded-full bg-yellow-400 px-6 py-3 font-semibold text-black hover:scale-105 transition">
          Shop Now
        </button>

      </div>
    </nav>
  );
}