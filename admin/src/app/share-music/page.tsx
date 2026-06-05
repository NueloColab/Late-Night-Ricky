'use client';

import { useState, useRef } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
export const dynamic = 'force-dynamic';

export default function ShareMusicPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    if (!f) return;
    setFile(f);
  };

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        {/* Page Title Bar */}
        <div className="border-b-2 border-[#111] pt-24 pb-5 px-8">
          <div className="max-w-[1200px] mx-auto">
            <h1 className="text-[clamp(48px,10vw,120px)] font-black tracking-[-3px] uppercase leading-[0.9] text-[#111]">Share Your Music</h1>
          </div>
        </div>

        {/* Share Layout */}
        <div className="max-w-[800px] mx-auto px-8 py-20">
          <p className="text-[clamp(28px,4vw,48px)] font-black uppercase leading-tight tracking-[-1px] mb-12 text-[#111] max-w-[600px]">
            I&apos;m always on the lookout for new music to play, so send me your tracks
          </p>

          <form
            id="uploadForm"
            action="mailto:bookings@latenightricky.com"
            method="post"
            encType="text/plain"
          >
            <div
              className={`border-[3px] border-dashed border-[#111] p-12 md:p-16 text-center transition-colors cursor-pointer max-w-[600px] mx-auto mb-8 ${
                dragOver ? 'border-[#1B3A4C] bg-[rgba(27,58,76,0.04)]' : 'hover:border-[#1B3A4C] hover:bg-[rgba(27,58,76,0.02)]'
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
                id="trackFile"
                name="track"
                accept="audio/mp3,audio/mpeg"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] || null)}
              />
              <button
                type="button"
                className="inline-block px-10 py-4 bg-[#111] text-white text-sm font-semibold uppercase tracking-[2px] hover:bg-[#1B3A4C] transition"
              >
                Upload your track
              </button>
              <p className="mt-4 text-sm text-[#5B7A8E]">Click the button and upload your file in mp3 320 kbps</p>
              {file && (
                <p className="mt-4 text-sm text-[#1B3A4C] font-medium">Selected: {file.name}</p>
              )}
            </div>

            <button
              type="submit"
              className="inline-block px-10 py-4 bg-[#111] text-white text-sm font-semibold uppercase tracking-[2px] hover:bg-[#1B3A4C] transition w-full max-w-[600px]"
            >
              Submit Track
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
