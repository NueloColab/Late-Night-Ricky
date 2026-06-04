import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getSections } from '../../lib/api';
export const dynamic = 'force-dynamic';

export const revalidate = 60;

export default async function AboutPage() {
  const sections = await getSections('about');
  const contentSection = sections.find((s: any) => s.section === 'content');
  const texts: string[] = Array.isArray(contentSection?.content) ? contentSection.content : [];

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="border-b-2 border-[#111] pt-24 pb-5 px-6">
          <div className="max-w-[1200px] mx-auto flex items-baseline gap-5 flex-wrap">
            <h1 className="text-[clamp(48px,10vw,120px)] font-black tracking-[-3px] uppercase leading-[0.9] text-[#111]">About</h1>
            <span className="font-['Rockybilly'] text-[clamp(24px,3vw,40px)] text-[#6B8FAB] -rotate-1 inline-block opacity-85">Late Night Ricky</span>
          </div>
        </div>
        <div className="grid md:grid-cols-2 min-h-[calc(100vh-200px)]">
          <div className="relative overflow-hidden min-h-[50vh]">
            <img src="/assets/ricky-portrait-new.jpg" alt="Late Night Ricky" className="w-full h-full object-cover object-top" />
          </div>
          <div className="p-10 md:p-14 flex flex-col justify-center max-w-[680px]">
            <h2 className="text-[clamp(24px,3.5vw,40px)] font-black uppercase leading-tight tracking-[-1px] mb-10 text-[#111]">
              Grammy Award Winner &amp; Platinum Certified Producer
            </h2>
            {texts.length > 0 ? (
              texts.slice(0, 6).map((t: string, i: number) => (
                <p key={i} className="text-sm leading-relaxed text-[#333] mb-5 uppercase tracking-[1px]">{t}</p>
              ))
            ) : (
              <>
                <p className="text-sm leading-relaxed text-[#333] mb-5 uppercase tracking-[1px]">
                  Late Night Ricky is an international DJ and Grammy-winning producer based in London. With over a decade of experience, he has performed at the world&apos;s most exclusive venues and festivals.
                </p>
                <p className="text-sm leading-relaxed text-[#333] mb-5 uppercase tracking-[1px]">
                  From Ministry of Sound to Abu Dhabi Grand Prix, his sets blend house, hip-hop, and electronic music into unforgettable experiences.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}