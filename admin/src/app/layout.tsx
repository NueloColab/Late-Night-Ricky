import type { Metadata } from "next";
import { Inter, Playfair_Display, Montserrat, Francois_One, Righteous } from "next/font/google";
import { getSeoMeta, getFavicon } from "@/lib/cms";
import PageViewTracker from "@/components/PageViewTracker";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", weight: ["400", "500", "600", "700", "800", "900"] });
const francois = Francois_One({ subsets: ["latin"], variable: "--font-francois", weight: ["400"] });
const righteous = Righteous({ subsets: ["latin"], variable: "--font-righteous", weight: ["400"] });

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getSeoMeta('home');
  const favicon = await getFavicon();

  const title = meta?.title || "Late Night Ricky — Grammy Winning Producer & International DJ";
  const description = meta?.description || "Grammy Award Winning Producer & International DJ. Credits with Chris Brown, Kendrick Lamar, NAV & DIVINE.";
  const ogImage = '/assets/og-image.png';

  return {
    title,
    description,
    metadataBase: new URL('https://www.latenightricky.com'),
    alternates: {
      canonical: '/',
    },
    icons: favicon ? {
      icon: [
        { url: '/favicon.ico?v=2', type: 'image/x-icon', sizes: 'any' },
        { url: `${favicon}?v=2`, type: 'image/png', sizes: '512x512' },
      ],
      shortcut: '/favicon.ico?v=2',
      apple: '/apple-touch-icon.png?v=2',
    } : {
      icon: [
        { url: '/favicon.ico?v=2', type: 'image/x-icon', sizes: 'any' },
        { url: '/assets/icon.png?v=2', type: 'image/png', sizes: '512x512' },
      ],
      shortcut: '/favicon.ico?v=2',
      apple: '/apple-touch-icon.png?v=2',
    },
    manifest: '/site.webmanifest',
    openGraph: {
      title,
      description,
      type: 'website',
      url: 'https://www.latenightricky.com',
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
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${montserrat.variable} ${francois.variable} ${righteous.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="version" content="v231" />
        <style>{`
          @font-face {
            font-family: 'Cocogoose';
            src: url('/fonts/cocogoose/Cocogoose-Narrow-Regular-trial.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
          }
          @font-face {
            font-family: 'Cocogoose';
            src: url('/fonts/cocogoose/Cocogoose-Narrow-Light-trial.ttf') format('truetype');
            font-weight: 300;
            font-style: normal;
            font-display: swap;
          }
        `}</style>
      </head>
      <body className="font-sans">
        <PageViewTracker />
        {children}
      </body>
    </html>
  );
}
