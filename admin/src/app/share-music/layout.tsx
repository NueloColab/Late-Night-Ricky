import type { Metadata } from 'next';
import { getSeoMeta } from '@/lib/cms';

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getSeoMeta('share-music');
  return {
    title: meta?.title || 'Share Your Music — Late Night Ricky',
    description: meta?.description || 'Send your tracks to Late Night Ricky. International DJ & Grammy Winning Producer.',
  };
}

export default function ShareMusicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
