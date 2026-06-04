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
    <div className="min-h-screen bg-[#E3E8ED] flex items-center justify-center">
      <div className="bg-white p-12 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-[#1B3A4C] mb-2 tracking-tight">
          Late Night Ricky
        </h1>
        <p className="text-[#8FA8BE] mb-8 text-sm font-medium tracking-wide uppercase">
          Admin Access
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-[#1B3A4C] mb-2">
              Enter PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#E3E8ED] rounded-lg text-[#1B3A4C] font-mono text-lg tracking-widest text-center focus:border-[#1B3A4C] focus:outline-none transition-colors"
              placeholder="••••"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1B3A4C] text-white rounded-lg font-semibold tracking-wide uppercase text-sm hover:bg-[#2a4a5c] transition-colors disabled:opacity-50"
          >
            {loading ? "Checking..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
