import Image from "next/image";

type ProductCardProps = {
  name: string;
  image: string;
  price: string;
};

export default function ProductCard({
  name,
  image,
  price,
}: ProductCardProps) {
  return (
    <div className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-yellow-400 hover:-translate-y-2 transition-all duration-300">
      <Image
        src={image}
        alt={name}
        width={500}
        height={700}
        className="w-full h-[360px] object-cover"
      />

      <div className="p-6">
        <h3 className="text-xl font-bold">{name}</h3>

        <p className="text-yellow-400 mt-2 text-lg font-semibold">
          {price}
        </p>

        <button className="mt-5 w-full rounded-full bg-yellow-400 py-3 font-semibold text-black hover:scale-105 transition">
          Customize
        </button>
      </div>
    </div>
  );
}