import type { Metadata } from "next";
import { Inter, Playfair_Display, Great_Vibes } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"], variable: "--font-great-vibes" });

export const metadata: Metadata = {
  title: "Late Night Ricky — International DJ & Grammy Winning Producer",
  description: "From London to New York / LA to Las Vegas / Miami to Ibiza and beyond. 150+ shows worldwide. Grammy recognition for work with Chris Brown. Platinum-certified. Previously DJ Fricktion.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${greatVibes.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
