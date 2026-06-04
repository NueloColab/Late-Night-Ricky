'use client';

import { useState, useRef } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function ShareMusicPage() {
  const [email, setEmail] = useState('');
  const [artistName, setArtistName] = useState('');
  const [trackTitle, setTrackTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) { setError('File must be under 20MB'); return; }
    const ok = ['audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/wave'].includes(f.type) || /\.(mp3|wav)$/i.test(f.name);
    if (!ok) { setError('Only MP3 and WAV files accepted'); return; }
    setError(''); setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !email.includes('@')) { setError('Valid email required'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('artistName', artistName);
      formData.append('trackTitle', trackTitle);
      if (file) formData.append('file', file);
      const res = await fetch('/api/submissions', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setSuccess(true); setEmail(''); setArtistName(''); setTrackTitle(''); setFile(null);
    } catch (err: any) { setError(err.message || 'Something went wrong'); }
    finally { setUploading(false); }
  };

  if (success) return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="border-b-2 border-[#111] pt-24 pb-5 px-6">
          <div className="max-w-[1200px] mx-auto"><h1 className="text-[clamp(48px,10vw,120px)] font-black tracking-[-3px] uppercase leading-[0.9] text-[#111]">Share Your Music</h1></div>
        </div>
        <div className="max-w-[800px] mx-auto px-6 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[#1B3A4C] flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h2 className="text-[clamp(28px,4vw,48px)] font-black uppercase tracking-[-1px] mb-4 text-[#111]">Thank You</h2>
          <p className="text-sm text-[#5B7A8E] uppercase tracking-[1px] mb-8">Your track has been submitted. I&apos;ll give it a listen.</p>
          <button onClick={() => setSuccess(false)} className="inline-block px-8 py-3.5 border-2 border-[#111] rounded-full text-[#111] text-sm font-semibold uppercase tracking-[1.5px] hover:bg-[#111] hover:text-white transition">Submit Another Track</button>
        </div>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="border-b-2 border-[#111] pt-24 pb-5 px-6">
          <div className="max-w-[1200px] mx-auto"><h1 className="text-[clamp(48px,10vw,120px)] font-black tracking-[-3px] uppercase leading-[0.9] text-[#111]">Share Your Music</h1></div>
        </div>
        <div className="max-w-[800px] mx-auto px-6 py-20">
          <p className="font-black text-[clamp(28px,4vw,48px)] uppercase leading-tight tracking-[-1px] mb-12 text-[#111] max-w-[600px]">I&apos;m always on the lookout for new music to play, so send me your tracks</p>
          {error && <div className="bg-[#E3E8ED] border border-[#8FA8BE] rounded-lg p-4 mb-8 text-sm text-[#1B3A4C]">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-7">
              <label className="block text-xs font-semibold uppercase tracking-[1.5px] mb-2">Email <span className="text-[#6B8FAB]">*</span></label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="w-full border-b-2 border-[#111] py-3 px-0 text-[15px] bg-transparent outline-none focus:border-[#1B3A4C] transition" />
            </div>
            <div className="mb-7">
              <label className="block text-xs font-semibold uppercase tracking-[1.5px] mb-2">Artist Name</label>
              <input type="text" value={artistName} onChange={e => setArtistName(e.target.value)} placeholder="Your artist name" className="w-full border-b-2 border-[#111] py-3 px-0 text-[15px] bg-transparent outline-none focus:border-[#1B3A4C] transition" />
            </div>
            <div className="mb-7">
              <label className="block text-xs font-semibold uppercase tracking-[1.5px] mb-2">Track Title</label>
              <input type="text" value={trackTitle} onChange={e => setTrackTitle(e.target.value)} placeholder="Your track name" className="w-full border-b-2 border-[#111] py-3 px-0 text-[15px] bg-transparent outline-none focus:border-[#1B3A4C] transition" />
            </div>
            <div className="mb-10">
              <label className="block text-xs font-semibold uppercase tracking-[1.5px] mb-2">Track File</label>
              <div className={`upload-area ${dragOver ? 'dragover' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={e => { e.preventDefault(); setDragOver(false); }}
                onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); }}
                onClick={() => fileInputRef.current?.click()}>
                <input ref={fileInputRef} type="file" accept="audio/mp3,audio/mpeg,audio/wav" onChange={e => handleFile(e.target.files?.[0] || null)} />
                <button type="button" className="upload-btn bg-[#111] text-white px-10 py-4 text-sm font-semibold uppercase tracking-[2px] hover:bg-[#1B3A4C] transition inline-block">{file ? 'Change File' : 'Upload your track'}</button>
                <p className="text-sm text-[#5B7A8E] mt-5">Click to browse or drag &amp; drop your MP3 / WAV (max 20MB)</p>
                {file && <p className="text-sm text-[#1B3A4C] font-medium mt-4">Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)</p>}
              </div>
            </div>
            <button type="submit" disabled={uploading || !email} className="w-full py-4 bg-[#111] text-white text-sm font-semibold uppercase tracking-[2px] hover:bg-[#1B3A4C] transition disabled:opacity-40 disabled:cursor-not-allowed">
              {uploading ? 'Submitting…' : 'Submit Track'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}