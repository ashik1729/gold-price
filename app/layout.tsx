import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const sans = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Victoria Gold & Diamonds | Live Gold Prices",
  description:
    "Live gold and silver price display for Victoria Gold & Diamonds jewellery showroom.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} h-full antialiased`}>
      <head>
        {/* Full page reload fallback for TV browsers that block or fail client JS */}
        <meta httpEquiv="refresh" content="60" />
      </head>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
