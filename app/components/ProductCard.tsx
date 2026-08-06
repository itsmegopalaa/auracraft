import Link from "next/link";
import Image from "next/image";

type ProductCardProps = {
  id: number;
  name: string;
  image: string;
 price: number;
  category: string;
  rating: number;
  bestseller: boolean;
};

export default function ProductCard({
  id,
  name,
  image,
  price,
  category,
  rating,
  bestseller,
}: ProductCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 transition-all duration-500 hover:-translate-y-3 hover:border-yellow-400/70 hover:shadow-2xl hover:shadow-yellow-400/10">
      
      {bestseller && (
        <span className="absolute left-4 top-4 z-20 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-black shadow-lg">
          🔥 BEST SELLER
        </span>
      )}

      <button className="absolute right-4 top-4 z-20 rounded-full bg-black/40 p-2 backdrop-blur transition hover:scale-110">
        🤍
      </button>

      <div className="overflow-hidden">
        <Image
          src={image}
          alt={name}
          width={500}
          height={700}
          className="h-[360px] w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      <div className="p-6">
        <div className="mb-3 inline-block rounded-full bg-zinc-800 px-3 py-1 text-sm text-yellow-400">
          {category}
        </div>

        <h3 className="text-xl font-bold text-white">
          {name}
        </h3>

        <p className="mt-2 text-yellow-400">
          ⭐ {rating}
        </p>

        <p className="mt-2 text-lg font-semibold text-white">
  ₹{price}
</p>

        <Link
          href={`/products/${id}`}
          className="mt-6 block w-full rounded-full bg-yellow-400 py-3 text-center font-semibold text-black transition-all duration-300 hover:bg-yellow-300 hover:scale-105"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}