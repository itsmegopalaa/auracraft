"use client";

import { useState } from "react";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCart } from "@/app/context/CartContext";
import RazorpayCheckout from "@/app/components/RazorpayCheckout";

export default function CheckoutPage() {
  const { cart } = useCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pin, setPin] = useState("");
  const [payment, setPayment] = useState("COD");
  const [loading, setLoading] = useState(false);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const validateDetails = () => {
    if (
      !name.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !address.trim() ||
      !city.trim() ||
      !state.trim() ||
      !pin.trim()
    ) {
      toast.error("Please fill all required fields.");
      return false;
    }

    if (!/^\d{10}$/.test(phone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    if (!/^\d{6}$/.test(pin)) {
      toast.error("Please enter a valid 6-digit PIN code.");
      return false;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return false;
    }

    return true;
  };

  const saveOrderToDatabase = async ({
    orderId,
    paymentMethod,
    paymentStatus,
    orderStatus,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  }: {
    orderId: string;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    razorpayOrderId?: string | null;
    razorpayPaymentId?: string | null;
    razorpaySignature?: string | null;
  }) => {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pin: pin.trim(),
        paymentMethod,
        paymentStatus,
        orderStatus,
        items: cart,
        customCoverId:
          cart.find((item) => item.customCoverId)?.customCoverId ?? null,
        total,
        razorpayOrderId: razorpayOrderId || null,
        razorpayPaymentId: razorpayPaymentId || null,
        razorpaySignature: razorpaySignature || null,
        delivery: "3-5 Working Days",
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error("ORDER SAVE FAILED:", result);
      throw new Error(result.error || "Unable to save order.");
    }

    return result.order;
  };

  const handlePlaceOrder = async () => {
    if (!validateDetails()) return;

    setLoading(true);

    try {
      const orderId = `MN${Date.now().toString().slice(-8)}`;

      const savedOrder = await saveOrderToDatabase({
        orderId,
        paymentMethod: "COD",
        paymentStatus: "pending",
        orderStatus: "placed",
      });

      const order = {
        orderId,
        name,
        phone,
        email,
        address,
        city,
        state,
        pin,
        payment: "COD",
        items: cart,
        total,
        delivery: "3-5 Working Days",
        databaseOrderId: savedOrder.id,
      };

      localStorage.setItem(
        "auracraft_last_order",
        JSON.stringify(order)
      );

      toast.success("Order placed successfully!");

      setTimeout(() => {
        router.push("/success");
      }, 700);
    } catch (error) {
      console.error("COD ORDER ERROR:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to place order."
      );
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <>
        <main className="flex min-h-screen items-center justify-center bg-[var(--mn-bg)] px-4 py-16 text-[var(--mn-text)] sm:px-6 sm:py-[clamp(5rem,8vw,7rem)]">
          <div className="w-full max-w-md rounded-[2rem] border border-[var(--mn-border)] bg-[var(--mn-surface)] p-6 text-center shadow-[var(--mn-shadow-lg)] sm:p-10">
            <div className="mb-5 text-5xl sm:mb-6 sm:text-6xl">🛒</div>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--mn-accent)]">
              Checkout
            </p>

            <h1 className="mt-3 text-3xl font-black">
              Your cart is empty
            </h1>

            <p className="mt-4 leading-7 text-[var(--mn-text-muted)]">
              Add a few MineNote notebooks before continuing to checkout.
            </p>

            <Link
              href="/products"
              className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[var(--mn-accent)] px-6 py-3.5 font-black text-[var(--mn-accent-contrast)] transition-all hover:-translate-y-0.5 hover:bg-[var(--mn-accent-hover)] sm:mt-8 sm:px-8 sm:py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
            >
              Explore Products →
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="min-h-screen overflow-x-hidden bg-[var(--mn-bg)] px-4 py-14 text-[var(--mn-text)] sm:px-6 sm:py-20 md:py-24">
        <div className="mx-auto w-full max-w-6xl">
          {/* Header */}
          <header className="mb-8 max-w-3xl sm:mb-10">
            <div className="mb-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--mn-accent)] sm:mb-5 sm:text-xs sm:tracking-[0.2em]">
              <span className="h-px w-8 bg-[var(--mn-accent)]" />
              Secure Checkout
            </div>

            <h1 className="mn-h2 sm:text-5xl md:text-6xl">
              Complete Your{" "}
              <span className="text-[var(--mn-accent)]">Order</span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--mn-text-secondary)] sm:mt-4 sm:text-lg sm:leading-7">
              Enter your delivery details and choose how you&apos;d like to
              pay. Your MineNote order is just a few steps away. ✨
            </p>

            {/* Checkout progress */}
            <div className="mt-7 flex w-full max-w-full items-center justify-between gap-2 overflow-hidden text-[11px] font-semibold text-[var(--mn-text-secondary)] sm:mt-8 sm:justify-start sm:gap-3 sm:text-sm">
              <span className="flex items-center gap-2 text-[var(--mn-accent)]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--mn-accent)] font-black text-[var(--mn-accent-contrast)]">
                  1
                </span>
                Details
              </span>

              <span className="h-px min-w-5 flex-1 bg-[var(--mn-text-muted)] sm:w-14 sm:min-w-0 sm:flex-none" />

              <span className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--mn-text-muted)]">
                  2
                </span>
                Payment
              </span>

              <span className="h-px min-w-5 flex-1 bg-[var(--mn-text-muted)] sm:w-14 sm:min-w-0 sm:flex-none" />

              <span className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--mn-text-muted)]">
                  3
                </span>
                Confirmation
              </span>
            </div>
          </header>

          <div className="grid items-start gap-5 sm:gap-7 lg:gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            {/* Delivery details */}
            <section className="rounded-[1.5rem] border border-[var(--mn-border-strong)] bg-[var(--mn-surface-soft)] p-5 shadow-[var(--mn-shadow-lg)] ring-1 ring-[var(--mn-border)] sm:rounded-[1.75rem] lg:rounded-[2rem] sm:p-7 lg:p-8">
              <div className="mb-6 sm:mb-8">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--mn-text-secondary)]">
                  Step 1
                </p>

                <h2 className="text-xl font-black sm:text-3xl">
                  Delivery Details 📦
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--mn-text-secondary)]">
                  Where should we send your MineNote?
                </p>
              </div>

              <div className="space-y-3.5 sm:space-y-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  autoComplete="name"
                  className="w-full min-h-12 rounded-2xl border border-[var(--mn-border-strong)] bg-[var(--mn-surface)] px-4 py-3.5 text-[var(--mn-text)] outline-none transition placeholder:text-[var(--mn-text-muted)] focus:border-[var(--mn-accent)] focus:bg-[var(--mn-surface-soft)] focus:ring-2 focus:ring-[var(--mn-accent-soft)] sm:px-5 sm:py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
                />

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  className="w-full min-h-12 rounded-2xl border border-[var(--mn-border-strong)] bg-[var(--mn-surface)] px-4 py-3.5 text-[var(--mn-text)] outline-none transition placeholder:text-[var(--mn-text-muted)] focus:border-[var(--mn-accent)] focus:bg-[var(--mn-surface-soft)] focus:ring-2 focus:ring-[var(--mn-accent-soft)] sm:px-5 sm:py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  autoComplete="email"
                  className="w-full min-h-12 rounded-2xl border border-[var(--mn-border-strong)] bg-[var(--mn-surface)] px-4 py-3.5 text-[var(--mn-text)] outline-none transition placeholder:text-[var(--mn-text-muted)] focus:border-[var(--mn-accent)] focus:bg-[var(--mn-surface-soft)] focus:ring-2 focus:ring-[var(--mn-accent-soft)] sm:px-5 sm:py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
                />

                <textarea
                  placeholder="Complete Delivery Address"
                  rows={5}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  autoComplete="street-address"
                  className="min-h-28 w-full resize-none rounded-2xl border border-[var(--mn-border-strong)] bg-[var(--mn-surface)] px-4 py-3.5 text-[var(--mn-text)] outline-none transition placeholder:text-[var(--mn-text-muted)] focus:border-[var(--mn-accent)] focus:bg-[var(--mn-surface-soft)] focus:ring-2 focus:ring-[var(--mn-accent-soft)] sm:px-5 sm:py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
                />

                <div className="grid gap-3.5 sm:gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    autoComplete="address-level2"
                    className="w-full min-h-12 rounded-2xl border border-[var(--mn-border-strong)] bg-[var(--mn-surface)] px-4 py-3.5 text-[var(--mn-text)] outline-none transition placeholder:text-[var(--mn-text-muted)] focus:border-[var(--mn-accent)] focus:bg-[var(--mn-surface-soft)] focus:ring-2 focus:ring-[var(--mn-accent-soft)] sm:px-5 sm:py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
                  />

                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    autoComplete="address-level1"
                    className="w-full min-h-12 rounded-2xl border border-[var(--mn-border-strong)] bg-[var(--mn-surface)] px-4 py-3.5 text-[var(--mn-text)] outline-none transition placeholder:text-[var(--mn-text-muted)] focus:border-[var(--mn-accent)] focus:bg-[var(--mn-surface-soft)] focus:ring-2 focus:ring-[var(--mn-accent-soft)] sm:px-5 sm:py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
                  />
                </div>

                <input
                  type="text"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="PIN Code"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={6}
                  className="w-full min-h-12 rounded-2xl border border-[var(--mn-border-strong)] bg-[var(--mn-surface)] px-4 py-3.5 text-[var(--mn-text)] outline-none transition placeholder:text-[var(--mn-text-muted)] focus:border-[var(--mn-accent)] focus:bg-[var(--mn-surface-soft)] focus:ring-2 focus:ring-[var(--mn-accent-soft)] sm:px-5 sm:py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
                />

                <div className="rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-4 shadow-inner shadow-[var(--mn-shadow-sm)] sm:p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">📦</span>

                    <div>
                      <p className="text-sm font-bold text-[var(--mn-text-secondary)]">
                        Estimated delivery
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[var(--mn-text-secondary)]">
                        3–5 working days • Carefully packed by MineNote
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Order summary */}
            <aside className="lg:sticky lg:top-24">
              <div className="rounded-[1.5rem] border border-[var(--mn-accent)] bg-[var(--mn-surface-soft)] p-5 shadow-[var(--mn-shadow-lg)] ring-1 ring-[var(--mn-border)] sm:rounded-[1.75rem] lg:rounded-[2rem] sm:p-7 lg:p-8">
                <div className="mb-6 sm:mb-8">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--mn-text-secondary)]">
                    Your Order
                  </p>

                  <h2 className="text-xl font-black sm:text-3xl">
                    Order Summary 🛒
                  </h2>
                </div>

                {/* Items */}
                <div className="space-y-3.5 sm:space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--mn-text-secondary)]">
                          {item.name}
                        </p>

                        <p className="mt-1 text-sm text-[var(--mn-text-secondary)]">
                          Quantity × {item.quantity}
                        </p>
                      </div>

                      <span className="shrink-0 font-bold text-[var(--mn-text)]">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="my-6 border-t border-[var(--mn-border-strong)] sm:my-7" />

                {/* Price breakdown */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-[var(--mn-text-secondary)]">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[var(--mn-text)]">₹{total}</span>
                  </div>

                  <div className="flex justify-between text-[var(--mn-text-secondary)]">
                    <span>Delivery</span>
                    <span className="font-semibold text-[var(--mn-success)]">
                      FREE
                    </span>
                  </div>

                  <div className="flex justify-between text-[var(--mn-text-secondary)]">
                    <span>Premium packaging</span>
                    <span className="font-semibold text-[var(--mn-success)]">
                      FREE
                    </span>
                  </div>
                </div>

                <div className="my-6 border-t border-[var(--mn-border-strong)] sm:my-7" />

                {/* Total */}
                <div className="flex items-end justify-between gap-4">
                  <span className="text-lg font-bold text-[var(--mn-text)]">
                    Total
                  </span>

                  <span className="text-2xl font-black text-[var(--mn-accent)] sm:text-3xl">
                    ₹{total}
                  </span>
                </div>

                {/* Payment */}
                <div className="mt-8 sm:mt-9">
                  <div className="mb-5">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--mn-text-secondary)]">
                      Step 2
                    </p>

                    <h3 className="text-2xl font-black">
                      Payment Method
                    </h3>
                  </div>

                  <div className="space-y-2.5 sm:space-y-3">
                    {[
                      {
                        id: "COD",
                        icon: "💵",
                        label: "Cash on Delivery",
                        description: "Pay when your order arrives",
                      },
                      {
                        id: "ONLINE",
                        icon: "💳",
                        label: "UPI / Card",
                        description: "Secure payment via Razorpay",
                      },
                    ].map((method) => {
                      const selected = payment === method.id;

                      return (
                        <label
                          key={method.id}
                          className={`flex min-h-[72px] cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all ${
                            selected
                              ? "border-[var(--mn-accent)] bg-[var(--mn-accent-soft)] shadow-[var(--mn-shadow-sm)]"
                              : "border-[var(--mn-border-strong)] bg-[var(--mn-surface)] hover:border-[var(--mn-accent)] hover:bg-[var(--mn-control-hover)]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={method.id}
                            checked={selected}
                            onChange={() => setPayment(method.id)}
                            className="h-4 w-4 accent-[var(--mn-accent)]"
                          />

                          <span className="text-xl">
                            {method.icon}
                          </span>

                          <span className="min-w-0">
                            <span className="block font-bold text-[var(--mn-text-secondary)]">
                              {method.label}
                            </span>

                            <span className="mt-1 block text-xs text-[var(--mn-text-secondary)]">
                              {method.description}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Trust */}
                  <div className="mt-4 rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-4 sm:mt-5">
                    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[var(--mn-text-secondary)]">
                      <span>🔒</span>
                      <span>Secure checkout</span>
                      <span className="text-[var(--mn-text-muted)]">•</span>
                      <span>Protected payment</span>
                    </div>

                    <p className="mt-2 text-center text-[11px] leading-5 text-[var(--mn-text-secondary)]">
                      Online payments are securely processed and verified
                      through Razorpay.
                    </p>
                  </div>

                  {/* Checkout action */}
                  {payment === "COD" ? (
                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="mt-5 min-h-12 w-full rounded-2xl bg-[var(--mn-accent)] py-3.5 font-black text-[var(--mn-accent-contrast)] shadow-[var(--mn-shadow-sm)] transition-all hover:-translate-y-0.5 hover:bg-[var(--mn-accent-hover)] hover:shadow-[var(--mn-shadow-sm)] disabled:cursor-not-allowed disabled:opacity-50 sm:mt-6 sm:py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
                    >
                      {loading
                        ? "Saving Order..."
                        : "Place Order →"}
                    </button>
                  ) : (
                    <div
                      onClickCapture={(event) => {
                        if (!validateDetails()) {
                          event.preventDefault();
                          event.stopPropagation();
                        }
                      }}
                    >
                      <RazorpayCheckout
                        amount={total}
                        name={name}
                        email={email}
                        phone={phone}
                        items={cart}
                        onSuccess={async (
                          paymentResponse,
                          mineNoteOrderId
                        ) => {
                          try {
                            setLoading(true);

                            const orderId = mineNoteOrderId;

                            const savedOrder =
                              await saveOrderToDatabase({
                                orderId,
                                paymentMethod: "Razorpay",
                                paymentStatus: "paid",
                                orderStatus: "confirmed",
                                razorpayPaymentId:
                                  paymentResponse.razorpay_payment_id,
                                razorpaySignature:
                                  paymentResponse.razorpay_signature,
                                razorpayOrderId:
                                  paymentResponse.razorpay_order_id,
                              });

                            const order = {
                              orderId,
                              name,
                              phone,
                              email,
                              address,
                              city,
                              state,
                              pin,
                              payment: "Razorpay",
                              items: cart,
                              total,
                              delivery: "3-5 Working Days",
                              databaseOrderId: savedOrder.id,
                              razorpayPaymentId:
                                paymentResponse.razorpay_payment_id,
                              razorpayOrderId:
                                paymentResponse.razorpay_order_id,
                            };

                            localStorage.setItem(
                              "auracraft_last_order",
                              JSON.stringify(order)
                            );

                            toast.success(
                              "Payment successful! Order confirmed."
                            );

                            router.push("/success");
                          } catch (error) {
                            console.error(
                              "ONLINE ORDER SAVE ERROR:",
                              error
                            );

                            toast.error(
                              error instanceof Error
                                ? error.message
                                : "Payment succeeded but order saving failed."
                            );
                          } finally {
                            setLoading(false);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
