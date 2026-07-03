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
    <section id="contact-form" className="relative bg-[#f8f1e8]">
      <div className="grid md:grid-cols-2 gap-0 min-h-[calc(100dvh-70px)] items-stretch">
        {/* Left Image — B&W studio photo */}
        <div className="relative overflow-hidden min-h-[300px] md:min-h-0">
          <img
            src={contactInfo.image}
            alt="Late Night Ricky"
            className="absolute top-0 left-0 w-full h-full object-cover object-top"
            style={{ filter: 'grayscale(100%)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#f8f1e8]/90 md:bg-gradient-to-r md:from-transparent md:via-[#f8f1e8]/30 md:to-[#f8f1e8]/95" />
        </div>

        {/* Right Form */}
        <div className="relative z-10 py-20 px-8 md:px-16 max-w-[600px] mx-auto w-full flex flex-col justify-center">
          {!expanded ? (
            <div className="text-center">
              <span className="text-[10px] md:text-[11px] tracking-[0.25em] uppercase text-[#8a6a4a] font-medium block mb-4">Get in Touch</span>
              <h2 className="text-[clamp(32px,4vw,56px)] font-black uppercase tracking-[-1px] leading-[0.95] text-[#2a1a0a] mb-6" style={{ fontFamily: "'Oswald', sans-serif" }}>CONTACT</h2>
              <button
                onClick={() => setExpanded(true)}
                className="garrix-btn garrix-btn-outline"
                style={{ borderColor: '#5a3a1a', color: '#2a1a0a' }}
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
                      ? 'bg-[#5a3a1a] text-[#f8f1e8] border-[#5a3a1a]'
                      : 'bg-transparent text-[#5a3a1a] border-[#5a3a1a] hover:bg-[#5a3a1a]/10'
                  }`}
                >
                  Booking
                </button>
                <button
                  onClick={() => { setActiveTab('private'); setSubmitted(false); setError(''); }}
                  className={`flex-1 py-3.5 px-4 border-2 text-xs font-semibold uppercase tracking-[1.5px] transition ${
                    activeTab === 'private'
                      ? 'bg-[#5a3a1a] text-[#f8f1e8] border-[#5a3a1a]'
                      : 'bg-transparent text-[#5a3a1a] border-[#5a3a1a] hover:bg-[#5a3a1a]/10'
                  }`}
                >
                  Private Message
                </button>
              </div>

              {submitted ? (
                <div className="text-center py-8">
                  <p className="text-lg font-semibold text-[#5a3a1a] mb-2">✓ Message sent successfully</p>
                  <p className="text-sm text-[#8a6a4a]">We&apos;ll be in touch soon.</p>
                  <button
                    onClick={() => { setSubmitted(false); setExpanded(false); }}
                    className="mt-6 px-6 py-2 border-2 border-[#5a3a1a] text-[#2a1a0a] text-xs font-semibold uppercase tracking-[1px] hover:bg-[#5a3a1a] hover:text-[#f8f1e8] transition"
                  >
                    Send another
                  </button>
                </div>
              ) : !contactInfo.formEnabled ? (
                <div className="text-center py-8">
                  <p className="text-lg font-semibold text-[#2a1a0a] mb-2">Contact form is currently disabled</p>
                  <p className="text-sm text-[#8a6a4a]">Please reach out directly via email.</p>
                  <a href={`mailto:${contactInfo.email}`} className="mt-4 inline-block px-6 py-2 border-2 border-[#5a3a1a] text-[#2a1a0a] text-xs font-semibold uppercase tracking-[1px] hover:bg-[#5a3a1a] hover:text-[#f8f1e8] transition">
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
                        <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[#5a3a1a] mb-1.5">{field.label}</label>
                        <input
                          type={field.type}
                          name={field.name}
                          required
                          className="w-full bg-transparent border border-[#5a3a1a]/30 px-4 py-3 text-sm text-[#2a1a0a] placeholder-[#5a3a1a]/40 focus:outline-none focus:border-[#5a3a1a]/60"
                        />
                      </div>
                    ))}
                    {error && activeTab === 'booking' && <p className="text-red-600 text-sm mb-4">{error}</p>}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-[#5a3a1a] text-[#f8f1e8] text-sm font-semibold uppercase tracking-[2px] hover:bg-[#2a1a0a] transition disabled:opacity-50"
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
                        <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[#5a3a1a] mb-1.5">{field.label}</label>
                        <input
                          type={field.type}
                          name={field.name}
                          required
                          className="w-full bg-transparent border border-[#5a3a1a]/30 px-4 py-3 text-sm text-[#2a1a0a] placeholder-[#5a3a1a]/40 focus:outline-none focus:border-[#5a3a1a]/60"
                        />
                      </div>
                    ))}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[#5a3a1a] mb-1.5">Message *</label>
                      <textarea
                        name="message"
                        required
                        rows={4}
                        className="w-full bg-transparent border border-[#5a3a1a]/30 px-4 py-3 text-sm text-[#2a1a0a] placeholder-[#5a3a1a]/40 focus:outline-none focus:border-[#5a3a1a]/60 resize-y min-h-[80px]"
                      />
                    </div>
                    {error && activeTab === 'private' && <p className="text-red-600 text-sm mb-4">{error}</p>}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-[#5a3a1a] text-[#f8f1e8] text-sm font-semibold uppercase tracking-[2px] hover:bg-[#2a1a0a] transition disabled:opacity-50"
                    >
                      {submitting ? 'Sending...' : 'Submit'}
                    </button>
                  </form>

                  {/* Bottom buttons */}
                  <div className="mt-6 pt-6 border-t border-[#c4b498]/30 flex flex-col sm:flex-row gap-3">
                    <a
                      href="/assets/press-pack.pdf"
                      download
                      className="flex-1 py-3 border-2 border-[#5a3a1a] text-[#2a1a0a] text-xs font-semibold uppercase tracking-[1.5px] text-center hover:bg-[#5a3a1a] hover:text-[#f8f1e8] transition"
                    >
                      Press Pack
                    </a>
                    <a
                      href="/share-music"
                      className="flex-1 py-3 border-2 border-[#5a3a1a] text-[#2a1a0a] text-xs font-semibold uppercase tracking-[1.5px] text-center hover:bg-[#5a3a1a] hover:text-[#f8f1e8] transition"
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
