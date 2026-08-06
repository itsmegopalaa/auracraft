export default function WhyAuraCraft() {
  return (
    <section
  id="why"
  className="py-24 max-w-6xl mx-auto text-center"
>
      <h2 className="text-5xl font-bold">
        Why <span className="text-yellow-400">AuraCraft?</span>
      </h2>

      <p className="mt-6 text-gray-400 max-w-3xl mx-auto text-lg">
        We believe a notebook is more than paper. It carries your ideas,
        dreams, memories and ambitions. Every AuraNote is designed to inspire
        you every single day.
      </p>

      <div className="grid md:grid-cols-3 gap-8 mt-16">

        <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
          <div className="text-5xl">✨</div>
          <h3 className="mt-5 text-2xl font-bold">
            Premium Design
          </h3>
          <p className="mt-4 text-gray-400">
            Elegant covers crafted with attention to every detail.
          </p>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
          <div className="text-5xl">🎨</div>
          <h3 className="mt-5 text-2xl font-bold">
            Personalized
          </h3>
          <p className="mt-4 text-gray-400">
            Your name, your photo and your own unique style.
          </p>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
          <div className="text-5xl">💛</div>
          <h3 className="mt-5 text-2xl font-bold">
            Made with Passion
          </h3>
          <p className="mt-4 text-gray-400">
            Every notebook is created to make ordinary moments unforgettable.
          </p>
        </div>

      </div>
    </section>
  );
}