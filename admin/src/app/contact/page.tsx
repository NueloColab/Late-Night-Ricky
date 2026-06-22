'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
export const dynamic = 'force-dynamic';

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState('booking');
  const [contactInfo, setContactInfo] = useState({
    email: 'hello@latenightricky.com',
    instagram: '@latenightricky',
    image: '/assets/ricky-hero-new.jpg',
    formEnabled: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSections() {
      try {
        const res = await fetch('/api/public/sections?page=contact');
        const data = await res.json();
        const sections = data.sections || [];

        const emailSection = sections.find((s: any) => s.section === 'email');
        const instagramSection = sections.find((s: any) => s.section === 'instagram');
        const formSection = sections.find((s: any) => s.section === 'form');
        const imageSection = sections.find((s: any) => s.section === 'image');
        const infoSection = sections.find((s: any) => s.section === 'info');

        const email = emailSection?.content?.[0] || infoSection?.content?.bookingEmail || contactInfo.email;
        const instagram = instagramSection?.content?.[0] || infoSection?.content?.instagram || contactInfo.instagram;
        const image = imageSection?.content?.[0] || infoSection?.content?.image || contactInfo.image;
        const formEnabled = formSection?.isActive !== false;

        setContactInfo({ email, instagram, image, formEnabled });
      } catch {
        // keep defaults
      }
    }
    fetchSections();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!contactInfo.formEnabled) return;
    setSubmitting(true);
    setError('');
    setSubmitted(false);

    const formData = new FormData(e.currentTarget);
    const payload: any = {
      type: activeTab,
      name: formData.get('name'),
      email: formData.get('email'),
    };

    if (activeTab === 'booking') {
      payload.clubName = formData.get('club');
      payload.city = formData.get('city');
      payload.fee = formData.get('fee');
      payload.eventDate = formData.get('date');
    } else {
      payload.message = formData.get('message');
    }

    try {
      const res = await fetch('/api/public/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
      } else {
        setSubmitted(true);
        e.currentTarget.reset();
      }
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.');
    }
    setSubmitting(false);
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen"
        style={{ background: 'linear-gradient(180deg, #2E5C8A 0%, #0D4A4A 100%)' }}
      >
        {/* Page Title Bar */}
        <div className="border-b border-[#F0EDE6]/20 pt-24 pb-5 px-8">
          <div className="max-w-[1200px] mx-auto">
            <h1 className="text-[clamp(40px,8vw,100px)] font-semibold tracking-[-2px] leading-[0.95] text-[#F0EDE6]">Contact</h1>
          </div>
        </div>

        {/* Split Layout */}
        <div className="grid md:grid-cols-2 min-h-[calc(100vh-200px)] items-stretch">
          {/* Left Image */}
          <div className="relative overflow-hidden min-h-[50vh] md:min-h-0">
            <img src={contactInfo.image} alt="Late Night Ricky" className="absolute top-0 left-0 w-full h-full object-cover object-top warm-photo" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0D4A4A]/40" />
          </div>

          {/* Right Form */}
          <div className="p-10 md:p-16 max-w-[600px] mx-auto flex flex-col justify-center">
            {/* Tabs */}
            <div className="flex gap-0 mb-10">
              <button
                onClick={() => { setActiveTab('booking'); setSubmitted(false); setError(''); }}
                className={`flex-1 py-3.5 px-7 border text-xs font-medium uppercase tracking-[1.5px] transition ${
                  activeTab === 'booking' ? 'bg-[#0A1628] text-[#F0EDE6] border-[#0A1628]' : 'bg-transparent text-[#F0EDE6] border-[#F0EDE6]/30 hover:bg-[#2E5C8A]/30'
                }`}
              >
                Booking
              </button>
              <button
                onClick={() => { setActiveTab('private'); setSubmitted(false); setError(''); }}
                className={`flex-1 py-3.5 px-7 border text-xs font-medium uppercase tracking-[1.5px] transition ${
                  activeTab === 'private' ? 'bg-[#0A1628] text-[#F0EDE6] border-[#0A1628]' : 'bg-transparent text-[#F0EDE6] border-[#F0EDE6]/30 hover:bg-[#2E5C8A]/30'
                }`}
              >
                Private Message
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-10">
                <p className="text-lg font-semibold text-[#64C8A8] mb-2">✓ Message sent successfully</p>
                <p className="text-sm text-[#A3B5C4]">We&apos;ll be in touch soon.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-6 py-2 border border-[#F0EDE6]/30 rounded-full text-xs font-medium uppercase tracking-[1px] text-[#F0EDE6] hover:bg-[#2E5C8A]/30 hover:border-[#64C8A8]/50 transition"
                >
                  Send another
                </button>
              </div>
            ) : !contactInfo.formEnabled ? (
              <div className="text-center py-10">
                <p className="text-lg font-semibold text-[#F0EDE6] mb-2">Contact form is currently disabled</p>
                <p className="text-sm text-[#A3B5C4]">Please reach out directly via email.</p>
                <a href={`mailto:${contactInfo.email}`} className="mt-4 inline-block px-6 py-2 border border-[#F0EDE6]/30 rounded-full text-xs font-medium uppercase tracking-[1px] text-[#F0EDE6] hover:bg-[#2E5C8A]/30 hover:border-[#64C8A8]/50 transition">
                  Email {contactInfo.email}
                </a>
              </div>
            ) : (
              <>
                <form
                  onSubmit={handleSubmit}
                  hidden={activeTab !== 'booking'}
                  data-tab="booking"
                >
                  <div className="mb-7">
                    <label className="block text-xs font-medium uppercase tracking-[1.5px] mb-2 text-[#A3B5C4]">Name *</label>
                    <input type="text" name="name" required className="w-full border-b border-[#F0EDE6]/30 py-3 px-0 text-[15px] bg-transparent text-[#F0EDE6] outline-none focus:border-[#64C8A8] transition placeholder-[#6B8E9B]" />
                  </div>
                  <div className="mb-7">
                    <label className="block text-xs font-medium uppercase tracking-[1.5px] mb-2 text-[#A3B5C4]">Email *</label>
                    <input type="email" name="email" required className="w-full border-b border-[#F0EDE6]/30 py-3 px-0 text-[15px] bg-transparent text-[#F0EDE6] outline-none focus:border-[#64C8A8] transition placeholder-[#6B8E9B]" />
                  </div>
                  <div className="mb-7">
                    <label className="block text-xs font-medium uppercase tracking-[1.5px] mb-2 text-[#A3B5C4]">Club Name *</label>
                    <input type="text" name="club" required className="w-full border-b border-[#F0EDE6]/30 py-3 px-0 text-[15px] bg-transparent text-[#F0EDE6] outline-none focus:border-[#64C8A8] transition placeholder-[#6B8E9B]" />
                  </div>
                  <div className="mb-7">
                    <label className="block text-xs font-medium uppercase tracking-[1.5px] mb-2 text-[#A3B5C4]">City *</label>
                    <input type="text" name="city" required className="w-full border-b border-[#F0EDE6]/30 py-3 px-0 text-[15px] bg-transparent text-[#F0EDE6] outline-none focus:border-[#64C8A8] transition placeholder-[#6B8E9B]" />
                  </div>
                  <div className="mb-7">
                    <label className="block text-xs font-medium uppercase tracking-[1.5px] mb-2 text-[#A3B5C4]">Fee *</label>
                    <input type="text" name="fee" required className="w-full border-b border-[#F0EDE6]/30 py-3 px-0 text-[15px] bg-transparent text-[#F0EDE6] outline-none focus:border-[#64C8A8] transition placeholder-[#6B8E9B]" />
                  </div>
                  <div className="mb-7">
                    <label className="block text-xs font-medium uppercase tracking-[1.5px] mb-2 text-[#A3B5C4]">Date *</label>
                    <input type="date" name="date" required className="w-full border-b border-[#F0EDE6]/30 py-3 px-0 text-[15px] bg-transparent text-[#F0EDE6] outline-none focus:border-[#64C8A8] transition placeholder-[#6B8E9B]" />
                  </div>
                  {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-[#0A1628] text-[#F0EDE6] text-sm font-medium uppercase tracking-[2px] hover:bg-[#2E5C8A]/40 transition disabled:opacity-50"
                  >
                    {submitting ? 'Sending...' : 'Submit'}
                  </button>
                </form>
                <form
                  onSubmit={handleSubmit}
                  hidden={activeTab !== 'private'}
                  data-tab="private"
                >
                  <div className="mb-7">
                    <label className="block text-xs font-medium uppercase tracking-[1.5px] mb-2 text-[#A3B5C4]">Name *</label>
                    <input type="text" name="name" required className="w-full border-b border-[#F0EDE6]/30 py-3 px-0 text-[15px] bg-transparent text-[#F0EDE6] outline-none focus:border-[#64C8A8] transition placeholder-[#6B8E9B]" />
                  </div>
                  <div className="mb-7">
                    <label className="block text-xs font-medium uppercase tracking-[1.5px] mb-2 text-[#A3B5C4]">Email *</label>
                    <input type="email" name="email" required className="w-full border-b border-[#F0EDE6]/30 py-3 px-0 text-[15px] bg-transparent text-[#F0EDE6] outline-none focus:border-[#64C8A8] transition placeholder-[#6B8E9B]" />
                  </div>
                  <div className="mb-7">
                    <label className="block text-xs font-medium uppercase tracking-[1.5px] mb-2 text-[#A3B5C4]">Message *</label>
                    <textarea name="message" required rows={4} className="w-full border-b border-[#F0EDE6]/30 py-3 px-0 text-[15px] bg-transparent text-[#F0EDE6] outline-none focus:border-[#64C8A8] transition resize-y min-h-[80px] placeholder-[#6B8E9B]" />
                  </div>
                  {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-[#0A1628] text-[#F0EDE6] text-sm font-medium uppercase tracking-[2px] hover:bg-[#2E5C8A]/40 transition disabled:opacity-50"
                  >
                    {submitting ? 'Sending...' : 'Submit'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
