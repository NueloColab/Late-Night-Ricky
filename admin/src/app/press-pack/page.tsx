'use client';

import { useState, useEffect } from 'react';

export default function PressPackPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [correctPin, setCorrectPin] = useState('');
  const [pressPackUrl, setPressPackUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    async function fetchSection() {
      try {
        const res = await fetch('/api/public/sections?page=about');
        const data = await res.json();
        const sections = data.sections || [];
        const intro = sections.find((s: any) => s.section === 'intro');
        if (intro?.content) {
          const c = typeof intro.content === 'string' ? JSON.parse(intro.content) : intro.content;
          setCorrectPin(c.pressPackPin || '');
          setPressPackUrl(c.pressPackLink || '/assets/press-pack.pdf');
        }
      } catch {
        // keep defaults
      }
      setLoading(false);
    }
    fetchSection();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!correctPin) {
      // No PIN set, just download
      setUnlocked(true);
      return;
    }
    if (pin === correctPin) {
      setUnlocked(true);
      setError('');
    } else {
      setError('Incorrect PIN. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <p className="text-[#e8d4b8] text-sm tracking-[3px] uppercase">Loading...</p>
      </div>
    );
  }

  if (unlocked) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <p className="text-[10px] md:text-[11px] tracking-[0.25em] uppercase text-[#d4c4a8]/80 font-medium mb-4">Late Night Ricky</p>
          <h1 className="text-[clamp(32px,4vw,56px)] font-black uppercase tracking-[-1px] leading-[0.95] text-[#e8d4b8] mb-8" style={{ fontFamily: "'Oswald', sans-serif" }}>PRESS PACK</h1>
          <p className="text-[#d4c4a8]/80 text-sm mb-8">Your download is ready.</p>
          <a
            href={pressPackUrl}
            download
            className="inline-block px-8 py-4 bg-[#e8d4b8] text-[#2a1a0a] text-sm font-semibold uppercase tracking-[2px] hover:bg-[#d4c4a8] transition"
          >
            Download Press Pack
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <p className="text-[10px] md:text-[11px] tracking-[0.25em] uppercase text-[#d4c4a8]/80 font-medium mb-4">Late Night Ricky</p>
        <h1 className="text-[clamp(32px,4vw,56px)] font-black uppercase tracking-[-1px] leading-[0.95] text-[#e8d4b8] mb-8" style={{ fontFamily: "'Oswald', sans-serif" }}>PRESS PACK</h1>
        <p className="text-[#d4c4a8]/80 text-sm mb-8">Enter the PIN to access the press pack download.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => { setPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
              placeholder="Enter PIN"
              className="w-full max-w-[200px] mx-auto block text-center text-2xl tracking-[0.5em] font-mono bg-[#2a1a0a]/30 border border-[#e8d4b8]/20 px-6 py-4 text-[#e8d4b8] placeholder-[#d4c4a8]/30 focus:outline-none focus:border-[#e8d4b8]/50"
            />
          </div>
          {error && <p className="text-red-300 text-sm">{error}</p>}
          <button
            type="submit"
            className="inline-block px-8 py-4 bg-[#e8d4b8] text-[#2a1a0a] text-sm font-semibold uppercase tracking-[2px] hover:bg-[#d4c4a8] transition"
          >
            Access Press Pack
          </button>
        </form>

        <a href="/" className="inline-block mt-8 text-[#d4c4a8]/60 text-xs uppercase tracking-[2px] hover:text-[#e8d4b8] transition">Back to site</a>
      </div>
    </div>
  );
}