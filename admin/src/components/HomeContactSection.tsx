'use client';

import { useState, useEffect } from 'react';

export default function HomeContactSection() {
  const [contactInfo, setContactInfo] = useState({
    email: 'samir@wearemediahive.com',
    image: '/assets/ricky-contact-studio-2.jpg',
    formEnabled: true,
  });
  const [expanded, setExpanded] = useState(false);
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
        // CMS override disabled — hardcoded image for cache busting
        // const image = imageSection?.content?.[0] || contactInfo.image;
        const image = contactInfo.image;
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
    <section id="contact-form" className="relative min-h-[calc(100dvh-70px)]">
      {/* Full background image — no gradient fade */}
      <div className="absolute inset-0 z-0">
        <img
          src={contactInfo.image}
          alt="Late Night Ricky"
          className="w-full h-full object-cover object-center"
          style={{ filter: 'grayscale(100%)' }}
        />
        <div className="absolute inset-0 bg-[#2a1a0a]/40" />
      </div>

      {/* Contact content on the left */}
      <div className="relative z-10 flex items-center min-h-[calc(100dvh-70px)] px-8 md:px-14 py-20">
        <div className="w-full max-w-[600px]">
          {!expanded ? (
            <div className="text-left">
              <span className="text-[10px] md:text-[11px] tracking-[0.25em] uppercase text-[#d4c4a8]/80 font-medium block mb-4">Get in Touch</span>
              <h2 className="text-[clamp(32px,4vw,56px)] font-black uppercase tracking-[-1px] leading-[0.95] text-[#e8d4b8] mb-6" style={{ fontFamily: "'Oswald', sans-serif" }}>CONTACT</h2>
              <button
                onClick={() => setExpanded(true)}
                className="garrix-btn garrix-btn-outline"
                style={{ borderColor: '#e8d4b8', color: '#e8d4b8' }}
              >
                CONTACT
              </button>
            </div>
          ) : (
            <div className="animate-in">
              <div className="flex gap-0 mb-8">
                <button
                  onClick={() => { setActiveTab('booking'); setSubmitted(false); setError(''); }}
                  className={`flex-1 py-3.5 px-4 border-2 text-xs font-semibold uppercase tracking-[1.5px] transition ${
                    activeTab === 'booking'
                      ? 'bg-[#e8d4b8] text-[#2a1a0a] border-[#e8d4b8]'
                      : 'bg-transparent text-[#e8d4b8] border-[#e8d4b8] hover:bg-[#e8d4b8]/10'
                  }`}
                >
                  Booking
                </button>
                <button
                  onClick={() => { setActiveTab('private'); setSubmitted(false); setError(''); }}
                  className={`flex-1 py-3.5 px-4 border-2 text-xs font-semibold uppercase tracking-[1.5px] transition ${
                    activeTab === 'private'
                      ? 'bg-[#e8d4b8] text-[#2a1a0a] border-[#e8d4b8]'
                      : 'bg-transparent text-[#e8d4b8] border-[#e8d4b8] hover:bg-[#e8d4b8]/10'
                  }`}
                >
                  Private Message
                </button>
              </div>

              {submitted ? (
                <div className="py-8">
                  <p className="text-lg font-semibold text-[#e8d4b8] mb-2">✓ Message sent successfully</p>
                  <p className="text-sm text-[#d4c4a8]/80">We&apos;ll be in touch soon.</p>
                  <button
                    onClick={() => { setSubmitted(false); setExpanded(false); }}
                    className="mt-6 px-6 py-2 border-2 border-[#e8d4b8] text-[#e8d4b8] text-xs font-semibold uppercase tracking-[1px] hover:bg-[#e8d4b8] hover:text-[#2a1a0a] transition"
                  >
                    Send another
                  </button>
                </div>
              ) : !contactInfo.formEnabled ? (
                <div className="py-8">
                  <p className="text-lg font-semibold text-[#e8d4b8] mb-2">Contact form is currently disabled</p>
                  <p className="text-sm text-[#d4c4a8]/80">Please reach out directly via email.</p>
                  <a href={`mailto:${contactInfo.email}`} className="mt-4 inline-block px-6 py-2 border-2 border-[#e8d4b8] text-[#e8d4b8] text-xs font-semibold uppercase tracking-[1px] hover:bg-[#e8d4b8] hover:text-[#2a1a0a] transition">
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
                      <div key={field.name} className="mb-4">
                        <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[#d4c4a8]/80 mb-1.5">{field.label}</label>
                        <input
                          type={field.type}
                          name={field.name}
                          required
                          className="w-full bg-[#2a1a0a]/30 border border-[#e8d4b8]/20 px-4 py-3 text-sm text-[#e8d4b8] placeholder-[#d4c4a8]/40 focus:outline-none focus:border-[#e8d4b8]/50"
                        />
                      </div>
                    ))}
                    {error && activeTab === 'booking' && <p className="text-red-300 text-sm mb-4">{error}</p>}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-[#e8d4b8] text-[#2a1a0a] text-sm font-semibold uppercase tracking-[2px] hover:bg-[#d4c4a8] transition disabled:opacity-50"
                    >
                      {submitting ? 'Sending...' : 'Submit'}
                    </button>
                  </form>

                  <form onSubmit={handleSubmit} hidden={activeTab !== 'private'} data-tab="private">
                    {[
                      { label: 'Name *', name: 'name', type: 'text' },
                      { label: 'Email *', name: 'email', type: 'email' },
                    ].map((field) => (
                      <div key={field.name} className="mb-4">
                        <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[#d4c4a8]/80 mb-1.5">{field.label}</label>
                        <input
                          type={field.type}
                          name={field.name}
                          required
                          className="w-full bg-[#2a1a0a]/30 border border-[#e8d4b8]/20 px-4 py-3 text-sm text-[#e8d4b8] placeholder-[#d4c4a8]/40 focus:outline-none focus:border-[#e8d4b8]/50"
                        />
                      </div>
                    ))}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[#d4c4a8]/80 mb-1.5">Message *</label>
                      <textarea
                        name="message"
                        required
                        rows={4}
                        className="w-full bg-[#2a1a0a]/30 border border-[#e8d4b8]/20 px-4 py-3 text-sm text-[#e8d4b8] placeholder-[#d4c4a8]/40 focus:outline-none focus:border-[#e8d4b8]/50 resize-y min-h-[80px]"
                      />
                    </div>
                    {error && activeTab === 'private' && <p className="text-red-300 text-sm mb-4">{error}</p>}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-[#e8d4b8] text-[#2a1a0a] text-sm font-semibold uppercase tracking-[2px] hover:bg-[#d4c4a8] transition disabled:opacity-50"
                    >
                      {submitting ? 'Sending...' : 'Submit'}
                    </button>
                  </form>

                  {/* Bottom buttons */}
                  <div className="mt-6 pt-6 border-t border-[#e8d4b8]/20 flex flex-col sm:flex-row gap-3">
                    <a
                      href="/assets/press-pack.pdf"
                      download
                      className="flex-1 py-3 border-2 border-[#e8d4b8] text-[#e8d4b8] text-xs font-semibold uppercase tracking-[1.5px] text-center hover:bg-[#e8d4b8] hover:text-[#2a1a0a] transition"
                    >
                      Press Pack
                    </a>
                    <a
                      href="/share-music"
                      className="flex-1 py-3 border-2 border-[#e8d4b8] text-[#e8d4b8] text-xs font-semibold uppercase tracking-[1.5px] text-center hover:bg-[#e8d4b8] hover:text-[#2a1a0a] transition"
                    >
                      Share Your Music
                    </a>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
