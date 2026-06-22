import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getClientNames } from '@/lib/cms';
export const dynamic = 'force-dynamic';

const DEFAULT_ARTISTS = [
  'Stormzy', 'Dave', 'Burna Boy', 'Central Cee', 'Tion Wayne',
  'AJ Tracey', 'D-Block Europe', 'J Hus', 'Skepta', 'Headie One'
];

export const metadata = {
  title: 'Clients — Late Night Ricky',
  description: 'Late Night Ricky has shared the stage with the biggest names in music.',
};

export default async function SupportingActPage() {
  const dbNames = await getClientNames();
  const artists = dbNames.length > 0 ? dbNames.map((n: any) => n.name) : DEFAULT_ARTISTS;

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        {/* Page Title */}
        <div className="border-b-2 border-[#111] pt-24 pb-5 px-8">
          <div className="max-w-[1200px] mx-auto">
            <h1 className="text-[clamp(48px,10vw,120px)] font-black tracking-[-3px] uppercase leading-[0.9] text-[#111]">Clients</h1>
          </div>
        </div>

        {/* Artists List */}
        <div className="max-w-[900px] mx-auto px-8 py-20 text-center">
          <p className="text-sm text-[#a0a0a0] mb-12 tracking-[2px] uppercase">Late Night Ricky has shared the stage with</p>
          <div className="flex flex-col gap-1">
            {artists.map((name: string) => (
              <div key={name} className="text-[clamp(36px,7vw,80px)] font-black uppercase tracking-[-2px] leading-none text-[#111] hover:text-[#152a47] transition cursor-default">
                {name}
              </div>
            ))}
          </div>
          <div className="w-[60px] h-0.5 bg-[#0d1f3d] mx-auto my-8 opacity-15" />
          <p className="text-sm text-[#a0a0a0] tracking-[2px] uppercase">And many more</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
