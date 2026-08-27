import Footer from "@/app/components/Footer";

export const metadata = {
  title: "Shipping Policy",
  description:
    "Learn about MineNote shipping, delivery timelines, and order dispatch information.",
};

export default function ShippingPolicyPage() {
  return (
    <>

      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <article className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold text-yellow-400">
            MineNote — a brand by AuraCraft
          </p>

          <h1 className="mt-4 text-4xl font-extrabold md:text-6xl">
            Shipping Policy
          </h1>

          <p className="mt-5 text-gray-400">
            We want your MineNote order to reach you safely and on time.
          </p>

          <div className="mt-12 space-y-10 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white">
                Delivery Timeline
              </h2>
              <p className="mt-3 leading-8">
                Orders are generally delivered within 3–5 working days after
                successful order confirmation. Delivery timelines may vary
                depending on the destination, courier operations, weather,
                holidays, or other circumstances outside our control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Order Processing
              </h2>
              <p className="mt-3 leading-8">
                Orders are processed after successful confirmation. Orders
                placed using online payment are processed after payment
                verification. Cash on Delivery orders are processed after
                confirmation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Shipping Updates
              </h2>
              <p className="mt-3 leading-8">
                Once an order is shipped, available tracking information may
                be provided through your order details or other customer
                communication from MineNote.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Delivery Delays
              </h2>
              <p className="mt-3 leading-8">
                Delivery may occasionally take longer than the estimated
                timeline because of courier delays, incorrect or incomplete
                address information, public holidays, weather conditions,
                or other unforeseen circumstances.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Incorrect Address
              </h2>
              <p className="mt-3 leading-8">
                Customers are responsible for providing accurate delivery
                information during checkout. Please contact us as soon as
                possible if you notice an error in your shipping details.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Contact
              </h2>
              <p className="mt-3 leading-8">
                For shipping-related questions, please contact MineNote
                through our Contact page.
              </p>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
