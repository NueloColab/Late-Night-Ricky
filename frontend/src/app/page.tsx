import RadioPlayer from "@/components/RadioPlayer";
import { getSections } from "@/lib/api";

export default async function Home() {
  const sections = await getSections("home");
  const radioSection = sections.find((s: any) => s.section === "radio");
  const links = radioSection?.links || {};

  return (
    <main className="min-h-screen bg-[#E3E8ED]">
      <div className="bg-[#1B3A4C] text-white py-32 px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">Late Night Ricky</h1>
        <p className="text-lg text-[#8FA8BE] uppercase tracking-widest">International DJ & Grammy Winning Producer</p>
      </div>

      <RadioPlayer links={links} />

      <div className="py-20 px-6 text-center">
        <a
          href="/share-music"
          className="inline-block px-8 py-4 bg-[#1B3A4C] text-white rounded-lg font-semibold uppercase tracking-wide hover:bg-[#2a4a5c] transition-colors"
        >
          Share Your Music
        </a>
      </div>
    </main>
  );
}
