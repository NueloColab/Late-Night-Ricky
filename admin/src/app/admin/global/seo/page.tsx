'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import MediaPicker from '@/components/media-picker';

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
  const [mediaOpen, setMediaOpen] = useState(false);

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
    setSaving(true);
    try {
      let sectionId = seoSection?.id;

      // If no seo section exists yet, create one first
      if (!sectionId) {
        const res = await fetch('/api/sections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: 'global',
            section: 'seo',
            content: update.content || merged,
            images: update.images || null,
            order: 2,
            isActive: true,
          }),
        });
        if (!res.ok) {
          console.error('Failed to create seo section:', await res.text());
          return;
        }
        const data = await res.json();
        sectionId = data.section?.id;
      } else {
        // Update existing section
        await fetch(`/api/sections/${sectionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update),
        });
      }

      setSavedMsg('Saved');
      setTimeout(() => setSavedMsg(''), 3000);
      await fetchSections();
    } catch (err) {
      console.error('Save seo error:', err);
    } finally {
      setSaving(false);
    }
  }

  function updateMeta(page: string, field: string, value: string) {
    const updated = merged.map((m) => (m.page === page ? { ...m, [field]: value } : m));
    setSections((prev) => {
      const hasSeo = prev.some((s) => s.section === 'seo');
      if (hasSeo) {
        return prev.map((s) =>
          s.section === 'seo' ? { ...s, content: updated } : s
        );
      } else {
        return [...prev, {
          id: 0,
          page: 'global',
          section: 'seo',
          content: updated,
          images: null,
          videos: null,
          links: null,
          order: 2,
          isActive: true,
        } as SectionData];
      }
    });
  }

  return (
    <div className="max-w-7xl mx-auto relative">
      {savedMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg animate-fade-in">
          {savedMsg}
        </div>
      )}

      <div className="mb-12">
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">Global Settings</p>
        <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#111] tracking-[-2px] uppercase leading-[0.95]">SEO &amp; Meta</h1>
        <p className="text-sm text-[#a0a0a0] mt-4 font-semibold uppercase tracking-[0.5px]">Page titles, descriptions, and favicon</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Favicon */}
        <div className="bg-white border border-[#6B8FAB]/30 rounded-xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E3E8ED]">
            <div className="w-10 h-px bg-[#1B3A4C]"></div>
            <p className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px]">Favicon</p>
          </div>
          <p className="text-xs text-[#6B8FAB] mb-4">The icon shown in browser tabs</p>

          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 bg-[#F8FAFB] rounded-lg border border-[#E3E8ED] overflow-hidden flex items-center justify-center">
              {faviconPath ? (
                <Image src={faviconPath} alt="Favicon" fill className="object-contain p-2" sizes="80px" />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B8FAB" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                </svg>
              )}
            </div>
            <button
              onClick={() => setMediaOpen(true)}
              className="px-5 py-2.5 bg-[#1B3A4C] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {faviconPath ? 'Replace Favicon' : 'Upload Favicon'}
            </button>
          </div>
          {faviconPath && <p className="text-xs text-[#6B8FAB] mt-3">{faviconPath}</p>}
        </div>

        {/* Page Meta */}
        <div className="bg-white border border-[#6B8FAB]/30 p-6">
          <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-1">SEO</p>
          <p className="text-sm text-[#a0a0a0] mb-6 font-semibold uppercase tracking-[0.5px]">Titles and descriptions for each page</p>

          <div className="space-y-6">
            {merged.map((meta) => (
              <div key={meta.page} className="border border-[#6B8FAB]/30 rounded-xl p-4 bg-white">
                <p className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-3">{meta.page}</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Title</label>
                    <input
                      type="text"
                      value={meta.title}
                      onChange={(e) => updateMeta(meta.page, 'title', e.target.value)}
                      placeholder="Page title"
                      className="w-full px-3 py-2 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Meta Description</label>
                    <textarea
                      value={meta.description}
                      onChange={(e) => updateMeta(meta.page, 'description', e.target.value)}
                      placeholder="Short description for search engines"
                      rows={3}
                      className="w-full px-3 py-2 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C] resize-y"
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
              className="px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#E3E8ED] hover:text-white transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Meta'}
            </button>
          </div>
        </div>
      </div>

      <MediaPicker
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(path) => {
          saveSeo({ images: [path] });
        }}
        filterType="image"
      />
    </div>
  );
}
