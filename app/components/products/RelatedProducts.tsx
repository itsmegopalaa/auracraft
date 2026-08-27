"use client";

import ProductCard from "../ProductCard";
import type { Product } from "../../lib/products";

type Props = {
  currentId: string;
  products: Product[];
};

export default function RelatedProducts({
  currentId,
  products,
}: Props) {
  const related = products
    .filter((product) => product.id !== currentId)
    .slice(0, 3);

  if (related.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            image={product.image ?? ""}
            price={product.price}
            category={product.category ?? undefined}
            rating={product.rating ?? undefined}
            reviewCount={product.review_count ?? 0}
            bestseller={product.bestseller}
          />
        ))}
      </div>
    </section>
  );
}
