import ProductGallery from "@/app/components/products/ProductGallery";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { Product } from "@/app/types/products";
import { getProductRating, getProductRatings } from "@/app/lib/product-rating";
import Footer from "@/app/components/Footer";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "./WishlistButton";
import ShareButton from "./ShareButton";
import RelatedProducts from "@/app/components/products/RelatedProducts";
import ProductReviews from "@/app/components/products/ProductReviews";
import TrustBadges from "@/app/components/TrustBadges";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("id, name, description, image, active")
    .eq("id", id)
    .eq("active", true)
    .single();

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested MineNote product could not be found.",
    };
  }

  const description =
    product.description ||
    `Discover the ${product.name} notebook from MineNote.`;

  const image = product.image
    ? product.image.startsWith("http")
      ? product.image
      : `https://minenote.in${product.image}`
    : "https://minenote.in/images/notebooks/placeholder.png";

  const canonical = `https://minenote.in/products/${product.id}`;

  return {
    title: product.name,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${product.name} | MineNote`,
      description,
      url: canonical,
      type: "website",
      siteName: "MineNote",
      images: [
        {
          url: image,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | MineNote`,
      description,
      images: [image],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id, name, price, description, category, image, stock, active, rating, bestseller, featured, new_arrival, pages, paper, size"
    )
    .eq("id", id)
    .eq("active", true)
    .single();

  if (error || !product) {
    console.error("PRODUCT DETAIL LOAD FAILED:", error);
    notFound();
  }

  const typedProduct = product as Product;

  const productImage = typedProduct.image
    ? typedProduct.image.startsWith("http")
      ? typedProduct.image
      : `https://minenote.in${typedProduct.image}`
    : "https://minenote.in/images/notebooks/placeholder.png";

  const { data: reviewsData, error: reviewsError } = await supabase
    .from("product_reviews")
    .select("id, rating, review_text, verified_buyer, created_at")
    .eq("product_id", typedProduct.id)
    .order("created_at", { ascending: false });

  if (reviewsError) {
    console.error("PRODUCT REVIEWS LOAD FAILED:", reviewsError);
  }

  const initialReviews = (reviewsData ?? []).map((review) => ({
    id: String(review.id),
    rating: Number(review.rating),
    review_text: String(review.review_text),
    verified_buyer: Boolean(review.verified_buyer),
    created_at: String(review.created_at),
  }));

  const productRating = await getProductRating(typedProduct.id);

  const productSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: typedProduct.name,
    description: typedProduct.description,
    image: [productImage],
    brand: {
      "@type": "Brand",
      name: "MineNote",
    },
    offers: {
      "@type": "Offer",
      url: `https://minenote.in/products/${typedProduct.id}`,
      priceCurrency: "INR",
      price: typedProduct.price,
      availability:
        typedProduct.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  if (
    productRating &&
    productRating.review_count > 0 &&
    productRating.average_review_rating !== null
  ) {
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: productRating.average_review_rating,
      reviewCount: productRating.review_count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  const { data: relatedProductsData, error: relatedProductsError } =
    await supabase
      .from("products")
      .select(
        "id, name, price, description, category, image, stock, active, rating, bestseller, featured, new_arrival, pages, paper, size"
      )
      .eq("active", true)
      .neq("id", typedProduct.id)
      .order("created_at", { ascending: false })
      .limit(3);

  if (relatedProductsError) {
    console.error(
      "RELATED PRODUCTS LOAD FAILED:",
      relatedProductsError
    );
  }

  const relatedProductsBase = (relatedProductsData ?? []) as Product[];

  const relatedRatings = await getProductRatings(
    relatedProductsBase.map((product) => product.id)
  );

  const relatedProducts = relatedProductsBase.map((product) => {
    const rating = relatedRatings[product.id];

    return {
      ...product,
      rating: rating?.effective_rating ?? product.rating,
      review_count: rating?.review_count ?? 0,
    };
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />

      <main className="min-h-screen overflow-x-hidden bg-black px-4 py-16 text-white sm:px-6 sm:py-20 lg:py-24">
        <section className="mx-auto grid max-w-7xl items-start gap-10 md:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-zinc-950 p-4 shadow-2xl shadow-black/20 sm:p-6 lg:p-8">
            {typedProduct.bestseller && (
              <span className="absolute left-5 top-5 z-10 rounded-full bg-yellow-400 px-4 min-h-10 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-black shadow-lg shadow-yellow-400/10 sm:left-6 sm:top-6 sm:px-4 sm:py-2 sm:text-sm">
                🔥 BEST SELLER
              </span>
            )}

            <ProductGallery
              image={typedProduct.image ?? "/images/notebooks/placeholder.png"}
              name={typedProduct.name}
            />
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            {/* Category */}
            <div>
              <span className="inline-flex rounded-full border border-yellow-400/20 bg-yellow-400/[0.07] px-4 min-h-10 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-yellow-400 sm:px-4 sm:py-2 sm:text-[10px]">
                {typedProduct.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="mt-5 text-4xl font-black leading-[1.02] tracking-[-0.045em] text-white sm:mt-6 sm:text-5xl lg:text-6xl">
              {typedProduct.name}
            </h1>

            {/* Rating + availability */}
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-x-4">
              <div className="flex items-center gap-2">
                <span className="text-lg text-yellow-400">
                  ★
                </span>

                <span className="font-semibold text-white">
                  {productRating?.effective_rating?.toFixed(1) ??
                    typedProduct.rating ??
                    "—"}
                </span>

                {productRating && productRating.review_count > 0 && (
                  <span className="text-sm text-zinc-500">
                    ({productRating.review_count}{" "}
                    {productRating.review_count === 1
                      ? "review"
                      : "reviews"})
                  </span>
                )}
              </div>

              <span
                className="hidden h-1 w-1 rounded-full bg-zinc-700 sm:block"
                aria-hidden="true"
              />

              <span
                className={
                  typedProduct.stock > 0
                    ? "text-sm font-medium text-emerald-400"
                    : "text-sm font-medium text-red-400"
                }
              >
                {typedProduct.stock > 0
                  ? "● In stock"
                  : "● Currently unavailable"}
              </span>
            </div>

            {/* Price */}
            <div className="mt-6 border-y border-white/[0.07] py-5 sm:mt-7 sm:py-6">
              <p className="text-3xl font-black tracking-tight text-yellow-400 sm:text-4xl">
                ₹{typedProduct.price}
              </p>

              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-zinc-600">
                Premium MineNote notebook
              </p>
            </div>

            {/* Description */}
            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400 sm:mt-7 sm:text-lg sm:leading-8">
              {typedProduct.description}
            </p>

            {/* Product Specs */}
            <div className="mt-7 sm:mt-8">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                Product details
              </p>

              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 text-center transition duration-300 hover:-translate-y-0.5 hover:border-yellow-400/25 hover:bg-yellow-400/[0.03] sm:p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                  <div className="text-lg" aria-hidden="true">
                    📄
                  </div>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-600">
                    Pages
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {typedProduct.pages}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 text-center transition duration-300 hover:-translate-y-0.5 hover:border-yellow-400/25 hover:bg-yellow-400/[0.03] sm:p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                  <div className="text-lg" aria-hidden="true">
                    📃
                  </div>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-600">
                    Paper
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {typedProduct.paper}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 text-center transition duration-300 hover:-translate-y-0.5 hover:border-yellow-400/25 hover:bg-yellow-400/[0.03] sm:p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                  <div className="text-lg" aria-hidden="true">
                    📐
                  </div>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-600">
                    Size
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {typedProduct.size}
                  </p>
                </div>
              </div>
            </div>

            {/* Shopping Actions */}
            <div className="mt-7 sm:mt-8">
              <AddToCartButton
                product={{
                  id: String(typedProduct.id),
                  name: typedProduct.name,
                  price: typedProduct.price,
                  image:
                    typedProduct.image ??
                    "/images/notebooks/placeholder.png",
                }}
              />

              <div className="mt-3">
                <WishlistButton
                  product={{
                    id: String(typedProduct.id),
                    name: typedProduct.name,
                    price: typedProduct.price,
                    image:
                      typedProduct.image ??
                      "/images/notebooks/placeholder.png",
                  }}
                />
              </div>

              <ShareButton
                productName={typedProduct.name}
              />
            </div>

            {/* Small reassurance */}
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[9px] font-bold uppercase tracking-[0.13em] text-zinc-600 sm:mt-6 sm:text-[10px]">
              <span>Secure checkout</span>
              <span>•</span>
              <span>Carefully packed</span>
              <span>•</span>
              <span>Made for ideas</span>
            </div>
          </div>

        </section>

        {/* Trust */}
        <section className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
          <TrustBadges />
        </section>

        {/* Reviews */}
        <section className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
          <ProductReviews
            productId={typedProduct.id}
            initialReviews={initialReviews}
          />
        </section>

        {/* Related Products */}
        <section className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
          <h2 className="mb-7 text-3xl font-black tracking-tight sm:mb-8 sm:text-4xl">
            You may also{" "}
            <span className="text-yellow-400">
              like
            </span>
          </h2>

          <RelatedProducts
            currentId={typedProduct.id}
            products={relatedProducts}
          />
        </section>
      </main>

      <Footer />
    </>
  );
}
