import Footer from "@/app/components/Footer";

export const metadata = {
  title: "Terms & Conditions",
  description:
    "Read the terms and conditions for using the MineNote website and placing orders.",
};

export default function TermsAndConditionsPage() {
  return (
    <>

      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <article className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold text-yellow-400">
            MineNote — a brand by AuraCraft
          </p>

          <h1 className="mt-4 text-4xl font-extrabold md:text-6xl">
            Terms & Conditions
          </h1>

          <p className="mt-5 text-gray-400">
            By using the MineNote website, you agree to use the service
            responsibly and provide accurate information.
          </p>

          <div className="mt-12 space-y-10 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white">
                Website Use
              </h2>
              <p className="mt-3 leading-8">
                You agree to use the MineNote website only for lawful
                purposes and not to misuse, disrupt, or attempt to gain
                unauthorized access to the website or its systems.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Product Information
              </h2>
              <p className="mt-3 leading-8">
                We make reasonable efforts to display accurate product names,
                descriptions, prices, images, and availability. Product
                appearance may vary slightly depending on screen settings and
                manufacturing or printing characteristics.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Orders
              </h2>
              <p className="mt-3 leading-8">
                Customers are responsible for providing accurate contact and
                delivery information. An order is considered confirmed after
                successful order processing and, where applicable, payment
                verification.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Pricing & Availability
              </h2>
              <p className="mt-3 leading-8">
                Prices and product availability may change without prior
                notice. If an issue affecting an order is identified, MineNote
                may contact the customer regarding the available resolution.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Intellectual Property
              </h2>
              <p className="mt-3 leading-8">
                MineNote branding, website content, designs, graphics, text,
                and other original materials are protected by applicable
                intellectual-property laws and may not be reproduced or used
                without appropriate permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Policy Documents
              </h2>
              <p className="mt-3 leading-8">
                Our Shipping Policy and Return & Refund Policy form part of
                the terms applicable to purchases made through the website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Contact
              </h2>
              <p className="mt-3 leading-8">
                For questions regarding these terms, please contact MineNote
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
