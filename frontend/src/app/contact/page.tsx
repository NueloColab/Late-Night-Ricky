import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getSections } from '../../lib/api';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const sections = await getSections('global');
  const seoSection = sections.find((s: any) => s.section === 'seo');
  const metaList = Array.isArray(seoSection?.content) ? seoSection.content : [];
  const contactMeta = metaList.find((m: any) => m.page === 'contact');
  return {
    title: contactMeta?.title || 'Contact — Late Night Ricky',
    description: contactMeta?.description || 'Get in touch with Late Night Ricky for bookings, press enquiries, and collaborations.',
  };
}

export default async function ContactPage() {
  const sections = await getSections('contact');
  const contentSection = sections.find((s: any) => s.section === 'content');
  const texts: string[] = Array.isArray(contentSection?.content) ? contentSection.content : [];

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="border-b-2 border-[#111] pt-24 pb-5 px-6">
          <div className="max-w-[1200px] mx-auto">
            <h1 className="text-[clamp(48px,10vw,120px)] font-black tracking-[-3px] uppercase leading-[0.9] text-[#111]">Contact</h1>
          </div>
        </div>
        <div className="grid md:grid-cols-2 min-h-[calc(100vh-200px)] items-stretch">
          <div className="relative overflow-hidden">
            <img src="/assets/ricky-portrait-new.jpg" alt="Late Night Ricky" className="absolute top-0 left-0 w-full h-full object-cover object-top" />
          </div>
          <div className="p-10 md:p-16 max-w-[600px] mx-auto flex flex-col justify-center">
            {texts.length > 0 ? (
              texts.slice(0, 3).map((t: string, i: number) => (
                <p key={i} className="text-sm leading-relaxed text-[#333] mb-6 uppercase tracking-[1px]">{t}</p>
              ))
            ) : (
              <p className="text-sm leading-relaxed text-[#333] mb-6 uppercase tracking-[1px]">
                For bookings, press enquiries, and collaborations — get in touch with the team.
              </p>
            )}
            <div className="grid gap-6 mt-8">
              <div className="bg-white rounded-2xl p-8 text-center shadow-[0_4px_20px_rgba(27,58,76,0.06)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(27,58,76,0.1)] transition">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1B3A4C] to-[#6B8FAB] flex items-center justify-center mx-auto mb-5 text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                </div>
                <h4 className="font-serif text-xl font-medium mb-2 text-[#1B3A4C]">Email</h4>
                <p className="text-sm text-[#5B7A8E] mb-4">bookings@latenightricky.com</p>
                <a href="mailto:bookings@latenightricky.com" className="text-[#1B3A4C] text-sm font-medium hover:opacity-60 transition">Send email</a>
              </div>
              <div className="bg-white rounded-2xl p-8 text-center shadow-[0_4px_20px_rgba(27,58,76,0.06)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(27,58,76,0.1)] transition">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1B3A4C] to-[#6B8FAB] flex items-center justify-center mx-auto mb-5 text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                </div>
                <h4 className="font-serif text-xl font-medium mb-2 text-[#1B3A4C]">Management</h4>
                <p className="text-sm text-[#5B7A8E] mb-4">London, UK and Worldwide</p>
                <a href="mailto:management@latenightricky.com" className="text-[#1B3A4C] text-sm font-medium hover:opacity-60 transition">Get in touch</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}