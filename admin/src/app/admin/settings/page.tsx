"use client";

import { useEffect, useState } from "react";

interface SettingsData {
  taxRate: number;
  quoteTemplate: string;
  currency: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({ taxRate: 0, quoteTemplate: "standard", currency: "GBP" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pinMessage, setPinMessage] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
    } catch {
      console.error("Failed to load settings");
    }
    setLoading(false);
  }

  async function saveSettings() {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
    } catch {
      console.error("Save failed");
    }
    setSaving(false);
  }

  async function changePin(e: React.FormEvent) {
    e.preventDefault();
    setPinMessage("");
    if (newPin !== confirmPin) {
      setPinMessage("New PINs do not match");
      return;
    }
    if (newPin.length < 4) {
      setPinMessage("PIN must be at least 4 digits");
      return;
    }
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "changePin", currentPin, newPin }),
      });
      const data = await res.json();
      if (data.success) {
        setPinMessage("PIN updated successfully");
        setCurrentPin("");
        setNewPin("");
        setConfirmPin("");
      } else {
        setPinMessage(data.error || "Failed");
      }
    } catch {
      setPinMessage("Network error");
    }
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-semibold text-white tracking-tight">Settings</h1>
        <p className="text-[#8FA3B3] mt-1 text-sm font-medium tracking-wide uppercase">Configure your admin panel</p>
      </div>

      {loading ? (
        <p className="text-[#8FA3B3]">Loading...</p>
      ) : (
        <>
          {/* Business Settings */}
          <div className="bg-[#111318] rounded-2xl p-8 border border-[#2A2E36]">
            <h2 className="font-serif text-xl font-semibold text-white mb-6 tracking-tight">Business Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-white uppercase tracking-widest mb-2">Default Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[#2A2E36] rounded-lg text-sm focus:border-[#1B3A4C] focus:outline-none"
                >
                  <option value="GBP">£ GBP</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white uppercase tracking-widest mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border-2 border-[#2A2E36] rounded-lg text-sm focus:border-[#1B3A4C] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white uppercase tracking-widest mb-2">Quote Template</label>
                <select
                  value={settings.quoteTemplate}
                  onChange={(e) => setSettings({ ...settings, quoteTemplate: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[#2A2E36] rounded-lg text-sm focus:border-[#1B3A4C] focus:outline-none"
                >
                  <option value="standard">Standard</option>
                  <option value="detailed">Detailed</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="px-6 py-2.5 bg-[#1B3A4C] text-white rounded-lg text-sm font-semibold uppercase tracking-wide hover:bg-[#2a4a5c] transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>

          {/* PIN Change */}
          <div className="bg-[#111318] rounded-2xl p-8 border border-[#2A2E36]">
            <h2 className="font-serif text-xl font-semibold text-white mb-6 tracking-tight">Security</h2>
            <form onSubmit={changePin} className="max-w-md space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white uppercase tracking-widest mb-2">Current PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-[#2A2E36] rounded-lg text-sm text-center tracking-widest font-mono focus:border-[#1B3A4C] focus:outline-none"
                  placeholder="••••"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white uppercase tracking-widest mb-2">New PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-[#2A2E36] rounded-lg text-sm text-center tracking-widest font-mono focus:border-[#1B3A4C] focus:outline-none"
                  placeholder="••••"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white uppercase tracking-widest mb-2">Confirm New PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-[#2A2E36] rounded-lg text-sm text-center tracking-widest font-mono focus:border-[#1B3A4C] focus:outline-none"
                  placeholder="••••"
                />
              </div>
              {pinMessage && (
                <p className={`text-sm font-medium ${pinMessage.includes("success") ? "text-green-600" : "text-[#5A6A7A]"}`}>
                  {pinMessage}
                </p>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#1B3A4C] text-white rounded-lg text-sm font-semibold uppercase tracking-wide hover:bg-[#2a4a5c] transition-colors"
              >
                Update PIN
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
