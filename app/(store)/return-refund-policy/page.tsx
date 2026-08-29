import Footer from "@/app/components/Footer";

export const metadata = {
  title: "Return & Refund Policy",
  description:
    "Learn about MineNote cancellations, damaged products, incorrect items, returns, and refunds.",
};

export default function ReturnRefundPolicyPage() {
  return (
    <>

      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <article className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold text-yellow-400">
            MineNote — a brand by AuraCraft
          </p>

          <h1 className="mt-4 text-4xl font-extrabold md:text-6xl">
            Return & Refund Policy
          </h1>

          <p className="mt-5 text-gray-400">
            We want every MineNote order to arrive as expected.
          </p>

          <div className="mt-12 space-y-10 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white">
                Order Cancellation
              </h2>
              <p className="mt-3 leading-8">
                Cancellation requests may be made before an order enters
                processing. Once an order has entered processing or has been
                shipped, cancellation may no longer be possible.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Damaged Products
              </h2>
              <p className="mt-3 leading-8">
                If your notebook arrives damaged, please contact us within
                48 hours of delivery with your order details and clear
                photographs or video showing the damage. We will review the
                claim and, after verification, may provide a replacement or
                refund as appropriate.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Incorrect Product
              </h2>
              <p className="mt-3 leading-8">
                If you receive an item different from what you ordered, please
                contact us within 48 hours of delivery with your order details
                and clear photographs or video of the received product. After
                verification, we may arrange a replacement or refund as
                appropriate.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Change of Mind
              </h2>
              <p className="mt-3 leading-8">
                We currently do not accept returns or refunds solely because a
                customer has changed their mind or no longer wants the
                product.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Refund Processing
              </h2>
              <p className="mt-3 leading-8">
                Where a refund is approved, it is generally processed within
                5–7 working days. For online payments, refunds may be processed
                through the applicable payment method. For Cash on Delivery
                orders, an approved refund may be processed through UPI or
                bank transfer using details provided by the customer.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Claim Verification
              </h2>
              <p className="mt-3 leading-8">
                Submitting a return or refund request does not automatically
                guarantee approval. MineNote may review the order details,
                photographs, video, and other relevant information before
                determining the appropriate resolution.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Contact Us
              </h2>
              <p className="mt-3 leading-8">
                Please contact MineNote through our Contact page for
                cancellation, damaged-product, incorrect-product, or refund
                requests.
              </p>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
