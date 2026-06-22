import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { getShowPage } from '@/lib/cms';
export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const show = await getShowPage('gin-juice');
  return {
    title: show?.title ? `${show.title} — Late Night Ricky` : 'Gin & Juice Launch — Late Night Ricky',
    description: show?.description || 'Sunset sets and poolside energy at Ibiza Rocks for the Snoop Dogg Gin & Juice brand launch.',
  };
}

export default async function ShowGinJuicePage() {
  const show = await getShowPage('gin-juice');

  const title = show?.title || 'Gin & Juice Launch';
  const venue = show?.venue || 'Ibiza Rocks';
  const location = show?.location || 'Ibiza';
  const season = show?.season || 'Spring / Summer 2024';
  const setLength = show?.setLength || '3 Hour Set';
  const heroImage = show?.heroImage || '/assets/ricky-radio-new.jpg';
  const description = show?.description || 'Sunset sets and poolside energy at Ibiza Rocks for the Snoop Dogg Gin & Juice brand launch. A night of pure vibes under the Mediterranean sky.';

  return (
    <>
      <Navbar />
      <main>
        <section className="relative min-h-[70vh] flex flex-col justify-end px-8 py-16 pt-36 text-white overflow-hidden bg-[#152a47]">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url('${heroImage}')`, filter: 'grayscale(60%) brightness(0.4)'}} />
          </div>
          <div className="relative z-10 max-w-[1200px] mx-auto w-full">
            <p className="text-[13px] font-semibold tracking-[2px] uppercase text-[#C5E5F8] mb-4">{venue}</p>
            <h1 className="font-serif text-[clamp(42px,7vw,80px)] font-normal leading-[1.05] mb-5">{title}</h1>
            <div className="flex gap-6 flex-wrap text-sm font-medium tracking-[1px] uppercase text-[#A8D5F0]">
              <span className="flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> {location}</span>
              <span className="flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> {season}</span>
              <span className="flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><polyline points="12 6 12 12 16 14"/></svg> {setLength}</span>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 px-8 max-w-[1400px] mx-auto">
            <img src="/assets/ricky-radio-new.jpg" alt={title} className="w-full h-[320px] object-cover hover:scale-[1.03] transition duration-500" loading="lazy" />
            <img src="/assets/ricky-hero-new.jpg" alt={title} className="w-full h-[320px] object-cover hover:scale-[1.03] transition duration-500" loading="lazy" />
            <img src="/assets/ricky-fricktion.jpg" alt={title} className="w-full h-[320px] object-cover hover:scale-[1.03] transition duration-500" loading="lazy" />
            <img src="/assets/press-bg2.jpg" alt={title} className="w-full h-[320px] object-cover hover:scale-[1.03] transition duration-500" loading="lazy" />
            <img src="/assets/ricky-hero-v2.jpg" alt={title} className="w-full h-[320px] object-cover hover:scale-[1.03] transition duration-500" loading="lazy" />
          </div>
        </section>

        <section className="bg-[#0d1f3d] py-20 px-8">
          <div className="max-w-[1000px] mx-auto">
            <h2 className="text-sm font-semibold tracking-[2px] uppercase text-[#C5E5F8] mb-10 text-center">Event Highlights</h2>
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl">
              <iframe src="https://www.youtube.com/embed/Ga-oUBV2k0E" className="absolute inset-0 w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" />
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="grid md:grid-cols-2 min-h-[600px]">
            <div className="relative overflow-hidden min-h-[400px]"><img src={heroImage} alt={title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" /></div>
            <div className="p-16 md:p-20 flex flex-col justify-center max-w-[640px]">
              <h2 className="text-[13px] font-semibold tracking-[2.5px] uppercase text-[#C5E5F8] mb-8">About the Event</h2>
              <p className="text-[clamp(28px,4vw,48px)] font-black leading-[1.05] uppercase text-[#111] mb-8 tracking-[-1px]">{description}</p>
              <div className="flex gap-3 flex-wrap mt-4">
                <span className="text-[11px] font-semibold tracking-[1.5px] uppercase px-6 py-2.5 border-2 border-[#A8D5F0] rounded-full text-[#152a47]">Poolside</span>
                <span className="text-[11px] font-semibold tracking-[1.5px] uppercase px-6 py-2.5 border-2 border-[#A8D5F0] rounded-full text-[#152a47]">2,000+</span>
                <span className="text-[11px] font-semibold tracking-[1.5px] uppercase px-6 py-2.5 border-2 border-[#A8D5F0] rounded-full text-[#152a47]">Hip-Hop / House</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-10 px-8 border-t border-[#0d1f3d]">
          <div className="max-w-[1200px] mx-auto">
            <Link href="/#shows" className="inline-flex items-center gap-3 text-[#152a47] text-[13px] font-semibold uppercase tracking-[1.5px] hover:gap-5 transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to all shows
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
