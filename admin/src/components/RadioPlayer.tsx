'use client';

import { useState, useRef } from 'react';

interface Track { title: string; duration: string; src: string; }
interface RadioLinks { spotify?: string; appleMusic?: string; youtube?: string; }

export default function RadioPlayer({ tracks, links }: { tracks: Track[]; links?: RadioLinks }) {
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = (id: number, src: string) => {
    if (playingId === id) { audioRef.current?.pause(); setPlayingId(null); return; }
    audioRef.current?.pause();
    const audio = new Audio(src);
    audio.play().catch(() => {});
    audio.onended = () => setPlayingId(null);
    audio.onpause = () => setPlayingId(null);
    audioRef.current = audio;
    setPlayingId(id);
  };

  return (
    <div className="bg-white py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative overflow-hidden rounded-2xl">
            <img src="/assets/ricky-spotify-new.jpg" alt="Late Night Ricky" className="w-full h-auto object-cover" />
            <div className="absolute bottom-5 right-5 flex items-end gap-[3px] z-10 p-3 rounded-lg bg-[#7a7a7a]/70 backdrop-blur-sm">
              {[12, 20, 16, 24, 14].map((h, i) => (
                <span key={i} className="eq-bar" style={{ height: `${h}px`, animationDelay: `${[0,0.2,0.4,0.1,0.3][i]}s`, animationPlayState: playingId !== null ? 'running' : 'paused' }} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-[#b0b0b0] tracking-[3px] uppercase font-semibold mb-4">As Heard On</p>
            <h2 className="text-[clamp(40px,6vw,80px)] font-black text-[#111] mb-5 leading-[0.95] tracking-[-2px] uppercase">Radio &amp; Mixes</h2>
            <p className="text-sm text-[#111] leading-relaxed mb-10 max-w-[420px] font-semibold uppercase tracking-[0.5px]">From Ministry of Sound to Ibiza Rocks — hear the sound that moves the world.</p>
            <div className="flex gap-4 flex-wrap">
              {links?.spotify && <a href={links.spotify} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 px-7 py-3.5 border-2 border-[#111] rounded-full text-[#111] text-[13px] font-semibold uppercase tracking-[1.5px] hover:bg-[#3a3a3a] hover:text-white transition">Spotify</a>}
              {links?.appleMusic && <a href={links.appleMusic} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 px-7 py-3.5 border-2 border-[#111] rounded-full text-[#111] text-[13px] font-semibold uppercase tracking-[1.5px] hover:bg-[#3a3a3a] hover:text-white transition">Apple Music</a>}
              {links?.youtube && <a href={links.youtube} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 px-7 py-3.5 border-2 border-[#111] rounded-full text-[#111] text-[13px] font-semibold uppercase tracking-[1.5px] hover:bg-[#3a3a3a] hover:text-white transition">YouTube</a>}
            </div>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {tracks.map((track, i) => (
            <div key={i} className="bg-[#F8FAFB] rounded-xl p-5 flex flex-col items-start gap-4 hover:bg-[#EDF1F4] transition">
              <div className="flex items-center gap-3 w-full">
                <button onClick={() => togglePlay(i, track.src)} className="w-10 h-10 rounded-full border-2 border-[#111] flex items-center justify-center text-[#111] hover:bg-[#3a3a3a] hover:text-white transition flex-shrink-0">
                  {playingId === i ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
                  )}
                </button>
                <div className="flex-1">
                  <p className="font-serif text-[15px] font-medium text-[#7a7a7a]">{track.title}</p>
                  <p className="text-xs text-[#d0d0d0] font-medium mt-0.5">{track.duration}</p>
                </div>
              </div>
              <div className="flex items-end gap-[2px] h-8 w-full justify-center">
                {Array.from({ length: 24 }).map((_, j) => (
                  <span key={j} className="eq-bar bg-[#7a7a7a]" style={{ height: `${30 + Math.random() * 70}%`, animationDelay: `${(j * 0.05) % 1.2}s`, animationDuration: '1s', animationPlayState: playingId === i ? 'running' : 'paused' }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
