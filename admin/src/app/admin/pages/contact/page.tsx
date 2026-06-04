'use client';

import { useState, useEffect, useCallback } from 'react';
import SectionEditor from '@/components/section-editor';

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

  const fetchSections = useCallback(async () => {
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

  const activeSection = sections.find((s) => s.section === selectedSection) || null;

  // Simple editors for email, instagram, form toggle
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
    await fetch(`/api/sections/${s.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isToggle ? { isActive: value } : { content: [value] }),
    });
    await fetchSections();
    setSaving(false);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl lg:text-4xl font-semibold text-[#1B3A4C] tracking-tight">Contact Page Editor</h1>
        <p className="text-[#8FA8BE] mt-1 text-sm font-medium tracking-wide uppercase">Edit email, Instagram, and form settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Section list */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-[#8FA8BE]/20 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E3E8ED]">
              <h2 className="font-serif text-sm font-semibold text-[#1B3A4C] uppercase tracking-widest">Sections</h2>
            </div>
            <div className="divide-y divide-[#E3E8ED]">
              {CONTACT_SECTIONS.map((name) => {
                const s = sections.find((sec) => sec.section === name);
                const label = name === 'email' ? 'Email' : name === 'instagram' ? 'Instagram' : 'Contact Form';
                return (
                  <button
                    key={name}
                    onClick={() => setSelectedSection(name)}
                    className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors flex items-center justify-between ${
                      selectedSection === name
                        ? 'bg-[#1B3A4C] text-white'
                        : 'text-[#1B3A4C] hover:bg-[#E3E8ED]'
                    }`}
                  >
                    <span>{label}</span>
                    {!s && (
                      <span className="text-[10px] uppercase tracking-wider opacity-60">New</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Editor panel */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <p className="text-[#8FA8BE] text-sm">Loading...</p>
          ) : selectedSection === 'email' ? (
            <div className="bg-white rounded-2xl p-6 border border-[#8FA8BE]/20">
              <h3 className="font-serif text-lg font-semibold text-[#1B3A4C] mb-1">Email</h3>
              <p className="text-xs text-[#8FA8BE] mb-6">The contact email displayed on the site</p>
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
                className="w-full px-4 py-3 bg-[#E3E8ED] rounded-xl text-sm text-[#1B3A4C] focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]/20 mb-4"
              />
              <button
                onClick={() => saveField('email', emailValue)}
                disabled={saving}
                className="px-6 py-3 bg-[#1B3A4C] text-white rounded-xl font-semibold text-sm uppercase tracking-widest hover:bg-[#2a4f66] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Email'}
              </button>
            </div>
          ) : selectedSection === 'instagram' ? (
            <div className="bg-white rounded-2xl p-6 border border-[#8FA8BE]/20">
              <h3 className="font-serif text-lg font-semibold text-[#1B3A4C] mb-1">Instagram</h3>
              <p className="text-xs text-[#8FA8BE] mb-6">The Instagram handle displayed on the site</p>
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
                className="w-full px-4 py-3 bg-[#E3E8ED] rounded-xl text-sm text-[#1B3A4C] focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]/20 mb-4"
              />
              <button
                onClick={() => saveField('instagram', instagramValue)}
                disabled={saving}
                className="px-6 py-3 bg-[#1B3A4C] text-white rounded-xl font-semibold text-sm uppercase tracking-widest hover:bg-[#2a4f66] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Instagram'}
                </button>
            </div>
          ) : selectedSection === 'form' ? (
            <div className="bg-white rounded-2xl p-6 border border-[#8FA8BE]/20">
              <h3 className="font-serif text-lg font-semibold text-[#1B3A4C] mb-1">Contact Form</h3>
              <p className="text-xs text-[#8FA8BE] mb-6">Toggle the contact form on or off</p>

              <div className="flex items-center justify-between p-4 bg-[#E3E8ED] rounded-xl mb-6">
                <div>
                  <p className="text-sm font-semibold text-[#1B3A4C]">Form Enabled</p>
                  <p className="text-xs text-[#8FA8BE]">Visitors can submit the contact form</p>
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
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${formEnabled ? 'bg-[#1B3A4C]' : 'bg-[#8FA8BE]'}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${formEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>

              <p className="text-xs text-[#8FA8BE]">The form fields are managed in the public site code.</p>
            </div>
          ) : (
            <SectionEditor section={activeSection} onSaved={fetchSections} />
          )}
        </div>
      </div>
    </div>
  );
}
