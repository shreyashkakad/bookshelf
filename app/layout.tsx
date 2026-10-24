import type { Metadata } from "next";
import localFont from "next/font/local";
import "@fontsource-variable/fraunces";

import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geist = localFont({
  variable: "--font-geist-sans",
  display: "swap",
  src: [
    { path: "../public/fonts/Geist-Light.ttf", weight: "300", style: "normal" },
    { path: "../public/fonts/Geist-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/Geist-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/Geist-Bold.ttf", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: { default: "Bookshelf", template: "%s | Bookshelf" },
  description: "Search millions of books, then save what you want to read.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Providers>
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
