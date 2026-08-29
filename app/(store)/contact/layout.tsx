import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact MineNote",
  description:
    "Contact MineNote for questions, collaborations, custom notebook ideas and support.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact MineNote",
    description:
      "Get in touch with MineNote for questions, collaborations and support.",
    url: "/contact",
  },
};

export default function ContactLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
