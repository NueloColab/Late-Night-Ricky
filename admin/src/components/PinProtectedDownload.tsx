'use client';

import { useState, useEffect } from 'react';

export default function PinProtectedDownload({ buttonClassName }: { buttonClassName?: string } = {}) {
  const [showModal, setShowModal] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [visible, setVisible] = useState(false);
  const [correctPin, setCorrectPin] = useState('7291');
  const [pressPackUrl, setPressPackUrl] = useState('/assets/press-pack.pdf');

  useEffect(() => {
    async function fetchSection() {
      try {
        const res = await fetch('/api/public/sections?page=about');
        const data = await res.json();
        const sections = data.sections || [];
        const intro = sections.find((s: any) => s.section === 'intro');
        if (intro?.content) {
          const c = typeof intro.content === 'string' ? JSON.parse(intro.content) : intro.content;
          if (c.pressPackPin) setCorrectPin(String(c.pressPackPin).trim());
          if (c.pressPackLink) setPressPackUrl(c.pressPackLink);
        }
      } catch {
        // keep defaults
      }
    }
    fetchSection();
  }, []);

  const handleOpen = () => {
    setShowModal(true);
    setPin('');
    setError(false);
    requestAnimationFrame(() => setVisible(true));
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      setShowModal(false);
      setPin('');
      setError(false);
    }, 400);
  };

  const handleSubmit = () => {
    const normalizedPin = String(pin).trim();
    const normalizedCorrectPin = String(correctPin).trim();
    if (!normalizedCorrectPin || normalizedPin === normalizedCorrectPin) {
      window.open(pressPackUrl, '_blank');
      handleClose();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className={buttonClassName || "inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 text-white text-[13px] font-semibold tracking-[0.08em] uppercase hover:bg-white/10 hover:border-white/50 transition-all duration-300"}
      >
        View Ricky&apos;s Presspack
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-70">
          <path d="M7 17L17 7M17 7H7M17 7V17" />
        </svg>
      </button>

      {showModal && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[12px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            visible ? 'bg-black/70 opacity-100' : 'bg-black/0 opacity-0'
          }`}
          onClick={handleClose}
        >
          <div
            className={`relative w-full max-w-[340px] mx-4 p-8 rounded-xl bg-[#2a1a0a] border border-[#5a3a1a]/30 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              visible
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-[0.92] translate-y-4'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-[#d4c4a8]/60 hover:text-[#e8d4b8] hover:bg-white/5 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <h3
              className="text-[#e8d4b8] text-[18px] font-bold tracking-[-1px] mb-1"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Enter PIN
            </h3>
            <p className="text-[#d4c4a8]/70 text-[13px] mb-6 leading-[1.5]">
              Please enter the PIN to download the press pack.
            </p>

            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                setError(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="••••"
              className="w-full bg-[#1a1208] border border-[#5a3a1a]/40 rounded-lg px-4 py-3 text-[#e8d4b8] text-[18px] tracking-[0.3em] text-center placeholder:text-[#5a3a1a]/40 focus:outline-none focus:border-[#c9a96e]/50 focus:ring-1 focus:ring-[#c9a96e]/20 transition-all mb-2"
            />

            {error && (
              <p className="text-[#e8d4b8]/80 text-[12px] text-center mt-2 mb-1">
                Incorrect PIN. Please try again.
              </p>
            )}

            <button
              onClick={handleSubmit}
              className="w-full mt-4 py-3 rounded-lg bg-[#5a3a1a] text-[#e8d4b8] text-[14px] font-semibold tracking-[0.05em] uppercase hover:bg-[#7a5c3a] transition-colors"
            >
              Unlock Download
            </button>
          </div>
        </div>
      )}
    </>
  );
}