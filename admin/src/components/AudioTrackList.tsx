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

export default function AudioTrackList({ tracks }: { tracks: Track[] }) {
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTimer = (totalSeconds: number) => {
    clearTimer();
    setRemaining(totalSeconds);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
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
    };

    audio.onpause = () => {
      // Only clear if we're truly stopping (not just a brief pause)
      if (audio.ended || audio.currentTime >= audio.duration - 0.5) {
        clearTimer();
        setPlayingId(null);
      }
    };

    audio.onerror = () => {
      clearTimer();
      setPlayingId(null);
    };

    // Stop at 30 seconds
    const stopAt = Math.min(totalSeconds, audio.duration || totalSeconds);
    const checkInterval = setInterval(() => {
      if (audio.currentTime >= stopAt) {
        audio.pause();
        clearInterval(checkInterval);
        clearTimer();
        setPlayingId(null);
      }
    }, 100);

    audioRef.current = audio;
    startTimer(totalSeconds);
    setPlayingId(id);
  };

  return (
    <div className="border-t border-white/20 pt-6">
      {tracks.map((track, i) => (
        <div
          key={i}
          className="flex items-center gap-4 py-3.5 border-b border-white/20 hover:bg-white/10 hover:mx-[-12px] hover:px-3 hover:rounded-lg transition cursor-pointer group"
          onClick={() => togglePlay(i, track.src)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay(i, track.src);
            }}
            disabled={!track.src}
            className="w-10 h-10 rounded-full border-[1.5px] border-white/60 bg-transparent flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#111] transition flex-shrink-0 disabled:opacity-30"
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
            <span className="font-serif text-[16px] font-medium text-white">{track.title}</span>
            <span className="text-[13px] text-white/60 font-variant-numeric-tabular">
              {playingId === i ? formatTime(remaining) : track.time}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
