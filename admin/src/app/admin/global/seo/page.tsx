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
    if (!seoSection) return;
    setSaving(true);
    await fetch(`/api/sections/${seoSection.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });
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
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl lg:text-4xl font-semibold text-[#1B3A4C] tracking-tight">SEO & Meta</h1>
        <p className="text-[#8FA8BE] mt-1 text-sm font-medium tracking-wide uppercase">Page titles, descriptions, and favicon</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Favicon */}
        <div className="bg-white rounded-2xl p-6 border border-[#8FA8BE]/20">
          <h3 className="font-serif text-lg font-semibold text-[#1B3A4C] mb-1">Favicon</h3>
          <p className="text-xs text-[#8FA8BE] mb-4">The icon shown in browser tabs</p>

          <div className="relative w-16 h-16 bg-[#E3E8ED] rounded-xl overflow-hidden mb-4">
            {faviconPath ? (
              <Image src={faviconPath} alt="Favicon" fill className="object-contain p-1" sizes="64px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-[#8FA8BE]" />
              </div>
            )}
          </div>
          <button
            onClick={() => setMediaOpen(true)}
            className="px-4 py-2.5 bg-[#1B3A4C] text-white rounded-lg text-sm font-semibold hover:bg-[#2a4f66] transition-colors"
          >
            {faviconPath ? 'Replace Favicon' : 'Upload Favicon'}
          </button>
        </div>

        {/* Page Meta */}
        <div className="bg-white rounded-2xl p-6 border border-[#8FA8BE]/20">
          <h3 className="font-serif text-lg font-semibold text-[#1B3A4C] mb-1">Page Meta</h3>
          <p className="text-xs text-[#8FA8BE] mb-6">Titles and descriptions for each page</p>

          <div className="space-y-6">
            {merged.map((meta) => (
              <div key={meta.page} className="border border-[#E3E8ED] rounded-xl p-4">
                <p className="text-xs font-semibold text-[#8FA8BE] uppercase tracking-widest mb-3">{meta.page}</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#8FA8BE] uppercase tracking-widest mb-1.5">Title</label>
                    <input
                      type="text"
                      value={meta.title}
                      onChange={(e) => updateMeta(meta.page, 'title', e.target.value)}
                      placeholder="Page title"
                      className="w-full px-4 py-2.5 bg-[#E3E8ED] rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8FA8BE] uppercase tracking-widest mb-1.5">Meta Description</label>
                    <textarea
                      value={meta.description}
                      onChange={(e) => updateMeta(meta.page, 'description', e.target.value)}
                      placeholder="Short description for search engines"
                      rows={3}
                      className="w-full px-4 py-2.5 bg-[#E3E8ED] rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]/20 resize-y"
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
              className="px-6 py-3 bg-[#1B3A4C] text-white rounded-xl font-semibold text-sm uppercase tracking-widest hover:bg-[#2a4f66] transition-colors disabled:opacity-50"
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

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}
