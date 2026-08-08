import ProductGallery from "../../components/products/ProductGallery";
import { notebooks } from "../../data/notebooks";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "./WishlistButton";
import ShareButton from "./ShareButton";
import RelatedProducts from "../../components/products/RelatedProducts";
import ProductReviews from "../../components/products/ProductReviews";
import TrustBadges from "../../components/TrustBadges";
import Reviews from "./Reviews";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params;

  const product = notebooks.find(
    (book) => book.id === Number(id)
  );


  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Product not found
      </div>
    );
  }


  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black text-white px-6 py-24">

        <section className="
          mx-auto max-w-7xl
          grid md:grid-cols-2
          gap-16 items-center
        ">


          {/* Gallery */}

          <div className="
            relative overflow-hidden
            rounded-3xl
            border border-zinc-800
            bg-zinc-900
            p-8
          ">

            {product.bestseller && (
              <span className="
                absolute top-6 left-6 z-10
                rounded-full
                bg-yellow-400
                px-4 py-2
                text-sm font-bold
                text-black
              ">
                🔥 BEST SELLER
              </span>
            )}


            <ProductGallery
              image={product.image}
              name={product.name}
            />

          </div>



          {/* Details */}

          <div>

            <span className="
              inline-block
              rounded-full
              bg-zinc-800
              px-5 py-2
              text-yellow-400
            ">
              {product.category}
            </span>


            <h1 className="
              mt-6
              text-5xl
              md:text-6xl
              font-extrabold
            ">
              {product.name}
            </h1>


            <p className="mt-5 text-yellow-400 text-2xl">
              ⭐ {product.rating}
            </p>


            <p className="
              mt-6
              text-4xl
              font-extrabold
              text-yellow-400
            ">
              ₹{product.price}
            </p>


            <p className="
              mt-8
              text-lg
              leading-8
              text-gray-400
            ">
              {product.description}
            </p>


            <div className="
              mt-8
              grid
              grid-cols-3
              gap-4
            ">

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-center">
                📄
                <p className="text-sm text-gray-400">
                  Pages
                </p>
                <b>{product.pages}</b>
              </div>


              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-center">
                📃
                <p className="text-sm text-gray-400">
                  Paper
                </p>
                <b>{product.paper}</b>
              </div>


              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-center">
                📐
                <p className="text-sm text-gray-400">
                  Size
                </p>
                <b>{product.size}</b>
              </div>

            </div>


           <AddToCartButton
  product={{
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
  }}
/>




<ShareButton productName={product.name} />

<TrustBadges />
<ShareButton productName={product.name} />
<TrustBadges />


 
          </div>

        </section>


<section className="mx-auto max-w-7xl px-6 py-24">
  <ProductReviews />
</section>

<section className="mx-auto max-w-7xl px-6 pb-24">
  <RelatedProducts
    currentId={product.id}
    category={product.category}
  />
</section>

</main>

<Footer />
    </>
  );
}