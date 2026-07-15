"use client";

import { useEffect, useState } from "react";

interface SettingsData {
  taxRate: number;
  quoteTemplate: string;
  currency: string;
  bankName?: string;
  bankAccountName?: string;
  bankSortCode?: string;
  bankAccountNumber?: string;
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
    <div className="max-w-5xl mx-auto">
      <div className="mb-12">
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">Configuration</p>
        <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#111] tracking-[-2px] uppercase leading-[0.95]">
          Settings
        </h1>
        <p className="text-sm text-[#a0a0a0] mt-4 font-semibold uppercase tracking-[0.5px]">Configure your admin panel preferences.</p>
      </div>

      {loading ? (
        <p className="text-[#6B8FAB] text-sm">Loading...</p>
      ) : (
        <div className="space-y-8">
          <div className="bg-white border border-[#6B8FAB]/30 p-8">
            <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-6">Business Settings</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-3">Default Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
                >
                  <option value="GBP">£ GBP</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-3">Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-3">Quote Template</label>
                <select
                  value={settings.quoteTemplate}
                  onChange={(e) => setSettings({ ...settings, quoteTemplate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
                >
                  <option value="standard">Standard</option>
                  <option value="detailed">Detailed</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
            </div>

            <div className="border-t border-[#6B8FAB]/20 pt-8">
              <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-6">Bank Details for Invoices</p>
              <p className="text-xs text-[#a0a0a0] mb-4">These details appear on all invoice PDFs and emails.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-3">Bank Name</label>
                  <input
                    type="text"
                    value={settings.bankName || ''}
                    onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
                    placeholder="e.g. Tide"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-3">Account Name</label>
                  <input
                    type="text"
                    value={settings.bankAccountName || ''}
                    onChange={(e) => setSettings({ ...settings, bankAccountName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
                    placeholder="e.g. Late Night Ricky"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-3">Sort Code</label>
                  <input
                    type="text"
                    value={settings.bankSortCode || ''}
                    onChange={(e) => setSettings({ ...settings, bankSortCode: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
                    placeholder="e.g. 04-06-05"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-3">Account Number</label>
                  <input
                    type="text"
                    value={settings.bankAccountNumber || ''}
                    onChange={(e) => setSettings({ ...settings, bankAccountNumber: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
                    placeholder="e.g. 23690693"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#E3E8ED] hover:text-white transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#6B8FAB]/30 p-8">
            <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-6">Security</p>
            <form onSubmit={changePin} className="max-w-md space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-3">Current PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] text-center tracking-widest font-mono focus:outline-none focus:border-[#1B3A4C]"
                  placeholder="••••"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-3">New PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] text-center tracking-widest font-mono focus:outline-none focus:border-[#1B3A4C]"
                  placeholder="••••"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-3">Confirm New PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] text-center tracking-widest font-mono focus:outline-none focus:border-[#1B3A4C]"
                  placeholder="••••"
                />
              </div>
              {pinMessage && (
                <p className={`text-sm font-medium ${pinMessage.includes("success") ? "text-[#2d6a2d]" : "text-[#a0a0a0]"}`}>
                  {pinMessage}
                </p>
              )}
              <button
                type="submit"
                className="px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#E3E8ED] hover:text-white transition"
              >
                Update PIN
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
