'use client';

import { useState, useRef, FormEvent } from 'react';

interface ShareMusicSectionProps {
  headline: string;
  description: string;
}

export default function ShareMusicSection({ headline, description }: ShareMusicSectionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [email, setEmail] = useState('');
  const [artistName, setArtistName] = useState('');
  const [trackTitle, setTrackTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    if (!f) return;
    setFile(f);
    setStatus('idle');
    setErrorMsg('');
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!file) {
      setErrorMsg('Please select a track to upload.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setStatus('idle');

    try {
      const formData = new FormData();
      formData.append('email', email);
      if (artistName) formData.append('artistName', artistName);
      if (trackTitle) formData.append('trackTitle', trackTitle);
      formData.append('file', file);

      const res = await fetch('/api/public/submissions', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      setStatus('success');
      setFile(null);
      setArtistName('');
      setTrackTitle('');
      setEmail('');
    } catch {
      setStatus('error');
      setErrorMsg('Upload failed. Please try again or email bookings@latenightricky.com directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'success') {
    return (
      <section id="share-music" className="reveal textured-bg relative z-10 pt-32 pb-28 md:py-28 text-center">
        <div className="relative z-10 max-w-[700px] mx-auto px-6">
          <h2 className="heading text-[clamp(36px,5vw,56px)] mb-4 text-white">{headline}</h2>
          <div className="max-w-[600px] mx-auto border-2 border-white p-12 text-center">
            <p className="text-2xl font-black uppercase tracking-[-1px] text-white mb-2">Track Sent!</p>
            <p className="text-sm text-[#b0b0b0]">Thanks for sharing. Your music has been uploaded successfully.</p>
            <button
              onClick={() => { setStatus('idle'); setShowForm(false); }}
              className="mt-6 px-8 py-3 border-2 border-white text-white text-sm font-semibold uppercase tracking-[1.5px] hover:bg-white hover:text-[#111] transition"
            >
              Send Another
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="share-music" className="reveal textured-bg relative z-10 pt-32 pb-28 md:py-28 text-center">
      <div className="relative z-10 max-w-[700px] mx-auto px-6">
        <h2 className="heading text-[clamp(36px,5vw,56px)] mb-4 text-white">{headline}</h2>
        <p className="text-[clamp(22px,3vw,36px)] font-black uppercase leading-tight tracking-[-1px] mb-12 text-white">{description}</p>

        <form onSubmit={handleSubmit} className="max-w-[600px] mx-auto">
          {/* File drop zone */}
          <div
            className={`border-[3px] border-dashed p-12 md:p-16 text-center transition-colors cursor-pointer mb-8 ${
              dragOver ? 'border-white bg-white/10' : 'border-white/50 hover:border-white hover:bg-white/5'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mp3,audio/mpeg,audio/wav"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />
            <button type="button" className="inline-block px-10 py-4 bg-white text-[#111] text-sm font-semibold uppercase tracking-[2px] hover:bg-[#b0b0b0] transition">
              {file ? 'Change track' : 'Upload your track'}
            </button>
            <p className="mt-4 text-sm text-[#b0b0b0]">Click the button and upload your file in mp3 320 kbps</p>
            <p className="mt-2 text-xs text-[#d0d0d0]">Max 20MB — MP3 or WAV only</p>
            {file && (
              <p className="mt-4 text-sm text-white font-medium">Selected: {file.name}</p>
            )}
          </div>

          {/* Expandable form fields */}
          <div className={`overflow-hidden transition-all duration-500 ${showForm ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-5 mb-8">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email *"
                required
                className="w-full px-5 py-3 border-2 border-white/50 text-white placeholder-[#b0b0b0] text-sm uppercase tracking-[1px] focus:outline-none focus:border-white bg-transparent"
              />
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Artist name"
                className="w-full px-5 py-3 border-2 border-white/50 text-white placeholder-[#b0b0b0] text-sm uppercase tracking-[1px] focus:outline-none focus:border-white bg-transparent"
              />
              <input
                type="text"
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                placeholder="Track title"
                className="w-full px-5 py-3 border-2 border-white/50 text-white placeholder-[#b0b0b0] text-sm uppercase tracking-[1px] focus:outline-none focus:border-white bg-transparent"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-red-400 text-sm text-center mb-4">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !file}
            className="inline-block px-10 py-4 bg-white text-[#111] text-sm font-semibold uppercase tracking-[2px] hover:bg-[#b0b0b0] transition w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Uploading...' : 'Submit Track'}
          </button>
        </form>
      </div>
    </section>
  );
}
