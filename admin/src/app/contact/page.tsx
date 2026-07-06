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
      <main className="bg-white min-h-screen">
        {/* Page Title Bar */}
        <div className="border-b-2 border-[#111] pt-24 pb-5 px-8">
          <div className="max-w-[1200px] mx-auto">
            <h1 className="text-[clamp(48px,10vw,120px)] font-black tracking-[-3px] uppercase leading-[0.9] text-[#111]">Contact</h1>
          </div>
        </div>

        {/* Split Layout */}
        <div className="grid md:grid-cols-2 min-h-[calc(100vh-200px)] items-stretch">
          {/* Left Image */}
          <div className="relative overflow-hidden min-h-[50vh] md:min-h-0">
            <img src={contactInfo.image} alt="Late Night Ricky" className="absolute top-0 left-0 w-full h-full object-cover object-top" />
          </div>

          {/* Right Form */}
          <div className="p-10 md:p-16 max-w-[600px] mx-auto flex flex-col justify-center">
            {/* Tabs */}
            <div className="flex gap-0 mb-10">
              <button
                onClick={() => { setActiveTab('booking'); setSubmitted(false); setError(''); }}
                className={`flex-1 py-3.5 px-7 border-2 border-[#111] text-xs font-semibold uppercase tracking-[1.5px] transition ${
                  activeTab === 'booking' ? 'bg-[#0d1f3d] text-white' : 'bg-white text-[#111] hover:bg-[#0d1f3d]'
                }`}
              >
                Booking
              </button>
              <button
                onClick={() => { setActiveTab('private'); setSubmitted(false); setError(''); }}
                className={`flex-1 py-3.5 px-7 border-2 border-[#111] text-xs font-semibold uppercase tracking-[1.5px] transition ${
                  activeTab === 'private' ? 'bg-[#0d1f3d] text-white' : 'bg-white text-[#111] hover:bg-[#0d1f3d]'
                }`}
              >
                Private Message
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-10">
                <p className="text-lg font-semibold text-[#2d6a2d] mb-2">✓ Message sent successfully</p>
                <p className="text-sm text-[#A8D5F0]">We&apos;ll be in touch soon.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-6 py-2 border-2 border-[#111] rounded-full text-xs font-semibold uppercase tracking-[1px] hover:bg-[#0d1f3d] hover:text-white transition"
                >
                  Send another
                </button>
              </div>
            ) : !contactInfo.formEnabled ? (
              <div className="text-center py-10">
                <p className="text-lg font-semibold text-[#111] mb-2">Contact form is currently disabled</p>
                <p className="text-sm text-[#A8D5F0]">Please reach out directly via email.</p>
                <a href={`mailto:${contactInfo.email}`} className="mt-4 inline-block px-6 py-2 border-2 border-[#111] rounded-full text-xs font-semibold uppercase tracking-[1px] hover:bg-[#0d1f3d] hover:text-white transition">
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
                    <label className="block text-xs font-semibold uppercase tracking-[1.5px] mb-2">Name *</label>
                    <input type="text" name="name" required className="w-full border-b-2 border-[#111] py-3 px-0 text-[15px] bg-transparent outline-none focus:border-[#152a47] transition" />
                  </div>
                  <div className="mb-7">
                    <label className="block text-xs font-semibold uppercase tracking-[1.5px] mb-2">Email *</label>
                    <input type="email" name="email" required className="w-full border-b-2 border-[#111] py-3 px-0 text-[15px] bg-transparent outline-none focus:border-[#152a47] transition" />
                  </div>
                  <div className="mb-7">
                    <label className="block text-xs font-semibold uppercase tracking-[1.5px] mb-2">Club Name *</label>
                    <input type="text" name="club" required className="w-full border-b-2 border-[#111] py-3 px-0 text-[15px] bg-transparent outline-none focus:border-[#152a47] transition" />
                  </div>
                  <div className="mb-7">
                    <label className="block text-xs font-semibold uppercase tracking-[1.5px] mb-2">City *</label>
                    <input type="text" name="city" required className="w-full border-b-2 border-[#111] py-3 px-0 text-[15px] bg-transparent outline-none focus:border-[#152a47] transition" />
                  </div>
                  <div className="mb-7">
                    <label className="block text-xs font-semibold uppercase tracking-[1.5px] mb-2">Fee *</label>
                    <input type="text" name="fee" required className="w-full border-b-2 border-[#111] py-3 px-0 text-[15px] bg-transparent outline-none focus:border-[#152a47] transition" />
                  </div>
                  <div className="mb-7">
                    <label className="block text-xs font-semibold uppercase tracking-[1.5px] mb-2">Date *</label>
                    <input type="date" name="date" required className="w-full border-b-2 border-[#111] py-3 px-0 text-[15px] bg-transparent outline-none focus:border-[#152a47] transition" />
                  </div>
                  {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-[#0d1f3d] text-white text-sm font-semibold uppercase tracking-[2px] hover:bg-[#152a47] transition disabled:opacity-50"
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
                    <label className="block text-xs font-semibold uppercase tracking-[1.5px] mb-2">Name *</label>
                    <input type="text" name="name" required className="w-full border-b-2 border-[#111] py-3 px-0 text-[15px] bg-transparent outline-none focus:border-[#152a47] transition" />
                  </div>
                  <div className="mb-7">
                    <label className="block text-xs font-semibold uppercase tracking-[1.5px] mb-2">Email *</label>
                    <input type="email" name="email" required className="w-full border-b-2 border-[#111] py-3 px-0 text-[15px] bg-transparent outline-none focus:border-[#152a47] transition" />
                  </div>
                  <div className="mb-7">
                    <label className="block text-xs font-semibold uppercase tracking-[1.5px] mb-2">Message *</label>
                    <textarea name="message" required rows={4} className="w-full border-b-2 border-[#111] py-3 px-0 text-[15px] bg-transparent outline-none focus:border-[#152a47] transition resize-y min-h-[80px]" />
                  </div>
                  {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-[#0d1f3d] text-white text-sm font-semibold uppercase tracking-[2px] hover:bg-[#152a47] transition disabled:opacity-50"
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
