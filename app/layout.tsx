import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

const geist = localFont({
  variable: "--font-geist-sans",
  display: "swap",
  src: [
    { path: "../public/fonts/Geist-Thin.ttf", weight: "100", style: "normal" },
    { path: "../public/fonts/Geist-Light.ttf", weight: "300", style: "normal" },
    { path: "../public/fonts/Geist-Medium.ttf", weight: "500", style: "normal" }, // keep exact filename/case
    { path: "../public/fonts/Geist-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/Geist-Bold.ttf", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "bookshelf",
  icons: {
    icon: "/bars-staggered-solid.svg"
  }
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-screen w-full relative text-white bg-black">
        <div
          className="fixed inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120, 180, 255, 0.25), transparent 70%), #000000",
          }}
        />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}