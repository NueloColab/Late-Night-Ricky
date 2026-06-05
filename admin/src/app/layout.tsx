import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const rockybilly = localFont({
  src: [
    { path: "../../public/assets/Rockybilly.woff2", weight: "400", style: "normal" },
    { path: "../../public/assets/Rockybilly.woff", weight: "400", style: "normal" },
    { path: "../../public/assets/Rockybilly.ttf", weight: "400", style: "normal" },
  ],
  variable: "--font-rockybilly",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Late Night Ricky — International DJ & Grammy Winning Producer",
  description: "From London to New York / LA to Las Vegas / Miami to Ibiza and beyond. 150+ shows worldwide. Grammy recognition for work with Chris Brown. Platinum-certified. Previously DJ Fricktion.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${rockybilly.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
