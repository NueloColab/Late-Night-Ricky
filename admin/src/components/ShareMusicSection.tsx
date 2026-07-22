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
  const [genre, setGenre] = useState('');
  const [bpm, setBpm] = useState('');
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

  const uploadToCloudinary = async (file: File): Promise<string> => {
    // 1. Get signed upload params
    const signRes = await fetch('/api/cloudinary/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: 'nuelo/late-night-ricky/tracks' }),
    });
    if (!signRes.ok) throw new Error('Failed to get upload signature');
    const { signature, timestamp, folder, apiKey, cloudName } = await signRes.json();

    // 2. Upload directly to Cloudinary from browser
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('api_key', apiKey);
    uploadData.append('timestamp', String(timestamp));
    uploadData.append('signature', signature);
    uploadData.append('folder', folder);

    const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: uploadData,
    });
    if (!cloudRes.ok) {
      const err = await cloudRes.json();
      throw new Error(err.error?.message || 'Cloudinary upload failed');
    }
    const cloudData = await cloudRes.json();
    return cloudData.secure_url;
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
      // Upload file directly to Cloudinary from browser
      const fileUrl = await uploadToCloudinary(file);

      // Submit metadata + Cloudinary URL
      const res = await fetch('/api/public/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          artistName: artistName || null,
          trackTitle: trackTitle || null,
          genre: genre || null,
          bpm: bpm || null,
          instagramHandle: null,
          fileUrl,
          fileName: file.name,
          fileSize: file.size,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }
      setStatus('success');
      setFile(null);
      setArtistName('');
      setTrackTitle('');
      setGenre('');
      setBpm('');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Upload failed. Please try again or email latenightricky@gmail.com directly.');
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
            <p className="text-sm text-[#A8D5F0]">Thanks for sharing. Your music has been uploaded successfully.</p>
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
            <button type="button" className="inline-block px-10 py-4 bg-white text-[#111] text-sm font-semibold uppercase tracking-[2px] hover:bg-[#A8D5F0] transition">
              {file ? 'Change track' : 'Upload your track'}
            </button>
            <p className="mt-4 text-sm text-[#A8D5F0]">Click the button and upload your file in mp3 320 kbps</p>
            <p className="mt-2 text-xs text-[#C5E5F8]">Max 20MB — MP3 or WAV only</p>
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
                className="w-full px-5 py-3 border-2 border-white/50 text-white placeholder-[#A8D5F0] text-sm uppercase tracking-[1px] focus:outline-none focus:border-white bg-transparent"
              />
              <input
                type="text"
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                placeholder="Track title *"
                required
                className="w-full px-5 py-3 border-2 border-white/50 text-white placeholder-[#A8D5F0] text-sm uppercase tracking-[1px] focus:outline-none focus:border-white bg-transparent"
              />
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Artist name *"
                required
                className="w-full px-5 py-3 border-2 border-white/50 text-white placeholder-[#A8D5F0] text-sm uppercase tracking-[1px] focus:outline-none focus:border-white bg-transparent"
              />
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Genre (e.g. House, Hip-Hop, Afrobeat)"
                className="w-full px-5 py-3 border-2 border-white/50 text-white placeholder-[#A8D5F0] text-sm uppercase tracking-[1px] focus:outline-none focus:border-white bg-transparent"
              />
              <input
                type="number"
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                placeholder="BPM (e.g. 128)"
                min="40"
                max="300"
                className="w-full px-5 py-3 border-2 border-white/50 text-white placeholder-[#A8D5F0] text-sm uppercase tracking-[1px] focus:outline-none focus:border-white bg-transparent"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-red-400 text-sm text-center mb-4">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !file}
            className="inline-block px-10 py-4 bg-white text-[#111] text-sm font-semibold uppercase tracking-[2px] hover:bg-[#A8D5F0] transition w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Uploading...' : 'Submit Track'}
          </button>
        </form>
      </div>
    </section>
  );
}
