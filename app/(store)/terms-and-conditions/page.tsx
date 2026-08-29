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
            By using the MineNote website or placing an order, you agree to
            these terms and the policies applicable to your purchase.
          </p>

          <div className="mt-12 space-y-10 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white">
                Website & Account Use
              </h2>
              <p className="mt-3 leading-8">
                You agree to use the MineNote website only for lawful purposes
                and not to misuse, disrupt, damage, or attempt to gain
                unauthorized access to the website, accounts, or systems.
                Customers are responsible for keeping information provided to
                MineNote accurate and up to date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Products & Product Information
              </h2>
              <p className="mt-3 leading-8">
                We make reasonable efforts to display accurate product names,
                descriptions, prices, images, and availability. Product
                colours and appearance may vary slightly depending on screen
                settings, lighting, printing, or manufacturing characteristics.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Orders & Confirmation
              </h2>
              <p className="mt-3 leading-8">
                Customers are responsible for providing accurate name, phone
                number, email address, and delivery information. An order is
                considered confirmed after successful order processing and,
                where applicable, payment verification. MineNote may contact
                the customer if additional information or clarification is
                required to process an order.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Payment
              </h2>
              <p className="mt-3 leading-8">
                MineNote may offer Cash on Delivery and online payment
                options, including payments processed through Razorpay.
                Online payments are subject to successful payment
                verification. A failed, incomplete, or unverified payment does
                not constitute a successfully paid order.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Order Cancellation
              </h2>
              <p className="mt-3 leading-8">
                Cancellation requests may be made before an order enters
                processing. Cancellation is subject to the current status of
                the order and cannot be guaranteed once processing has begun.
                Once an order has been shipped, cancellation is no longer
                available. Approved cancellations and any applicable refunds
                will be handled according to the Return & Refund Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Shipping & Delivery
              </h2>
              <p className="mt-3 leading-8">
                Orders are generally delivered within 3–5 working days after
                successful order confirmation. Delivery timelines are
                estimates and may vary because of courier operations, public
                holidays, weather, incorrect or incomplete address
                information, or circumstances outside MineNote's reasonable
                control. Please refer to our Shipping Policy for further
                information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Returns, Damage & Refunds
              </h2>
              <p className="mt-3 leading-8">
                Returns and refunds are handled according to our Return &
                Refund Policy. Customers should report damaged or incorrect
                products within the applicable reporting period and provide
                the requested order details and evidence. A request does not
                automatically guarantee approval; MineNote may verify the
                circumstances before determining the appropriate resolution.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Pricing & Availability
              </h2>
              <p className="mt-3 leading-8">
                Product prices and availability may change from time to time.
                If an error affecting an order is identified, MineNote may
                contact the customer and provide an appropriate resolution,
                including cancellation where necessary.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Intellectual Property
              </h2>
              <p className="mt-3 leading-8">
                MineNote branding, website content, product designs, graphics,
                text, images, and other original materials belong to MineNote
                or their respective rights holders and may not be reproduced,
                copied, modified, distributed, or used without appropriate
                permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Prohibited Use
              </h2>
              <p className="mt-3 leading-8">
                You must not use the website to commit unlawful activity,
                interfere with website functionality, attempt unauthorized
                access, submit malicious content, abuse payment or ordering
                systems, or otherwise interfere with the normal operation of
                MineNote.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Policy Documents
              </h2>
              <p className="mt-3 leading-8">
                Our Shipping Policy, Return & Refund Policy, and Privacy Policy
                provide additional information about purchases, delivery,
                refunds, and handling of customer information. These policies
                should be read together with these Terms & Conditions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Changes to These Terms
              </h2>
              <p className="mt-3 leading-8">
                MineNote may update these terms from time to time to reflect
                changes to our services, policies, or operations. The version
                published on the website will apply to future use of the
                website and future orders.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">
                Contact
              </h2>
              <p className="mt-3 leading-8">
                For questions regarding these terms, orders, cancellations,
                shipping, or refunds, please contact MineNote through our
                Contact page.
              </p>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
