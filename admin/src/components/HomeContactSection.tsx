'use client';

import { useState, useEffect } from 'react';

export default function HomeContactSection() {
  const [contactInfo, setContactInfo] = useState({
    email: '',
    heading: '',
    image: '',
    formEnabled: true,
  });
  const [cmsLoaded, setCmsLoaded] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    youtube: '',
    spotify: '',
    appleMusic: '',
    tiktok: '',
    twitter: '',
    facebook: '',
  });
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('booking');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSections() {
      try {
        // Fetch home contact section (primary source)
        const homeRes = await fetch('/api/public/sections?page=home');
        const homeData = await homeRes.json();
        const homeSections = homeData.sections || [];
        
        const contactSection = homeSections.find((s: any) => s.section === 'contact_section');
        if (contactSection?.content) {
          const c = typeof contactSection.content === 'string' ? JSON.parse(contactSection.content) : contactSection.content;
          if (c.bookingEmail) setContactInfo(prev => ({ ...prev, email: c.bookingEmail }));
          if (c.heading) setContactInfo(prev => ({ ...prev, heading: c.heading }));
          if (c.image) setContactInfo(prev => ({ ...prev, image: c.image }));
          if (c.instagramUrl) setSocialLinks(prev => ({ ...prev, instagram: c.instagramUrl }));
          if (c.youtubeUrl) setSocialLinks(prev => ({ ...prev, youtube: c.youtubeUrl }));
          if (c.spotifyUrl) setSocialLinks(prev => ({ ...prev, spotify: c.spotifyUrl }));
          if (c.appleMusicUrl) setSocialLinks(prev => ({ ...prev, appleMusic: c.appleMusicUrl }));
          if (c.tiktokUrl) setSocialLinks(prev => ({ ...prev, tiktok: c.tiktokUrl }));
          if (c.twitterUrl) setSocialLinks(prev => ({ ...prev, twitter: c.twitterUrl }));
          if (c.facebookUrl) setSocialLinks(prev => ({ ...prev, facebook: c.facebookUrl }));
        }

        // Also fetch contact page for form/image settings (fallback)
        const res = await fetch('/api/public/sections?page=contact');
        const data = await res.json();
        const sections = data.sections || [];
        const formSection = sections.find((s: any) => s.section === 'form');
        if (formSection?.isActive === false) {
          setContactInfo(prev => ({ ...prev, formEnabled: false }));
        }
        const imageSection = sections.find((s: any) => s.section === 'image');
        if (imageSection?.content) {
          const img = typeof imageSection.content === 'string' ? JSON.parse(imageSection.content) : imageSection.content;
          // Only use contact/image as fallback if home/contact_section didn't provide an image
          const contactContent = contactSection?.content ? (typeof contactSection.content === 'string' ? JSON.parse(contactSection.content) : contactSection.content) : null;
          if (!contactContent?.image) {
            if (Array.isArray(img) && img[0]) setContactInfo(prev => ({ ...prev, image: img[0] }));
            else if (typeof img === 'string') setContactInfo(prev => ({ ...prev, image: img }));
          }
        }
      } catch {
        // keep defaults
      } finally {
        setCmsLoaded(true);
        // Apply hardcoded defaults for any fields CMS didn't populate
        setContactInfo(prev => ({
          ...prev,
          email: prev.email || 'samir@wearemediahive.com',
          heading: prev.heading || 'Get in Touch',
          image: prev.image || '/assets/ricky-contact-studio-2.jpg',
        }));
        setSocialLinks(prev => ({
          ...prev,
          instagram: prev.instagram || 'https://instagram.com/latenightricky',
          youtube: prev.youtube || 'https://youtube.com/@latenightricky',
          spotify: prev.spotify || 'https://open.spotify.com/artist/latenightricky',
          appleMusic: prev.appleMusic || 'https://music.apple.com/gb/artist/late-night-ricky/1759491226',
          tiktok: prev.tiktok || 'https://tiktok.com/@latenightricky',
          twitter: prev.twitter || 'https://twitter.com/latenightricky',
          facebook: prev.facebook || 'https://facebook.com/latenightricky',
        }));
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
        {cmsLoaded && contactInfo.image && (
          <img
            src={contactInfo.image}
            alt="Late Night Ricky"
            className="w-full h-full object-cover object-center"
            style={{ filter: 'grayscale(100%)' }}
          />
        )}
        <div className="absolute inset-0 bg-[#2a1a0a]/60" />
      </div>

      {/* Contact content on the left */}
      <div className="relative z-10 flex items-center min-h-[calc(100dvh-70px)] px-16 md:px-28 py-20">
        <div className="w-full max-w-[600px]">
          {!expanded ? (
            <div className="text-left">
              <span className="text-[10px] md:text-[11px] tracking-[0.25em] uppercase text-[#d4c4a8]/80 font-medium block mb-4">{contactInfo.heading || 'Get in Touch'}</span>
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
                <div>
                  <div className={activeTab === 'booking' ? 'overflow-hidden transition-all duration-300 ease-in-out max-h-[500px] opacity-100' : 'overflow-hidden transition-all duration-300 ease-in-out max-h-0 opacity-0'}>
                    <form onSubmit={handleSubmit} data-tab="booking">
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
                          className="w-full min-w-0 bg-[#2a1a0a]/30 border border-[#e8d4b8]/20 px-4 py-3 text-sm text-[#e8d4b8] placeholder-[#d4c4a8]/40 focus:outline-none focus:border-[#e8d4b8]/50"
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
                  </div>

                  <div className={activeTab === 'private' ? 'overflow-hidden transition-all duration-300 ease-in-out max-h-[400px] opacity-100' : 'overflow-hidden transition-all duration-300 ease-in-out max-h-0 opacity-0'}>
                  <form onSubmit={handleSubmit} data-tab="private">
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
                          className="w-full min-w-0 bg-[#2a1a0a]/30 border border-[#e8d4b8]/20 px-4 py-3 text-sm text-[#e8d4b8] placeholder-[#d4c4a8]/40 focus:outline-none focus:border-[#e8d4b8]/50"
                        />
                      </div>
                    ))}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[#d4c4a8]/80 mb-1.5">Message *</label>
                      <textarea
                        name="message"
                        required
                        rows={4}
                        className="w-full min-w-0 bg-[#2a1a0a]/30 border border-[#e8d4b8]/20 px-4 py-3 text-sm text-[#e8d4b8] placeholder-[#d4c4a8]/40 focus:outline-none focus:border-[#e8d4b8]/50 resize-y min-h-[80px]"
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
                  </div>

                  {/* Bottom buttons */}
                  <div className="mt-6 pt-6 border-t border-[#e8d4b8]/20 flex flex-col sm:flex-row gap-3">
                    <a
                      href="/press-pack"
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
