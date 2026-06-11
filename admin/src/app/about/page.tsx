import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getSiteSections, getSeoMeta } from '@/lib/cms';
import type { Metadata } from 'next';
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getSeoMeta('about');
  return {
    title: meta?.title || 'About — Late Night Ricky',
    description: meta?.description || 'International DJ & Grammy Winning Producer based in London.',
  };
}

export default async function AboutPage() {
  let sections: any[] = [];
  try {
    sections = await getSiteSections('about');
  } catch {
    // keep fallback
  }

  const introSection = sections.find(s => s.section === 'intro');
  const content = introSection?.content || {};

  const headline = content.headline || 'International DJ & Grammy Winning Producer';
  const bio1 = content.bio1 || 'Late Night Ricky (Previously DJ Fricktion) is an Award-Winning DJ, Grammy Award Winner and Platinum Certified Music Producer based in London. From teaching music in prison programs to performing at some of the world\'s most exclusive celebrity events, Ricky\'s rich and diverse music career has led him to become one of the most popular and trusted faces in London\'s thriving music scene.';
  const bio2 = content.bio2 || 'As a producer, Ricky cites his key influences as Michael Jackson, Dr. Dre, Quincy Jones, and Timbaland, merging soulful R&B, House and cinematic grooves. Having earned Grammy recognition for his work with Chris Brown on the 11:11 album, plus previous cuts with Kendrick Lamar and NAV, Ricky has now stepped into a creative chapter with a new wave of releases scheduled for release.';
  const bio3 = content.bio3 || 'Ricky has embraced his British and South Asian Roots working with some legendary South Asian talent such as DIVINE and rising British R&B star H33RA as well as showcasing Punjabi artists such as Diljit Dosanjh, Karan Aujla and Sidhu Moosewala to mainstream audiences.';
  const bio4 = content.bio4 || 'With many unreleased tracks in the works, plans to further expand his brand and collaborations with other artists, there is a lot more to come this year.';
  const image = content.image || '/assets/ricky-portrait-new.jpg';

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="pt-20 pb-0 px-6">
          <div className="max-w-[1200px] mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[#6B8FAB] hover:text-[#111] transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Home</span>
            </Link>
          </div>
        </div>
        <div className="border-b-2 border-[#111] pt-4 pb-5 px-6">
          <div className="max-w-[1200px] mx-auto flex items-baseline gap-5 flex-wrap">
            <h1 className="text-[clamp(48px,10vw,120px)] font-black tracking-[-3px] uppercase leading-[0.9] text-[#111]">About</h1>
            <span className="font-['Rockybilly',cursive] text-[clamp(24px,3vw,40px)] text-[#6B8FAB] -rotate-1 inline-block opacity-85 whitespace-nowrap">Late Night Ricky</span>
          </div>
        </div>
        <div className="grid md:grid-cols-2 min-h-[calc(100vh-200px)]">
          <div className="relative overflow-hidden min-h-[50vh]">
            <img src={image} alt="Late Night Ricky" className="w-full h-full object-cover object-top" />
          </div>
          <div className="p-10 md:p-14 flex flex-col justify-center max-w-[680px]">
            <h2 className="text-[clamp(24px,3.5vw,40px)] font-black uppercase leading-tight tracking-[-1px] mb-10 text-[#111]">
              {headline}
            </h2>
            <p className="text-sm leading-relaxed text-[#333] mb-5 uppercase tracking-[1px]">
              {bio1}
            </p>
            <p className="text-sm leading-relaxed text-[#333] mb-5 uppercase tracking-[1px]">
              {bio2}
            </p>
            <p className="text-sm leading-relaxed text-[#333] mb-5 uppercase tracking-[1px]">
              {bio3}
            </p>
            <p className="text-sm leading-relaxed text-[#333] mb-5 uppercase tracking-[1px]">
              {bio4}
            </p>
          </div>
        </div>

        {/* Production Credits */}
        <section className="bg-[#111] py-20 px-6">
          <div className="max-w-[1200px] mx-auto">
            <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-8 text-center">Production Credits</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[
                'Chris Brown', 'Kendrick Lamar', 'NAV', 'Divine',
                'Potter Payper', 'Swae Lee', 'N.O.R.E', 'Styles P',
                'Raekwon', 'RZA', 'Jim Jones', 'D Smoke',
                'Apache Indian', 'MC Altaf', 'H33RA', 'Stefflon Don',
                'Lil Keed', 'Ivorian Doll', 'Safe', 'Plus Many More'
              ].map((name) => (
                <div key={name} className="text-[clamp(14px,1.8vw,20px)] font-black uppercase tracking-[-0.5px] text-white text-center py-3 px-2 hover:text-[#8FA8BE] transition cursor-default">
                  {name}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
