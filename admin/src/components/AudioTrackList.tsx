'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Track {
  title: string;
  time: string;
  src?: string | null;
}

function parseDuration(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  return 30;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function generateWaveformBars(seed: number, count = 60): number[] {
  const bars: number[] = [];
  let value = seed * 12345;
  for (let i = 0; i < count; i++) {
    value = (value * 9301 + 49297) % 233280;
    bars.push(15 + (value / 233280) * 85);
  }
  return bars;
}

export default function AudioTrackList({ tracks }: { tracks: Track[] }) {
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (progressRef.current) { clearInterval(progressRef.current); progressRef.current = null; }
  }, []);

  const startTimer = useCallback((totalSeconds: number) => {
    clearTimer();
    setRemaining(totalSeconds);
    setProgress(0);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) { clearTimer(); return 0; }
        return prev - 1;
      });
    }, 1000);
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + (100 / (totalSeconds * 10));
      });
    }, 100);
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const togglePlay = (id: number, src: string | null | undefined) => {
    if (!src) return;
    if (playingId === id) {
      audioRef.current?.pause();
      clearTimer();
      setPlayingId(null);
      setProgress(0);
      return;
    }
    audioRef.current?.pause();
    clearTimer();
    const totalSeconds = parseDuration(tracks[id]?.time || '0:30');
    const audio = new Audio(src);
    audio.play().catch((e) => console.error('Audio play failed:', e));
    audio.onended = () => { clearTimer(); setPlayingId(null); setProgress(0); };
    audio.onpause = () => {
      if (audio.ended || audio.currentTime >= audio.duration - 0.5) {
        clearTimer(); setPlayingId(null); setProgress(0);
      }
    };
    audio.onerror = () => { clearTimer(); setPlayingId(null); setProgress(0); };
    const stopAt = Math.min(totalSeconds, audio.duration || totalSeconds);
    const checkInterval = setInterval(() => {
      if (audio.currentTime >= stopAt) {
        audio.pause(); clearInterval(checkInterval); clearTimer(); setPlayingId(null); setProgress(0);
      }
    }, 100);
    audioRef.current = audio;
    startTimer(totalSeconds);
    setPlayingId(id);
  };

  return (
    <div className="pt-2">
      {tracks.map((track, i) => {
        const waveformBars = generateWaveformBars(i + 1);
        const isPlaying = playingId === i;
        const filledBars = isPlaying ? Math.floor((progress / 100) * waveformBars.length) : 0;
        return (
          <div
            key={i}
            className="grid grid-cols-[auto_1fr] gap-3 py-4 border-b border-[#5a3a1a]/20 hover:bg-[#5a3a1a]/5 hover:mx-[-12px] hover:px-3 hover:rounded-lg transition cursor-pointer group"
            onClick={() => togglePlay(i, track.src)}
          >
            {/* Left column: artwork + play button */}
            <div className="flex flex-col items-center gap-2">
              {/* Square artwork — bigger */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded bg-[#5a3a1a]/10 overflow-hidden flex-shrink-0">
                <img
                  src="/assets/ricky-music-jacket-sm.jpg"
                  alt="Track artwork"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Play button — bigger */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay(i, track.src);
                }}
                disabled={!track.src}
                className="w-10 h-10 rounded-full border-[1.5px] border-[#5a3a1a]/50 bg-transparent flex items-center justify-center text-[#2a1a0a] group-hover:bg-[#2a1a0a] group-hover:text-[#f0e6d8] group-hover:border-[#2a1a0a] transition-all duration-200 disabled:opacity-30"
              >
                {isPlaying ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="7 4 19 12 7 20" />
                  </svg>
                )}
              </button>
            </div>

            {/* Right column: title + wave/timer row */}
            <div className="flex flex-col min-w-0">
              {/* Title — aligned with artwork top */}
              <span className="text-[17px] md:text-[20px] font-medium text-[#2a1a0a] leading-tight pt-1" style={{ fontFamily: "'Oswald', sans-serif" }}>
                {track.title}
              </span>

              {/* Spacer to push wave to same row as play button */}
              <div className="flex-1" />

              {/* Wave + timer — same row as play button */}
              <div className="flex items-center gap-3 pb-1">
                <div className="flex-1 h-10 md:h-12 flex items-center gap-[2px]">
                  {waveformBars.map((h, idx) => {
                    const isFilled = isPlaying && idx < filledBars;
                    return (
                      <div
                        key={idx}
                        className="flex-1 rounded-full transition-colors duration-150"
                        style={{
                          height: `${h}%`,
                          backgroundColor: isFilled ? '#2a1a0a' : '#c4b498',
                          opacity: isFilled ? 0.9 : 0.5,
                        }}
                      />
                    );
                  })}
                </div>
                <span className="text-[13px] md:text-[14px] text-[#5a3a1a]/60 font-variant-numeric-tabular flex-shrink-0 w-10 text-right">
                  {isPlaying ? formatTime(remaining) : track.time}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
