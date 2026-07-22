'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Track {
  title: string;
  time: string;
  src?: string | null;
  cover?: string | null;
  spotifyUrl?: string | null;
  appleMusicUrl?: string | null;
  youtubeUrl?: string | null;
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

const SpotifyIcon = () => (
  <svg viewBox="0 0 168 168" width="22" height="22" className="opacity-70 hover:opacity-100 transition-opacity">
    <path fill="currentColor" d="M84 0C37.6 0 0 37.6 0 84s37.6 84 84 84 84-37.6 84-84S130.4 0 84 0zm38.5 121.2c-1.5 2.5-4.7 3.2-7.1 1.7-19.5-11.9-44-14.6-72.9-8-2.8.6-5.6-1.1-6.2-3.9-.6-2.8 1.1-5.6 3.9-6.2 31.8-7.3 59.3-4.2 81.4 9.4 2.4 1.5 3.2 4.7 1.7 7.1zm10.3-22.9c-1.9 3-5.9 4-8.9 2.1-22.3-13.7-56.3-17.7-82.7-9.7-3.5 1.1-7.1-.9-8.1-4.3-1.1-3.5.9-7.1 4.3-8.1 30.2-9.2 67.7-4.8 93.1 11.1 3 1.8 4 5.9 2.1 8.9zm.9-23.8c-26.8-15.9-71-17.4-96.5-9.6-4.2 1.3-8.6-1.1-9.9-5.3-1.3-4.2 1.1-8.6 5.3-9.9 29.3-8.9 78.1-7.2 109.8 11.5 3.8 2.2 5 7.1 2.8 10.9-2.2 3.8-7.1 5.1-10.9 2.8-1.4-.8-2.8-1.7-4.1-2.6-.5-.3-.9-.5-1.4-.8z"/>
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="22" className="opacity-70 hover:opacity-100 transition-opacity">
    <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" className="opacity-70 hover:opacity-100 transition-opacity">
    <path fill="currentColor" d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 00.5 6.19 31.5 31.5 0 000 12a31.5 31.5 0 00.5 5.81 3.02 3.02 0 002.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.5 31.5 0 0024 12a31.5 31.5 0 00-.5-5.81z"/>
    <path fill="#f0e6d8" d="M9.55 15.5V8.5l6.27 3.5-6.27 3.5z"/>
  </svg>
);

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

  const fallbackCover = '/assets/ricky-music-jacket-sm.jpg';

  return (
    <div className="pt-2">
      {tracks.map((track, i) => {
        const waveformBars = generateWaveformBars(i + 1);
        const isPlaying = playingId === i;
        const filledBars = isPlaying ? Math.floor((progress / 100) * waveformBars.length) : 0;
        const coverUrl = track.cover || fallbackCover;
        return (
          <div
            key={i}
            className="grid grid-cols-[auto_1fr] gap-3 py-4 border-b border-[#5a3a1a]/20 hover:bg-[#5a3a1a]/5 hover:mx-[-12px] hover:px-3 hover:rounded-lg transition cursor-pointer group"
            onClick={() => togglePlay(i, track.src)}
          >
            {/* Left column: artwork + play button */}
            <div className="flex flex-col items-center gap-2">
              {/* Square artwork — uses individual track cover or fallback */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded bg-[#5a3a1a]/10 overflow-hidden flex-shrink-0">
                <img
                  src={coverUrl}
                  alt={`${track.title} artwork`}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = fallbackCover; }}
                />
              </div>
              {/* Play button */}
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

            {/* Right column: title + links + wave/timer */}
            <div className="flex flex-col min-w-0">
              {/* Title */}
              <span className="text-[17px] md:text-[20px] font-bold text-[#2a1a0a] leading-tight pt-1 tracking-tight" style={{ fontFamily: "'Oswald', sans-serif" }}>
                {track.title}
              </span>

              {/* Platform links row */}
              <div className="flex items-center gap-4 mt-1.5 mb-1">
                {track.spotifyUrl && (
                  <a
                    href={track.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[#5a3a1a] hover:text-[#2a1a0a] transition p-1.5 rounded-full hover:bg-[#5a3a1a]/10"
                    title="Spotify"
                  >
                    <SpotifyIcon />
                  </a>
                )}
                {track.appleMusicUrl && (
                  <a
                    href={track.appleMusicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[#5a3a1a] hover:text-[#2a1a0a] transition p-1.5 rounded-full hover:bg-[#5a3a1a]/10"
                    title="Apple Music"
                  >
                    <AppleIcon />
                  </a>
                )}
                {track.youtubeUrl && (
                  <a
                    href={track.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[#5a3a1a] hover:text-[#2a1a0a] transition p-1.5 rounded-full hover:bg-[#5a3a1a]/10"
                    title="YouTube"
                  >
                    <YoutubeIcon />
                  </a>
                )}
              </div>

              {/* Spacer to push wave to bottom */}
              <div className="flex-1" />

              {/* Wave + timer */}
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
