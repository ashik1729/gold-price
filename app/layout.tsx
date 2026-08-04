import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { META_REFRESH_SEC } from "@/lib/constants";
import "./globals.css";

const sans = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  fallback: ["Times New Roman", "Times", "serif"],
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
  const metaRefresh =
    Number.isFinite(META_REFRESH_SEC) && META_REFRESH_SEC > 0
      ? META_REFRESH_SEC
      : 0;

  return (
    <html
      lang="en"
      className={`${sans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {metaRefresh > 0 ? (
          <>
            {/* TV / no-JS fallback: full reload so prices update without client JS. */}
            <meta
              id="tv-meta-refresh"
              httpEquiv="refresh"
              content={String(metaRefresh)}
            />
            {/* Capable browsers remove the meta tag and use silent /api/metals polling. */}
            <script
              dangerouslySetInnerHTML={{
                __html: `(function(){try{var m=document.getElementById("tv-meta-refresh");if(m&&m.parentNode){m.parentNode.removeChild(m);}}catch(e){}})();`,
              }}
            />
          </>
        ) : null}
      </head>
      <body
        className="min-h-full font-sans"
        style={{ background: "#061634", color: "#f8f2e7" }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
