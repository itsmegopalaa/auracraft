import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";

export const metadata: Metadata = {
  title: {
    default: "MineNote | Premium Notebooks",
    template: "%s | MineNote",
  },
};

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
