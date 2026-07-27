import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

const ADMIN_API = process.env.ADMIN_API_URL || "http://localhost:3001";

async function getSeoMeta(page: string): Promise<{ title: string; description: string } | null> {
  try {
    const res = await fetch(`${ADMIN_API}/api/public/sections?page=global`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    const seoSection = (data?.sections || []).find((s: any) => s.section === 'seo');
    if (!seoSection) return null;
    const content = seoSection.content;
    const metaList = Array.isArray(content) ? content : [];
    return metaList.find((m: any) => m.page === page) || null;
  } catch {
    return null;
  }
}

async function getFavicon(): Promise<string | null> {
  try {
    const res = await fetch(`${ADMIN_API}/api/public/sections?page=global`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    const seoSection = (data?.sections || []).find((s: any) => s.section === 'seo');
    if (!seoSection) return null;
    const images = seoSection.images;
    if (Array.isArray(images) && images.length > 0 && images[0]) {
      let src = images[0];
      if (!src.startsWith('http') && !src.startsWith('/')) src = '/' + src;
      // Skip the old Cloudinary green blob
      if (src.includes('cloudinary') && src.includes('Late_Night_Ricky5.png')) return null;
      return src;
    }
    return null;
  } catch {
    return null;
  }
}

const DEFAULT_TITLE = "Late Night Ricky — International DJ & Grammy Winning Producer";
const DEFAULT_DESCRIPTION = "From London to the world. Late Night Ricky — International DJ & Grammy Winning Producer. Bookings, shows, and music.";

export async function generateMetadata(): Promise<Metadata> {
  const homeMeta = await getSeoMeta('home');
  const faviconUrl = await getFavicon();

  const title = homeMeta?.title || DEFAULT_TITLE;
  const description = homeMeta?.description || DEFAULT_DESCRIPTION;

  return {
    title,
    description,
    icons: faviconUrl ? [{ url: faviconUrl, type: 'image/png' }] : [{ url: '/favicon.ico' }],
    openGraph: {
      title,
      description,
      url: 'https://late-night-ricky.vercel.app',
      siteName: 'Late Night Ricky',
      images: faviconUrl ? [{ url: faviconUrl, width: 1200, height: 630, alt: 'Late Night Ricky' }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: faviconUrl ? [faviconUrl] : [],
    },
    metadataBase: new URL('https://late-night-ricky.vercel.app'),
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}