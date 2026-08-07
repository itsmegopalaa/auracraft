"use client";

import ProductCard from "../ProductCard";
import { notebooks } from "../../data/notebooks";

type Props = {
  currentId: number;
  category: string;
};

export default function RelatedProducts({
  currentId,
}: Props) {
  const related = notebooks
    .filter((book) => book.id !== currentId)
    .slice(0, 3);

  if (related.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-12 text-4xl font-extrabold text-white">
        You may also{" "}
        <span className="text-yellow-400">like</span>
      </h2>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((book) => (
          <ProductCard
            key={book.id}
            {...book}
          />
        ))}
      </div>
    </section>
  );
}
