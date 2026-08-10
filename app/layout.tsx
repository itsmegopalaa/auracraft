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
    default: "MineNote | Personalized Notebooks & Creative Designs",
    template: "%s | MineNote",
  },

  description:
    "MineNote creates personalized notebooks with unique designs, quality paper, and creative styles made for students, creators, and dreamers.",

  keywords: [
    "MineNote",
    "premium notebooks",
    "designer notebooks",
    "A4 notebooks",
    "anime notebooks",
    "creative stationery",
    "custom notebooks",
  ],

  authors: [
    {
      name: "MineNote",
    },
  ],

  creator: "MineNote",

  openGraph: {
    title: "MineNote | Personalized Notebooks & Creative Designs",
    description:
      "Discover premium notebooks designed for creativity, learning, and imagination.",
    type: "website",
    siteName: "MineNote",
  },

  twitter: {
    card: "summary_large_image",
    title: "MineNote | Personalized Notebooks & Creative Designs",
    description:
      "MineNote creates personalized notebooks with unique designs, quality paper, and creative styles made for students, creators, and dreamers.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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