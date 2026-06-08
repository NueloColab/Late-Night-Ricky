import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { getSeoMeta, getFavicon } from "@/lib/cms";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getSeoMeta('home');
  const favicon = await getFavicon();

  return {
    title: meta?.title || "Late Night Ricky — International DJ & Grammy Winning Producer",
    description: meta?.description || "From London to New York / LA to Las Vegas / Miami to Ibiza and beyond. 150+ shows worldwide. Grammy recognition for work with Chris Brown. Platinum-certified. Previously DJ Fricktion.",
    icons: favicon ? { icon: favicon, shortcut: favicon } : undefined,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
