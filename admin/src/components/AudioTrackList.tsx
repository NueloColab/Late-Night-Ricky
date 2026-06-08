'use client';

import { useState, useRef } from 'react';

interface Track {
  title: string;
  time: string;
  src?: string | null;
}

export default function AudioTrackList({ tracks }: { tracks: Track[] }) {
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = (id: number, src: string | null | undefined) => {
    if (!src) return;
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(src);
    audio.play().catch((e) => console.error('Audio play failed:', e));
    audio.onended = () => setPlayingId(null);
    audio.onpause = () => setPlayingId(null);
    audio.onerror = () => setPlayingId(null);
    audioRef.current = audio;
    setPlayingId(id);
  };

  return (
    <div className="border-t border-[#E3E8ED] pt-6">
      {tracks.map((track, i) => (
        <div
          key={i}
          className="flex items-center gap-4 py-3.5 border-b border-[#E3E8ED] hover:bg-[rgba(227,232,237,0.4)] hover:mx-[-12px] hover:px-3 hover:rounded-lg transition cursor-pointer group"
          onClick={() => togglePlay(i, track.src)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay(i, track.src);
            }}
            disabled={!track.src}
            className="w-10 h-10 rounded-full border-[1.5px] border-[#111] bg-transparent flex items-center justify-center text-[#111] group-hover:bg-[#111] group-hover:text-white transition flex-shrink-0 disabled:opacity-30"
          >
            {playingId === i ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="7 4 19 12 7 20" />
              </svg>
            )}
          </button>
          <div className="flex-1 flex justify-between items-center gap-4">
            <span className="font-serif text-[16px] font-medium text-[#1B3A4C]">{track.title}</span>
            <span className="text-[13px] text-[#6B8FAB] font-variant-numeric-tabular">{track.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
