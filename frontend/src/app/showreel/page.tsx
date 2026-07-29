import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getSections } from '../../lib/api';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const sections = await getSections('global');
  const seoSection = sections.find((s: any) => s.section === 'seo');
  const metaList = Array.isArray(seoSection?.content) ? seoSection.content : [];
  const showreelMeta = metaList.find((m: any) => m.page === 'showreel');
  return {
    title: showreelMeta?.title || 'Showreel — Late Night Ricky',
    description: showreelMeta?.description || 'Watch Late Night Ricky in action — live sets, studio sessions, and behind the scenes.',
    alternates: { canonical: 'https://www.latenightricky.com/showreel' },
  };
}

export default async function ShowreelPage() {
  const sections = await getSections('showreel');
  const contentSection = sections.find((s: any) => s.section === 'content');
  const texts: string[] = Array.isArray(contentSection?.content) ? contentSection.content : [];

  return (
    <>
      <Navbar />
      <div className="bg-[#111] min-h-screen">
        <section className="relative w-full h-screen overflow-hidden flex items-center justify-center">
          <video autoPlay muted loop playsInline className="absolute top-0 left-0 w-full h-full object-cover">
            <source src="/assets/video-desktop.webm" type="video/webm" />
            <source src="/assets/video-desktop.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[rgba(17,17,17,0.45)] pointer-events-none z-[2]" />
          <div className="relative z-[3] text-center">
            <a href="#showreel" className="inline-block px-12 py-4 border-2 border-white rounded-full bg-transparent text-white text-sm font-semibold uppercase tracking-[2.5px] hover:bg-white hover:text-[#111] transition">Watch Showreel</a>
          </div>
        </section>
        <section id="showreel" className="py-28 px-6">
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="font-serif text-[clamp(32px,4vw,52px)] font-normal text-white mb-8 leading-tight">The Sound of Late Night Ricky</h2>
            {texts.length > 0 ? (
              texts.slice(0, 4).map((t: string, i: number) => (
                <p key={i} className="text-[17px] text-[#8FA8BE] leading-relaxed mb-6">{t}</p>
              ))
            ) : (
              <p className="text-[17px] text-[#8FA8BE] leading-relaxed mb-6">
                A curated showcase of performances, productions, and behind-the-scenes moments from around the globe. From sold-out arenas to intimate sunset sets, this is the sound that moves the world.
              </p>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}