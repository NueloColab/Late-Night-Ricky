'use client';

import { useState } from 'react';

export default function PinProtectedDownload() {
  const [showModal, setShowModal] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleOpen = () => {
    setShowModal(true);
    setPin('');
    setError(false);
  };

  const handleClose = () => {
    setShowModal(false);
    setPin('');
    setError(false);
  };

  const handleSubmit = () => {
    if (pin === '7291') {
      window.open('/assets/press-pack.pdf', '_blank');
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
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 text-white text-[13px] font-semibold tracking-[0.08em] uppercase hover:bg-white/10 hover:border-white/50 transition-all duration-300"
      >
        Download Press Pack
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-70">
          <path d="M7 17L17 7M17 7H7M17 7V17" />
        </svg>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div
            className="relative w-full max-w-[340px] mx-4 p-8 rounded-xl bg-[#2a1a0a] border border-[#5a3a1a]/30 shadow-2xl"
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
              className="text-[#e8d4b8] text-[18px] font-bold tracking-[0.02em] mb-1"
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
              <p className="text-[#c45a4a] text-[12px] text-center mt-2 mb-1">
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
