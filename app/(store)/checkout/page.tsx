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

  const handleOnlinePaymentClick = () => {
    if (!validateDetails()) return;
  };

  if (cart.length === 0) {
    return (
      <>

        <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
          <div className="max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center">
            <div className="mb-6 text-6xl">🛒</div>

            <h1 className="text-3xl font-bold">
              Your cart is empty
            </h1>

            <p className="mt-4 text-gray-400">
              Add some premium notebooks before proceeding to checkout.
            </p>

            <Link
              href="/products"
              className="mt-8 inline-block rounded-full bg-yellow-400 px-8 py-4 font-bold text-black transition hover:scale-105"
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

      <main className="min-h-screen bg-black px-6 py-24 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-4 text-5xl font-extrabold md:text-6xl">
            Complete Your{" "}
            <span className="text-yellow-400">Order</span>
          </h1>

          <p className="mb-12 text-lg text-gray-400">
            Premium notebooks delivered to your doorstep ✨
          </p>

          <div className="grid gap-10 md:grid-cols-2">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <h2 className="mb-8 text-3xl font-bold">
                Delivery Details 📦
              </h2>

              <div className="space-y-5">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full rounded-2xl border border-zinc-700 bg-black p-4 outline-none focus:border-yellow-400"
                />

                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full rounded-2xl border border-zinc-700 bg-black p-4 outline-none focus:border-yellow-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full rounded-2xl border border-zinc-700 bg-black p-4 outline-none focus:border-yellow-400"
                />

                <textarea
                  placeholder="Complete Delivery Address"
                  rows={5}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-700 bg-black p-4 outline-none focus:border-yellow-400"
                />

                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full rounded-2xl border border-zinc-700 bg-black p-4 outline-none focus:border-yellow-400"
                />

                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  className="w-full rounded-2xl border border-zinc-700 bg-black p-4 outline-none focus:border-yellow-400"
                />

                <input
                  type="text"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="PIN Code"
                  className="w-full rounded-2xl border border-zinc-700 bg-black p-4 outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-yellow-400/30 bg-zinc-900 p-8">
              <h2 className="mb-8 text-3xl font-bold">
                Order Summary 🛒
              </h2>

              <div className="space-y-5">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-4 text-gray-300"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>

                    <span className="font-semibold text-white">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="my-8 border-t border-zinc-700" />

              <div className="flex justify-between text-3xl font-bold">
                <span>Total</span>

                <span className="text-yellow-400">
                  ₹{total}
                </span>
              </div>

              <div className="mt-8">
                <h3 className="mb-5 text-2xl font-bold">
                  Payment Method
                </h3>

                <div className="space-y-4">
                  {[
                    {
                      id: "COD",
                      label: "💵 Cash on Delivery",
                    },
                    {
                      id: "ONLINE",
                      label: "💳 UPI / Credit / Debit Card",
                    },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${
                        payment === method.id
                          ? "border-yellow-400 bg-zinc-900"
                          : "border-zinc-700 bg-black hover:border-yellow-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={payment === method.id}
                        onChange={() => setPayment(method.id)}
                      />

                      <span className="font-semibold">
                        {method.label}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="mt-6 text-center text-sm text-gray-400">
                  🔒 Secure checkout • Payment verified by Razorpay
                </div>

                {payment === "COD" ? (
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="mt-8 w-full rounded-full bg-yellow-400 py-4 font-bold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? "Saving Order..."
                      : "Place Order →"}
                  </button>
                ) : (
                  <div onClick={handleOnlinePaymentClick}>
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

    const savedOrder = await saveOrderToDatabase({
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
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}