import type { Metadata } from 'next';
import { getSeoMeta } from '@/lib/cms';

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getSeoMeta('showreel');
  return {
    title: meta?.title || 'Showreel — Late Night Ricky',
    description: meta?.description || 'Watch showreels from Late Night Ricky. International DJ & Grammy Winning Producer.',
  };
}

export default function ShowreelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
