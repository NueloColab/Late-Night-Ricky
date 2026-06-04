'use client';

import { useState } from 'react';
import { submitMusic } from '@/lib/api';

export default function ShareMusic() {
  const [email, setEmail] = useState('');
  const [artistName, setArtistName] = useState('');
  const [trackTitle, setTrackTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !email.includes('@')) {
      setError('Valid email required');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('artistName', artistName);
    formData.append('trackTitle', trackTitle);
    if (file) formData.append('file', file);

    try {
      const result = await submitMusic(formData);
      if (result.success) {
        setSuccess(true);
        setEmail('');
        setArtistName('');
        setTrackTitle('');
        setFile(null);
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch {
      setError('Network error');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#E3E8ED] py-20 px-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-bold text-[#1B3A4C] tracking-tight mb-2">Share Your Music</h1>
        <p className="text-[#8FA8BE] text-sm font-medium uppercase tracking-wide mb-10">Submit tracks for feedback & collaboration</p>

        {success ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-[#1B3A4C] text-white flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h2 className="text-xl font-bold text-[#1B3A4C] mb-2">Track Received</h2>
            <p className="text-[#8FA8BE]">We'll be in touch.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm space-y-6">
            <div>
              <label className="block text-xs font-semibold text-[#1B3A4C] uppercase tracking-widest mb-2">Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#E3E8ED] rounded-lg focus:border-[#1B3A4C] focus:outline-none"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1B3A4C] uppercase tracking-widest mb-2">Artist Name</label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#E3E8ED] rounded-lg focus:border-[#1B3A4C] focus:outline-none"
                placeholder="Your artist name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1B3A4C] uppercase tracking-widest mb-2">Track Title</label>
              <input
                type="text"
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#E3E8ED] rounded-lg focus:border-[#1B3A4C] focus:outline-none"
                placeholder="Track name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1B3A4C] uppercase tracking-widest mb-2">Upload Track (MP3/WAV, max 20MB)</label>
              <div className="border-2 border-dashed border-[#E3E8ED] rounded-lg p-6 text-center hover:border-[#1B3A4C] transition-colors">
                <input
                  type="file"
                  accept=".mp3,.wav,audio/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="track-upload"
                />
                <label htmlFor="track-upload" className="cursor-pointer">
                  <p className="text-[#8FA8BE] text-sm">{file ? file.name : 'Drag & drop or click to select'}</p>
                </label>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#1B3A4C] text-white rounded-lg font-semibold uppercase tracking-wide text-sm hover:bg-[#2a4a5c] transition-colors disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Submit Track'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
