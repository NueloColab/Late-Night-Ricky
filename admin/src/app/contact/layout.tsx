import type { Metadata } from 'next';
import { getSeoMeta } from '@/lib/cms';

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getSeoMeta('contact');
  return {
    title: meta?.title || 'Contact — Late Night Ricky',
    description: meta?.description || 'Booking and enquiries for Late Night Ricky. International DJ & Grammy Winning Producer.',
  };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
