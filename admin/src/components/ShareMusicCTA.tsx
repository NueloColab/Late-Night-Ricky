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
      <section className="garrix-cta-section">
        <div className="garrix-cta-bg" style={{ backgroundImage: `url('/assets/press-bg2.jpg')` }} />
        <div className="garrix-cta-overlay" />
        <div className="garrix-cta-content">
          <h2 className="garrix-heading" style={{ fontSize: 'clamp(32px, 4vw, 56px)' }}>TRACK SENT</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '12px' }}>Thanks for sharing. Your music has been uploaded successfully.</p>
          <button
            onClick={() => { setStatus('idle'); setFile(null); setEmail(''); setArtistName(''); setInstagram(''); setTrackTitle(''); setExpanded(false); }}
            className="garrix-btn garrix-btn-outline"
            style={{ marginTop: '24px' }}
          >
            SEND ANOTHER
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="garrix-cta-section">
      <div className="garrix-cta-bg" style={{ backgroundImage: `url('/assets/press-bg2.jpg')` }} />
      <div className="garrix-cta-overlay" />
      <div className="garrix-cta-content">
        <h2 className="garrix-heading" style={{ fontSize: 'clamp(32px, 4vw, 56px)' }}>SHARE YOUR MUSIC</h2>
        <p className="garrix-body-text" style={{ maxWidth: '500px', margin: '0 auto 32px' }}>
          I&apos;m always on the lookout for new music to play, so send me your tracks
        </p>

        {!expanded ? (
          <button
            onClick={() => setExpanded(true)}
            className="garrix-btn garrix-btn-white"
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
              style={{ borderColor: dragOver ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)' }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/mp3,audio/mpeg,audio/wav"
                style={{ display: 'none' }}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <span className="garrix-cta-upload-btn">UPLOAD YOUR TRACK</span>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '12px' }}>Click the button and upload your file in mp3 320 kbps</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '4px' }}>Max 20MB — MP3 or WAV only</p>
              {file && (
                <p style={{ fontSize: '13px', color: 'rgba(42,196,182,0.9)', marginTop: '8px' }}>Selected: {file.name}</p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <input
                type="text"
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                placeholder="Track name"
                className="garrix-cta-input"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                className="garrix-cta-input"
              />
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="Your Instagram"
                className="garrix-cta-input"
              />
            </div>

            {status === 'error' && (
              <p style={{ color: 'rgba(255,100,100,0.9)', fontSize: '13px', marginTop: '8px', textAlign: 'center' }}>
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
                background: canSubmit ? '#2EC4B6' : 'rgba(255,255,255,0.08)',
              }}
            >
              {submitting ? 'UPLOADING...' : 'SUBMIT TRACK'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}