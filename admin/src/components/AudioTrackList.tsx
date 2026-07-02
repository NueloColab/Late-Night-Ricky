'use client';

import { useState, useRef, useEffect } from 'react';

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

// Generate consistent waveform bars for a track (based on track index)
function generateWaveformBars(seed: number, count = 60): number[] {
  const bars: number[] = [];
  let value = seed;
  for (let i = 0; i < count; i++) {
    // Simple pseudo-random generator for consistent bars per track
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

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
  };

  const startTimer = (totalSeconds: number) => {
    clearTimer();
    setRemaining(totalSeconds);
    setProgress(0);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    // Progress update every 100ms for smooth bar
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        return prev + (100 / (totalSeconds * 10));
      });
    }, 100);
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

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

    audio.onended = () => {
      clearTimer();
      setPlayingId(null);
      setProgress(0);
    };

    audio.onpause = () => {
      if (audio.ended || audio.currentTime >= audio.duration - 0.5) {
        clearTimer();
        setPlayingId(null);
        setProgress(0);
      }
    };

    audio.onerror = () => {
      clearTimer();
      setPlayingId(null);
      setProgress(0);
    };

    const stopAt = Math.min(totalSeconds, audio.duration || totalSeconds);
    const checkInterval = setInterval(() => {
      if (audio.currentTime >= stopAt) {
        audio.pause();
        clearInterval(checkInterval);
        clearTimer();
        setPlayingId(null);
        setProgress(0);
      }
    }, 100);

    audioRef.current = audio;
    startTimer(totalSeconds);
    setPlayingId(id);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">
      {tracks.map((track, i) => {
        const waveformBars = generateWaveformBars(i + 1);
        const isPlaying = playingId === i;
        return (
          <div
            key={i}
            className="group bg-[#f0e8dc]/60 rounded-lg border border-[#5a3a1a]/10 overflow-hidden hover:border-[#5a3a1a]/25 transition-all duration-300"
          >
            {/* Top row: Artwork + Info */}
            <div className="flex items-center gap-3 p-3">
              {/* Square artwork */}
              <div className="w-12 h-12 rounded-md bg-[#5a3a1a]/10 flex-shrink-0 overflow-hidden relative">
                <img
                  src="/assets/ricky-radio-new.jpg"
                  alt="Track artwork"
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-[#2a1a0a]/40 flex items-center justify-center">
                    <div className="flex gap-[2px] items-end h-4">
                      {[0.4, 0.7, 0.5, 0.8, 0.3].map((h, idx) => (
                        <span
                          key={idx}
                          className="w-[3px] bg-[#e8d4b8] rounded-full animate-pulse"
                          style={{
                            height: `${h * 16}px`,
                            animationDelay: `${idx * 0.15}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Track info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#2a1a0a] leading-tight truncate">
                  {track.title}
                </p>
                <p className="text-[11px] text-[#5a3a1a]/60 mt-0.5">
                  {isPlaying ? formatTime(remaining) : track.time}
                </p>
              </div>
            </div>

            {/* Bottom row: Play button + Waveform */}
            <div className="px-3 pb-3">
              <div className="flex items-center gap-3">
                {/* Play/Pause button circle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay(i, track.src);
                  }}
                  disabled={!track.src}
                  className="w-9 h-9 rounded-full border-[1.5px] border-[#5a3a1a]/50 flex items-center justify-center text-[#2a1a0a] hover:bg-[#2a1a0a] hover:text-[#f8f1e8] hover:border-[#2a1a0a] transition-all duration-200 flex-shrink-0 disabled:opacity-30"
                >
                  {isPlaying ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="7 4 19 12 7 20" />
                    </svg>
                  )}
                </button>

                {/* Sound wave bar */}
                <div className="flex-1 h-8 flex items-center gap-[2px] cursor-pointer">
                  {waveformBars.map((h, idx) => {
                    const isPlayed = isPlaying && (idx / waveformBars.length) * 100 < progress;
                    return (
                      <div
                        key={idx}
                        className="flex-1 rounded-full transition-all duration-150"
                        style={{
                          height: `${h}%`,
                          backgroundColor: isPlayed
                            ? '#2a1a0a'
                            : isPlaying
                            ? '#c4b498'
                            : '#5a3a1a/20',
                          opacity: isPlaying ? 0.85 : 0.35,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
