import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { Toaster } from "react-hot-toast";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AuraCraft | Premium Notebooks & Creative Designs",
    template: "%s | AuraCraft",
  },

  description:
    "AuraCraft creates premium notebooks with unique designs, quality paper, and creative styles made for students, creators, and dreamers.",

  keywords: [
    "AuraCraft",
    "premium notebooks",
    "designer notebooks",
    "A4 notebooks",
    "anime notebooks",
    "creative stationery",
    "custom notebooks",
  ],

  authors: [
    {
      name: "AuraCraft",
    },
  ],

  creator: "AuraCraft",

  openGraph: {
    title: "AuraCraft | Premium Creative Notebooks",
    description:
      "Discover premium notebooks designed for creativity, learning, and imagination.",
    type: "website",
    siteName: "AuraCraft",
  },

  twitter: {
    card: "summary_large_image",
    title: "AuraCraft | Premium Creative Notebooks",
    description:
      "Premium notebooks with unique designs and quality craftsmanship.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <html
    lang="en"
    className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
  >
    <body>
      <CartProvider>
        <WishlistProvider>

          {children}

          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#18181b",
                color: "#ffffff",
                border: "1px solid #facc15",
                borderRadius: "16px",
              },
              success: {
                iconTheme: {
                  primary: "#facc15",
                  secondary: "#000000",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#ffffff",
                },
              },
            }}
          />

        </WishlistProvider>
      </CartProvider>
    </body>
  </html>
);
}