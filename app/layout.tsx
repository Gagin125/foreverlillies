import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Forever Lilies | Handmade Pipe-Cleaner Lilies",
  description: "Elegant, handmade lilies that last forever. Cherry red bouquets crafted with care and shipped across the Baltics."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" as="image" href="/products/hero.png" />
      </head>
      <body className={`${poppins.variable} font-sans text-ink bg-cream`}>
        <Providers>
          <Header />
          <div className="site-main">
            {children}
            <Footer />
          </div>
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
