import type { Metadata } from "next";
import { Inter, Playfair_Display, Montserrat } from "next/font/google";
import { getSeoMeta, getFavicon } from "@/lib/cms";
import PageViewTracker from "@/components/PageViewTracker";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", weight: ["400", "500", "600", "700", "800", "900"] });

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getSeoMeta('home');
  const favicon = await getFavicon();

  const title = meta?.title || "Late Night Ricky — Grammy Winning Producer & International DJ";
  const description = meta?.description || "Grammy Award Winning Producer & International DJ. Credits with Chris Brown, Kendrick Lamar, NAV & DIVINE.";
  const ogImage = '/assets/og-image.png';

  return {
    title,
    description,
    icons: favicon ? { icon: favicon, shortcut: favicon } : { icon: '/assets/icon.png', shortcut: '/assets/icon.png' },
    openGraph: {
      title,
      description,
      type: 'website',
      url: 'https://latenightricky.com',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Late Night Ricky — Grammy Winning Producer & International DJ',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${montserrat.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="version" content="v231" />
      </head>
      <body className="font-sans">
        <PageViewTracker />
        {children}
      </body>
    </html>
  );
}
