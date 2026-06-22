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

interface PageMeta {
  page: string;
  title: string;
  description: string;
}

const DEFAULT_PAGES = ['home', 'about', 'showreel', 'contact'];

export default function SeoEditor() {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const fetchSections = useCallback(async () => {
    const res = await fetch('/api/sections?page=global');
    if (res.ok) {
      const data = await res.json();
      setSections(data.sections || []);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const seoSection = sections.find((s) => s.section === 'seo');
  const faviconPath = seoSection?.images?.[0];

  let metaList: PageMeta[] = [];
  try {
    const parsed = typeof seoSection?.content === 'string' ? JSON.parse(seoSection.content || '[]') : (seoSection?.content || []);
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object' && 'page' in parsed[0]) {
      metaList = parsed;
    }
  } catch {
    metaList = [];
  }

  // Ensure all pages are present
  const merged = DEFAULT_PAGES.map((page) => {
    const existing = metaList.find((m) => m.page === page);
    return existing || { page, title: '', description: '' };
  });

  async function saveSeo(update: { content?: any; images?: any }) {
    if (!seoSection) return;
    setSaving(true);
    const res = await fetch(`/api/sections/${seoSection.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });
    if (res.ok) {
      setSavedMsg('Saved');
      setTimeout(() => setSavedMsg(''), 3000);
    }
    await fetchSections();
    setSaving(false);
  }

  function updateMeta(page: string, field: string, value: string) {
    const updated = merged.map((m) => (m.page === page ? { ...m, [field]: value } : m));
    setSections((prev) =>
      prev.map((s) =>
        s.section === 'seo' ? { ...s, content: updated } : s
      )
    );
  }

  return (
    <div className="max-w-7xl mx-auto relative">
      {savedMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg animate-fade-in">
          {savedMsg}
        </div>
      )}

      <div className="mb-12">
        <p className="text-xs text-[#A8D5F0] tracking-[3px] uppercase font-semibold mb-4">Global Settings</p>
        <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#111] tracking-[-2px] uppercase leading-[0.95]">SEO &amp; Meta</h1>
        <p className="text-sm text-[#a0a0a0] mt-4 font-semibold uppercase tracking-[0.5px]">Page titles, descriptions, and favicon</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Favicon */}
        <div className="bg-white border border-[#A8D5F0]/30 p-6">
          <p className="text-xs text-[#A8D5F0] tracking-[3px] uppercase font-semibold mb-1">Branding</p>
          <p className="text-sm text-[#a0a0a0] mb-4 font-semibold uppercase tracking-[0.5px]">The icon shown in browser tabs</p>

          <div className="relative w-16 h-16 bg-[#0d1f3d] rounded-xl overflow-hidden mb-4 border border-[#A8D5F0]/30">
            {faviconPath ? (
              <img src={faviconPath} alt="Favicon" className="object-contain p-1 w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A8D5F0" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={faviconPath || ''}
              onChange={(e) => {
                setSections((prev) =>
                  prev.map((s) =>
                    s.section === 'seo' ? { ...s, images: [e.target.value] } : s
                  )
                );
              }}
              placeholder="/assets/favicon.png"
              className="flex-1 px-3 py-2 bg-white border border-[#A8D5F0]/30 rounded-lg text-sm text-[#152a47] focus:outline-none focus:border-[#152a47]"
            />
            <button
              onClick={() => faviconPath && saveSeo({ images: [faviconPath] })}
              disabled={saving || !faviconPath}
              className="px-5 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#0d1f3d] hover:text-white transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Favicon'}
            </button>
          </div>
        </div>

        {/* Page Meta */}
        <div className="bg-white border border-[#A8D5F0]/30 p-6">
          <p className="text-xs text-[#A8D5F0] tracking-[3px] uppercase font-semibold mb-1">SEO</p>
          <p className="text-sm text-[#a0a0a0] mb-6 font-semibold uppercase tracking-[0.5px]">Titles and descriptions for each page</p>

          <div className="space-y-6">
            {merged.map((meta) => (
              <div key={meta.page} className="border border-[#A8D5F0]/30 rounded-xl p-4 bg-white">
                <p className="text-xs font-semibold text-[#A8D5F0] uppercase tracking-[3px] mb-3">{meta.page}</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#A8D5F0] uppercase tracking-[3px] mb-2">Title</label>
                    <input
                      type="text"
                      value={meta.title}
                      onChange={(e) => updateMeta(meta.page, 'title', e.target.value)}
                      placeholder="Page title"
                      className="w-full px-3 py-2 bg-white border border-[#A8D5F0]/30 rounded-lg text-sm text-[#152a47] focus:outline-none focus:border-[#152a47]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#A8D5F0] uppercase tracking-[3px] mb-2">Meta Description</label>
                    <textarea
                      value={meta.description}
                      onChange={(e) => updateMeta(meta.page, 'description', e.target.value)}
                      placeholder="Short description for search engines"
                      rows={3}
                      className="w-full px-3 py-2 bg-white border border-[#A8D5F0]/30 rounded-lg text-sm text-[#152a47] focus:outline-none focus:border-[#152a47] resize-y"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => saveSeo({ content: merged })}
              disabled={saving}
              className="px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#0d1f3d] hover:text-white transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Meta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
