"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

// Star-flicker keyframes injected via style tag
const StarFlickerStyles = () => (
  <style>{`
    @keyframes star-flicker {
      0%, 100% { opacity: 1; transform: scale(1); filter: brightness(1.2); }
      25% { opacity: 0.4; transform: scale(0.85); filter: brightness(0.8); }
      50% { opacity: 0.9; transform: scale(1.1); filter: brightness(1.4); }
      75% { opacity: 0.3; transform: scale(0.9); filter: brightness(0.7); }
    }
    @keyframes star-glow {
      0%, 100% { box-shadow: 0 0 4px rgba(197, 229, 248, 0.3); }
      50% { box-shadow: 0 0 12px rgba(197, 229, 248, 0.6), 0 0 20px rgba(197, 229, 248, 0.2); }
    }
    .star-dot {
      animation: star-flicker 2s ease-in-out infinite, star-glow 3s ease-in-out infinite;
    }
    .star-dot:nth-child(2) { animation-delay: 0.3s, 0.5s; }
    .star-dot:nth-child(3) { animation-delay: 0.7s, 1.2s; }
    .star-dot:nth-child(4) { animation-delay: 1.1s, 0.8s; }
    .star-dot:nth-child(5) { animation-delay: 0.5s, 1.5s; }
    .star-dot:nth-child(6) { animation-delay: 0.9s, 0.3s; }
    .star-dot-empty:hover {
      transform: scale(1.3);
      box-shadow: 0 0 8px rgba(197, 229, 248, 0.4);
    }
    .star-dot-filled:hover {
      transform: scale(1.2);
      filter: brightness(1.5);
    }
  `}</style>
);

function PinInput({
  value,
  onChange,
  maxLength = 4,
  error,
}: {
  value: string;
  onChange: (val: string) => void;
  maxLength?: number;
  error?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key >= "0" && e.key <= "9") {
      e.preventDefault();
      const newVal = (value + e.key).slice(0, maxLength);
      onChange(newVal);
    } else if (e.key === "Backspace") {
      e.preventDefault();
      onChange(value.slice(0, -1));
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      onClick={handleContainerClick}
      className={`relative flex items-center justify-center gap-4 px-6 py-5 bg-[#111318]/5 border-2 rounded-xl cursor-text transition-all ${
        error
          ? "border-red-400/50"
          : value.length === maxLength
          ? "border-[#C5E5F8]/60"
          : "border-[#2A2E36] hover:border-[#3A3E46]"
      }`}
    >
      {/* Hidden real input for mobile keyboard */}
      <input
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        maxLength={maxLength}
        value={value}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, maxLength);
          onChange(digits);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocusedIndex(value.length)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-text"
        autoFocus
      />

      {/* Visual dots */}
      {Array.from({ length: maxLength }).map((_, i) => {
        const filled = i < value.length;
        const isActive = i === value.length;

        return (
          <div
            key={i}
            className={`relative w-4 h-4 rounded-full transition-all duration-300 cursor-default ${
              filled
                ? "star-dot star-dot-filled bg-[#C5E5F8]"
                : "star-dot-empty bg-transparent border-2 border-[#5A6A7A]/40 hover:border-[#C5E5F8]/50"
            } ${isActive ? "ring-2 ring-[#C5E5F8]/20 ring-offset-2 ring-offset-[#1B3A4C]" : ""}`}
          >
            {filled && (
              <div className="absolute inset-0 rounded-full bg-[#C5E5F8]" />
            )}
            {isActive && !filled && (
              <div className="absolute inset-0.5 rounded-full bg-[#C5E5F8]/30 animate-pulse" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });

    const data = await res.json();

    if (data.success) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(data.error || "Invalid PIN");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#1B3A4C] flex">
      <StarFlickerStyles />
      {/* Left side — branding (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,_#E8F4FF_1px,_transparent_1px)] bg-[length:40px_40px]" />
        </div>
        <div className="relative z-10 text-center px-12">
          <div className="mb-8">
            <img
              src="/assets/ricky-logo.png"
              alt="Late Night Ricky"
              className="mx-auto invert w-[320px] h-auto"
            />
          </div>
          <p className="text-[#8FA3B3] text-sm font-medium uppercase tracking-[0.3em]">
            International DJ & Grammy Winning Producer
          </p>
          <div className="mt-12 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-1 bg-[#111318]/20 rounded-full animate-pulse"
                style={{ height: `${20 + i * 8}px`, animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right side — login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-10">
            <img
              src="/assets/ricky-logo.png"
              alt="Late Night Ricky"
              className="mx-auto invert w-[200px] h-auto"
            />
          </div>

          <div className="mb-10">
            <p className="text-[#8FA3B3] text-xs font-semibold uppercase tracking-[0.3em] mb-3">
              Restricted Access
            </p>
            <h2 className="font-serif text-3xl font-semibold text-white tracking-tight">
              Admin Login
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold tracking-[0.2em] uppercase text-[#8FA3B3] mb-3">
                Enter PIN
              </label>
              <PinInput
                value={pin}
                onChange={setPin}
                maxLength={4}
                error={!!error}
              />
            </div>

            {error && (
              <div className="px-4 py-3 bg-[#1A1D24] border border-[#2A2E36] rounded-lg">
                <p className="text-[#8FA3B3] text-sm font-medium text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#111318] text-white rounded-xl font-semibold tracking-wide uppercase text-sm hover:bg-[#0A0A0A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Checking..." : "Enter"}
            </button>
          </form>

          <p className="mt-8 text-center text-[#8FA3B3]/60 text-xs">
            Late Night Ricky Admin · © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
