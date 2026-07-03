'use client';

import { useState, useRef, FormEvent } from 'react';

export default function ShareMusicCTA() {
  const [expanded, setExpanded] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState('');
  const [artistName, setArtistName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [trackTitle, setTrackTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = !!email && !!file && !submitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('email', email);
      if (artistName) formData.append('artistName', artistName);
      if (trackTitle) formData.append('trackTitle', trackTitle);
      if (instagram) formData.append('instagram', instagram);
      formData.append('file', file!);

      const res = await fetch('/api/public/submissions', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'success') {
    return (
      <section className="relative py-20 md:py-28 px-6 md:px-14 overflow-hidden bg-[#f8f1e8]">
        <div className="max-w-[1400px] mx-auto">
          <div className="relative text-center reveal-fade border-t border-[#c4b498]/20 pt-12 pb-10 rounded-xl overflow-hidden">
            {/* Background image */}
            <div className="absolute inset-0 z-0">
              <img src="/assets/venues-bg.jpg" alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-[#2a1a0a]/70" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#5c4328]/40 via-transparent to-[#2a1a0a]/70" />
            </div>
            <div className="relative z-10 max-w-[800px] mx-auto">
              <h2 className="text-[clamp(32px,4vw,56px)] font-black uppercase tracking-[-1px] leading-[0.95] text-[#e8d4b8]" style={{ fontFamily: "'Oswald', sans-serif" }}>TRACK SENT</h2>
              <p className="text-[13px] md:text-[14px] text-[#d4c4a8]/70 mt-3">Thanks for sharing. Your music has been uploaded successfully.</p>
              <button
                onClick={() => { setStatus('idle'); setFile(null); setEmail(''); setArtistName(''); setInstagram(''); setTrackTitle(''); setExpanded(false); }}
                className="garrix-btn garrix-btn-outline mt-6"
                style={{ borderColor: '#e8d4b8', color: '#e8d4b8' }}
              >
                SEND ANOTHER
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 md:py-28 px-6 md:px-14 overflow-hidden bg-[#f8f1e8]">
      <div className="max-w-[1400px] mx-auto">
        <div className="relative text-center reveal-fade border-t border-[#c4b498]/20 pt-12 pb-10 rounded-xl overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0 z-0">
            <img src="/assets/venues-bg.jpg" alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-[#2a1a0a]/70" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#5c4328]/40 via-transparent to-[#2a1a0a]/70" />
          </div>

          <div className="relative z-10 max-w-[800px] mx-auto">
            <span className="text-[10px] md:text-[11px] tracking-[0.25em] uppercase text-[#d4c4a8]/60 font-medium block mb-4">Listen &amp; Download</span>
            <h2 className="text-[clamp(32px,4vw,56px)] font-black uppercase tracking-[-1px] leading-[0.95] text-[#e8d4b8] mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>SHARE YOUR MUSIC</h2>
            <p className="text-[13px] md:text-[14px] text-[#d4c4a8]/80 max-w-[500px] mx-auto mb-8">
              I&apos;m always on the lookout for new music to play, so send me your tracks
            </p>

            {!expanded ? (
              <button
                onClick={() => setExpanded(true)}
                className="garrix-btn garrix-btn-outline"
                style={{ borderColor: '#e8d4b8', color: '#e8d4b8' }}
              >
                UPLOAD YOUR TRACK
              </button>
            ) : (
              <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                <div className="garrix-cta-dropzone"
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ borderColor: dragOver ? '#e8d4b8' : 'rgba(232,212,184,0.2)', background: 'rgba(232,212,184,0.03)' }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/mp3,audio/mpeg,audio/wav"
                    style={{ display: 'none' }}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <span className="garrix-cta-upload-btn" style={{ color: '#e8d4b8' }}>UPLOAD YOUR TRACK</span>
                  <p style={{ fontSize: '13px', color: 'rgba(212,196,168,0.6)', marginTop: '12px' }}>Click the button and upload your file in mp3 320 kbps</p>
                  <p style={{ fontSize: '11px', color: 'rgba(212,196,168,0.4)', marginTop: '4px' }}>Max 20MB — MP3 or WAV only</p>
                  {file && (
                    <p style={{ fontSize: '13px', color: '#e8d4b8', marginTop: '8px' }}>Selected: {file.name}</p>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                  <input
                    type="text"
                    value={trackTitle}
                    onChange={(e) => setTrackTitle(e.target.value)}
                    placeholder="Track name"
                    className="garrix-cta-input"
                    style={{ background: 'rgba(232,212,184,0.05)', borderColor: 'rgba(232,212,184,0.15)', color: '#e8d4b8' }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    required
                    className="garrix-cta-input"
                    style={{ background: 'rgba(232,212,184,0.05)', borderColor: 'rgba(232,212,184,0.15)', color: '#e8d4b8' }}
                  />
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="Your Instagram"
                    className="garrix-cta-input"
                    style={{ background: 'rgba(232,212,184,0.05)', borderColor: 'rgba(232,212,184,0.15)', color: '#e8d4b8' }}
                  />
                </div>

                {status === 'error' && (
                  <p style={{ color: '#e8d4b8', fontSize: '13px', marginTop: '8px', textAlign: 'center' }}>
                    Upload failed. Please try again.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="garrix-cta-submit"
                  style={{
                    opacity: canSubmit ? 1 : 0.3,
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    background: canSubmit ? '#e8d4b8' : 'rgba(232,212,184,0.08)',
                    color: '#2a1a0a',
                  }}
                >
                  {submitting ? 'UPLOADING...' : 'SUBMIT TRACK'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}