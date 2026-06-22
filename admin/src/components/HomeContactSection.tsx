'use client';

import { useState, useEffect } from 'react';

export default function HomeContactSection() {
  const [contactInfo, setContactInfo] = useState({
    email: 'samir@wearemediahive.com',
    image: '/assets/ricky-hero-new.jpg',
    formEnabled: true,
  });
  const [activeTab, setActiveTab] = useState('booking');
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
        const formSection = sections.find((s: any) => s.section === 'form');
        const imageSection = sections.find((s: any) => s.section === 'image');

        const email = emailSection?.content?.[0] || contactInfo.email;
        const image = imageSection?.content?.[0] || contactInfo.image;
        const formEnabled = formSection?.isActive !== false;

        setContactInfo({ email, image, formEnabled });
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
    <section id="contact-form" className="relative z-10 bg-white pt-16 md:pt-0">
      <div className="grid md:grid-cols-2 gap-0 min-h-[calc(100vh-70px)] items-stretch">
        {/* Left Image */}
        <div className="relative overflow-hidden">
          <img src={contactInfo.image} alt="Late Night Ricky" className="absolute top-0 left-0 w-full h-full object-cover object-top" />
        </div>

        {/* Right Form */}
        <div className="py-20 px-8 md:px-16 max-w-[600px] mx-auto w-full">
          {/* Tabs */}
          <div className="flex gap-0 mb-10">
            <button
              onClick={() => { setActiveTab('booking'); setSubmitted(false); setError(''); }}
              className={`flex-1 py-3.5 px-7 border-2 border-[#111] text-xs font-semibold uppercase tracking-[1.5px] transition ${
                activeTab === 'booking' ? 'bg-[#111] text-white' : 'bg-white text-[#111] hover:bg-[#E3E8ED]'
              }`}
            >
              Booking
            </button>
            <button
              onClick={() => { setActiveTab('private'); setSubmitted(false); setError(''); }}
              className={`flex-1 py-3.5 px-7 border-2 border-[#111] text-xs font-semibold uppercase tracking-[1.5px] transition ${
                activeTab === 'private' ? 'bg-[#111] text-white' : 'bg-white text-[#111] hover:bg-[#E3E8ED]'
              }`}
            >
              Private Message
            </button>
          </div>

          {submitted ? (
            <div className="text-center py-10">
              <p className="text-lg font-semibold text-[#2d6a2d] mb-2">✓ Message sent successfully</p>
              <p className="text-sm text-[#6B8FAB]">We&apos;ll be in touch soon.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 px-6 py-2 border-2 border-[#111] rounded-full text-xs font-semibold uppercase tracking-[1px] hover:bg-[#111] hover:text-white transition"
              >
                Send another
              </button>
            </div>
          ) : !contactInfo.formEnabled ? (
            <div className="text-center py-10">
              <p className="text-lg font-semibold text-[#111] mb-2">Contact form is currently disabled</p>
              <p className="text-sm text-[#6B8FAB]">Please reach out directly via email.</p>
              <a href={`mailto:${contactInfo.email}`} className="mt-4 inline-block px-6 py-2 border-2 border-[#111] rounded-full text-xs font-semibold uppercase tracking-[1px] hover:bg-[#111] hover:text-white transition">
                Email {contactInfo.email}
              </a>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} hidden={activeTab !== 'booking'} data-tab="booking">
                {[
                  { label: 'Name *', name: 'name', type: 'text' },
                  { label: 'Email *', name: 'email', type: 'email' },
                  { label: 'Club Name *', name: 'club', type: 'text' },
                  { label: 'City *', name: 'city', type: 'text' },
                  { label: 'Fee *', name: 'fee', type: 'text' },
                  { label: 'Date *', name: 'date', type: 'date' },
                ].map((field) => (
                  <div key={field.name} className="mb-5">
                    <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[#5B7A8E] mb-2">{field.label}</label>
                    <input type={field.type} name={field.name} required className="w-full border border-[#E3E8ED] rounded-lg px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#1B3A4C]" />
                  </div>
                ))}
                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                <button type="submit" disabled={submitting} className="w-full py-4 bg-[#111] text-white text-sm font-semibold uppercase tracking-[2px] hover:bg-[#1B3A4C] transition disabled:opacity-50">
                  {submitting ? 'Sending...' : 'Submit'}
                </button>
              </form>

              <form onSubmit={handleSubmit} hidden={activeTab !== 'private'} data-tab="private">
                {[
                  { label: 'Name *', name: 'name', type: 'text' },
                  { label: 'Email *', name: 'email', type: 'email' },
                ].map((field) => (
                  <div key={field.name} className="mb-5">
                    <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[#5B7A8E] mb-2">{field.label}</label>
                    <input type={field.type} name={field.name} required className="w-full border border-[#E3E8ED] rounded-lg px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#1B3A4C]" />
                  </div>
                ))}
                <div className="mb-5">
                  <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[#5B7A8E] mb-2">Message *</label>
                  <textarea name="message" required rows={4} className="w-full border border-[#E3E8ED] rounded-lg px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#1B3A4C] resize-y min-h-[80px]" />
                </div>
                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                <button type="submit" disabled={submitting} className="w-full py-4 bg-[#111] text-white text-sm font-semibold uppercase tracking-[2px] hover:bg-[#1B3A4C] transition disabled:opacity-50">
                  {submitting ? 'Sending...' : 'Submit'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
