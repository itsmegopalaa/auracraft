export default function Navbar() {
  return (
    <nav className="flex justify-between items-center py-8 max-w-6xl mx-auto px-6">
      <h2 className="text-2xl font-bold text-yellow-400">
        AuraCraft
      </h2>

      <button className="border border-yellow-400 px-5 py-2 rounded-full text-yellow-400 hover:bg-yellow-400 hover:text-black transition">
        Contact
      </button>
    </nav>
  );
}