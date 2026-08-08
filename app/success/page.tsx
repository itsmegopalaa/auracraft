"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "../components/Footer";

type OrderItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type Order = {
  orderId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  payment: string;
  items: OrderItem[];
  total: number;
  delivery: string;
};

export default function SuccessPage() {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem(
      "auracraft_last_order"
    );

    if (savedOrder) {
      setOrder(JSON.parse(savedOrder));
    }
  }, []);

  if (!order) {
    return (
      <main className="min-h-screen bg-black px-6 py-24 text-white">
        <div className="mx-auto max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center">
          <div className="text-6xl">🧾</div>

          <h1 className="mt-6 text-3xl font-bold">
            Order Details Not Found
          </h1>

          <p className="mt-4 text-gray-400">
            We couldn't find a recent AuraCraft order on this device.
          </p>

          <Link
            href="/products"
            className="mt-8 inline-block rounded-full bg-yellow-400 px-8 py-4 font-bold text-black transition hover:scale-105"
          >
            Explore Products →
          </Link>
        </div>

        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-4xl">

        {/* Confirmation */}
        <div className="rounded-3xl border border-yellow-400/30 bg-zinc-900 p-8 text-center shadow-2xl md:p-12">

          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-yellow-400 text-5xl font-bold text-black">
            ✓
          </div>

          <h1 className="mt-7 text-4xl font-extrabold md:text-5xl">
            Order Confirmed 🎉
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-gray-400">
            Thank you for choosing{" "}
            <span className="font-bold text-yellow-400">
              AuraCraft
            </span>
            . Your premium notebook order has been received.
          </p>

          <div className="mt-6 inline-block rounded-full border border-yellow-400/30 bg-black px-6 py-3">
            <span className="text-sm text-gray-400">
              Order ID
            </span>
            <span className="ml-2 font-bold text-yellow-400">
              {order.orderId}
            </span>
          </div>
        </div>

        {/* Order Details */}
        <div className="mt-8 grid gap-8 md:grid-cols-2">

          {/* Products */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-7">

            <h2 className="text-2xl font-bold">
              Your Order 📦
            </h2>

            <div className="mt-6 space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-black p-4"
                >
                  <div>
                    <p className="font-semibold">
                      {item.name}
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>

                  <p className="font-bold text-yellow-400">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>

            <div className="my-6 border-t border-zinc-700" />

            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>

              <span className="text-yellow-400">
                ₹{order.total}
              </span>
            </div>
          </div>

          {/* Delivery */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-7">

            <h2 className="text-2xl font-bold">
              Delivery Details 🚚
            </h2>

            <div className="mt-6 space-y-4 text-gray-300">

              <div>
                <p className="text-sm text-gray-500">
                  Customer
                </p>
                <p className="font-semibold">
                  {order.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Phone
                </p>
                <p className="font-semibold">
                  {order.phone}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Email
                </p>
                <p className="break-all font-semibold">
                  {order.email}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Delivery Address
                </p>
                <p className="font-semibold leading-relaxed">
                  {order.address}
                  <br />
                  {order.city}, {order.state} - {order.pin}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Payment
                </p>

                <p className="font-semibold">
                  {order.payment === "COD"
                    ? "💵 Cash on Delivery"
                    : order.payment}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Estimated Delivery
                </p>

                <p className="font-semibold text-yellow-400">
                  {order.delivery}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-7">

          <h2 className="text-2xl font-bold">
            What's Next? ✨
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">

            <div className="rounded-2xl bg-black p-5">
              <div className="text-3xl">📋</div>
              <h3 className="mt-3 font-bold">
                Order Received
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                We've received your order details.
              </p>
            </div>

            <div className="rounded-2xl bg-black p-5">
              <div className="text-3xl">📦</div>
              <h3 className="mt-3 font-bold">
                Preparing
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Your notebooks will be carefully packed.
              </p>
            </div>

            <div className="rounded-2xl bg-black p-5">
              <div className="text-3xl">🚚</div>
              <h3 className="mt-3 font-bold">
                Delivery
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Expected within {order.delivery}.
              </p>
            </div>

          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">

          <Link
            href="/products"
            className="rounded-full bg-yellow-400 py-4 text-center font-bold text-black transition hover:scale-[1.02]"
          >
            Explore More Designs →
          </Link>

          <Link
            href="/"
            className="rounded-full border border-zinc-700 bg-zinc-900 py-4 text-center font-bold text-white transition hover:border-yellow-400"
          >
            Back to Home
          </Link>

        </div>

      </div>

      <Footer />
    </main>
  );
}