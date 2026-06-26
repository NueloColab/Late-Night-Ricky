"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
              className="mx-auto invert w-[200px] h-auto"
            />
          </div>
          <h1 className="font-serif text-6xl font-semibold text-white tracking-tight mb-4">
            Late Night
            <br />
            Ricky
          </h1>
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
              className="mx-auto invert w-[160px] h-auto"
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
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-5 py-4 bg-[#111318]/5 border-2 border-[#2A2E36] rounded-xl text-white font-mono text-2xl tracking-[0.5em] text-center placeholder:text-[#5A6A7A] focus:border-[#C5E5F8] focus:outline-none focus:bg-[#111318]/10 transition-all"
                placeholder="••••"
                autoFocus
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
