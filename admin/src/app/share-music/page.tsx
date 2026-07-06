'use client';

import { useState, useRef, FormEvent } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
export const dynamic = 'force-dynamic';

export default function ShareMusicPage() {
  const [instagramHandle, setInstagramHandle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [email, setEmail] = useState('');
  const [artistName, setArtistName] = useState('');
  const [trackTitle, setTrackTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    if (!f) return;
    setFile(f);
    setStatus('idle');
    setErrorMsg('');
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
      if (instagramHandle) formData.append('instagramHandle', instagramHandle);
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
      setInstagramHandle('');
    } catch {
      setStatus('error');
      setErrorMsg('Upload failed. Please try again or email bookings@latenightricky.com directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        <div className="border-b-2 border-[#111] pt-24 pb-5 px-8">
          <div className="max-w-[1200px] mx-auto">
            <h1 className="text-[clamp(48px,10vw,120px)] font-black tracking-[-3px] uppercase leading-[0.9] text-[#111]">Share Your Music</h1>
          </div>
        </div>

        <div className="max-w-[800px] mx-auto px-8 py-20">
          <p className="text-[clamp(28px,4vw,48px)] font-black uppercase leading-tight tracking-[-1px] mb-12 text-[#111] max-w-[600px]">
            I&apos;m always on the lookout for new music to play, so send me your tracks
          </p>

          {status === 'success' ? (
            <div className="max-w-[600px] mx-auto border-2 border-[#152a47] p-12 text-center">
              <p className="text-2xl font-black uppercase tracking-[-1px] text-[#152a47] mb-2">Track Sent!</p>
              <p className="text-sm text-[#a0a0a0]">Thanks for sharing. Your music has been uploaded successfully.</p>
              <button onClick={() => setStatus('idle')} className="mt-6 px-8 py-3 border-2 border-[#111] text-[#111] text-sm font-semibold uppercase tracking-[1.5px] hover:bg-[#0d1f3d] hover:text-white transition">
                Send Another
              </button>
            </div>
          ) : (
            <form id="uploadForm" onSubmit={handleSubmit}>
              <div className="space-y-5 max-w-[600px] mx-auto mb-8">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email *"
                  required
                  className="w-full px-5 py-3 border-2 border-[#111] text-[#111] placeholder-[#A8D5F0] text-sm uppercase tracking-[1px] focus:outline-none focus:border-[#152a47]"
                />
                <input
                  type="text"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="Artist name"
                  className="w-full px-5 py-3 border-2 border-[#111] text-[#111] placeholder-[#A8D5F0] text-sm uppercase tracking-[1px] focus:outline-none focus:border-[#152a47]"
                />
                <input
                  type="text"
                  value={trackTitle}
                  onChange={(e) => setTrackTitle(e.target.value)}
                  placeholder="Track title"
                  className="w-full px-5 py-3 border-2 border-[#111] text-[#111] placeholder-[#A8D5F0] text-sm uppercase tracking-[1px] focus:outline-none focus:border-[#152a47]"
                />
                <input
                  type="text"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  placeholder="Instagram handle (e.g. @latenightricky)"
                  className="w-full px-5 py-3 border-2 border-[#111] text-[#111] placeholder-[#A8D5F0] text-sm uppercase tracking-[1px] focus:outline-none focus:border-[#152a47]"
                />
              </div>

              <div
                className={`border-[3px] border-dashed p-12 md:p-16 text-center transition-colors cursor-pointer max-w-[600px] mx-auto mb-8 ${
                  dragOver ? 'border-[#152a47] bg-[rgba(21,42,71,0.04)]' : 'border-[#111] hover:border-[#152a47] hover:bg-[rgba(21,42,71,0.02)]'
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
                <button type="button" className="inline-block px-10 py-4 bg-[#0d1f3d] text-white text-sm font-semibold uppercase tracking-[2px] hover:bg-[#152a47] transition">
                  Upload your track
                </button>
                <p className="mt-4 text-sm text-[#a0a0a0]">Click the button and upload your file in mp3 320 kbps</p>
                <p className="mt-2 text-xs text-[#C5E5F8]">Max 20MB — MP3 or WAV only</p>
                {file && (
                  <p className="mt-4 text-sm text-[#152a47] font-medium">Selected: {file.name}</p>
                )}
              </div>

              {errorMsg && (
                <p className="text-red-600 text-sm text-center mb-4 max-w-[600px] mx-auto">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-block px-10 py-4 bg-[#0d1f3d] text-white text-sm font-semibold uppercase tracking-[2px] hover:bg-[#152a47] transition w-full max-w-[600px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Uploading...' : 'Submit Track'}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
