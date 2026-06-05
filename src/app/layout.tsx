import type { Metadata } from "next";
import "@/styles/globals.scss";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import CartDrawer from "@/components/CartDrawer/CartDrawer";

export const metadata: Metadata = {
  title: {
    default: "Christmas24 — Gifts & Decorations",
    template: "%s | Christmas24",
  },
  description:
    "Discover our magical selection of Christmas gifts, decorations, and festive essentials.",
  openGraph: {
    type: "website",
    siteName: "Christmas24",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
