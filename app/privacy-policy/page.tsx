import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Learn how MineNote handles customer information and order data.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <article className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold text-yellow-400">
            MineNote — a brand by AuraCraft
          </p>

          <h1 className="mt-4 text-4xl font-extrabold md:text-6xl">
            Privacy Policy
          </h1>

          <p className="mt-5 text-gray-400">
            Your information is used to provide and improve the MineNote
            shopping experience.
          </p>

          <div className="mt-12 space-y-10 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white">
                Information We Collect
              </h2>
              <p className="mt-3 leading-8">
                When you place an order or use relevant features of our
                website, we may collect information such as your name, email
                address, phone number, delivery address, order details, and
                payment-related identifiers necessary to process your order.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                How We Use Information
              </h2>
              <p className="mt-3 leading-8">
                Information may be used to process orders, provide customer
                support, communicate order updates, manage payments, prevent
                misuse, maintain account functionality, and improve our
                services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Payment Information
              </h2>
              <p className="mt-3 leading-8">
                Online payments are processed through Razorpay. MineNote does
                not need to directly store your complete card or UPI
                credentials to process an order.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Service Providers
              </h2>
              <p className="mt-3 leading-8">
                We may use trusted technology and service providers to operate
                our website, process payments, store order information, and
                send transactional communications.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Data Security
              </h2>
              <p className="mt-3 leading-8">
                We take reasonable measures to protect customer information.
                However, no internet-based service can guarantee absolute
                security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Contact
              </h2>
              <p className="mt-3 leading-8">
                If you have questions about privacy or your information,
                please contact MineNote through our Contact page.
              </p>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
