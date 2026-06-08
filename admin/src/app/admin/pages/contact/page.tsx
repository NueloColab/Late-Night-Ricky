'use client';

import { useState, useEffect, useCallback } from 'react';

interface SectionData {
  id: number;
  page: string;
  section: string;
  content: any;
  images: any;
  videos: any;
  links: any;
  order: number;
  isActive: boolean;
}

const CONTACT_SECTIONS = ['email', 'instagram', 'form'];

export default function ContactEditor() {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>('email');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const fetchSections = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/sections?page=contact');
    if (res.ok) {
      const data = await res.json();
      setSections(data.sections || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const emailSection = sections.find((s) => s.section === 'email');
  const instagramSection = sections.find((s) => s.section === 'instagram');
  const formSection = sections.find((s) => s.section === 'form');

  const emailValue = typeof emailSection?.content === 'string'
    ? emailSection.content
    : (emailSection?.content?.[0] || '');

  const instagramValue = typeof instagramSection?.content === 'string'
    ? instagramSection.content
    : (instagramSection?.content?.[0] || '');

  const formEnabled = formSection?.isActive ?? true;

  async function saveField(sectionName: string, value: any, isToggle = false) {
    const s = sections.find((sec) => sec.section === sectionName);
    if (!s) return;
    setSaving(true);
    const res = await fetch(`/api/sections/${s.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isToggle ? { isActive: value } : { content: [value] }),
    });
    if (res.ok) {
      setSavedMsg('Saved');
      setTimeout(() => setSavedMsg(''), 3000);
    }
    await fetchSections();
    setSaving(false);
  }

  const sectionList = CONTACT_SECTIONS.map((name) => {
    const s = sections.find((sec) => sec.section === name);
    const label = name === 'email' ? 'Email' : name === 'instagram' ? 'Instagram' : 'Contact Form';
    return { name, label, exists: !!s, id: s?.id, isActive: s?.isActive ?? true };
  });

  return (
    <div className="max-w-7xl mx-auto relative">
      {/* Saved toast */}
      {savedMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg animate-fade-in">
          {savedMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">Page Editor</p>
          <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#111] tracking-[-2px] uppercase leading-[0.95]">Contact Page</h1>
          <p className="text-sm text-[#5B7A8E] mt-4 font-semibold uppercase tracking-[0.5px]">Edit email, Instagram, and form settings</p>
        </div>
        <a
          href="/contact"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition"
        >
          View on Site →
        </a>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Section list */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white border border-[#A3B5C4]/30 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#A3B5C4]/30">
              <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold">Sections</p>
            </div>
            <div className="divide-y divide-[#E3E8ED]">
              {sectionList.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setSelectedSection(item.name)}
                  className={`w-full text-left px-5 py-3 text-sm transition-colors flex items-center justify-between ${
                    selectedSection === item.name
                      ? 'bg-[#1B3A4C] text-white'
                      : 'text-[#1B3A4C] hover:bg-[#E3E8ED]'
                  }`}
                >
                  <span className="font-semibold uppercase tracking-[1px] text-[13px]">{item.label}</span>
                  {!item.exists && (
                    <span className="text-[10px] uppercase tracking-wider opacity-60">New</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Editor panel */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <p className="text-[#6B8FAB] text-sm">Loading...</p>
          ) : selectedSection === 'email' ? (
            <div className="bg-white border border-[#A3B5C4]/30 p-6">
              <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-1">Contact</p>
              <p className="text-sm text-[#5B7A8E] mb-6 font-semibold uppercase tracking-[0.5px]">The contact email displayed on the site</p>
              <input
                type="email"
                value={emailValue}
                onChange={(e) => {
                  setSections((prev) =>
                    prev.map((s) =>
                      s.section === 'email' ? { ...s, content: [e.target.value] } : s
                    )
                  );
                }}
                placeholder="hello@latenightricky.com"
                className="w-full px-3 py-2 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C] mb-4"
              />
              <button
                onClick={() => saveField('email', emailValue)}
                disabled={saving}
                className="px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Email'}
              </button>
            </div>
          ) : selectedSection === 'instagram' ? (
            <div className="bg-white border border-[#A3B5C4]/30 p-6">
              <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-1">Contact</p>
              <p className="text-sm text-[#5B7A8E] mb-6 font-semibold uppercase tracking-[0.5px]">The Instagram handle displayed on the site</p>
              <input
                type="text"
                value={instagramValue}
                onChange={(e) => {
                  setSections((prev) =>
                    prev.map((s) =>
                      s.section === 'instagram' ? { ...s, content: [e.target.value] } : s
                    )
                  );
                }}
                placeholder="@latenightricky"
                className="w-full px-3 py-2 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C] mb-4"
              />
              <button
                onClick={() => saveField('instagram', instagramValue)}
                disabled={saving}
                className="px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Instagram'}
              </button>
            </div>
          ) : selectedSection === 'form' ? (
            <div className="bg-white border border-[#A3B5C4]/30 p-6">
              <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-1">Contact</p>
              <p className="text-sm text-[#5B7A8E] mb-6 font-semibold uppercase tracking-[0.5px]">Toggle the contact form on or off</p>

              <div className="flex items-center justify-between p-4 bg-[#E3E8ED] rounded-xl mb-6">
                <div>
                  <p className="text-sm font-semibold text-[#1B3A4C]">Form Enabled</p>
                  <p className="text-xs text-[#6B8FAB]">Visitors can submit the contact form</p>
                </div>
                <button
                  onClick={() => {
                    const newVal = !formEnabled;
                    setSections((prev) =>
                      prev.map((s) =>
                        s.section === 'form' ? { ...s, isActive: newVal } : s
                      )
                    );
                    saveField('form', newVal, true);
                  }}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${formEnabled ? 'bg-[#1B3A4C]' : 'bg-[#A3B5C4]'}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${formEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>

              <p className="text-xs text-[#6B8FAB]">The form fields are managed in the public site code.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
