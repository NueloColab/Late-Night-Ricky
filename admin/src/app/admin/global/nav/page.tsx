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

interface NavLink {
  label: string;
  href: string;
  visible: boolean;
}

const DEFAULT_LINKS: NavLink[] = [
  { label: 'Home', href: '/', visible: true },
  { label: 'About', href: '/about', visible: true },
  { label: 'Contact', href: '/contact', visible: true },
];

const inputClass = 'w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C] transition-colors';

export default function NavEditor() {
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

  const navSection = sections.find((s) => s.section === 'nav');
  const logoPath = navSection?.images?.[0];

  let links: NavLink[] = DEFAULT_LINKS;
  try {
    const parsed = typeof navSection?.content === 'string' ? JSON.parse(navSection.content || '[]') : (navSection?.content || []);
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object' && 'label' in parsed[0]) {
      links = parsed;
    }
  } catch {
    links = DEFAULT_LINKS;
  }

  async function saveNav(update: { content?: any; images?: any }) {
    if (!navSection) return;
    setSaving(true);
    await fetch(`/api/sections/${navSection.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });
    await fetchSections();
    setSaving(false);
  }

  function moveLink(index: number, dir: 'up' | 'down') {
    const newIdx = dir === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= links.length) return;
    const newLinks = [...links];
    [newLinks[index], newLinks[newIdx]] = [newLinks[newIdx], newLinks[index]];
    setSections((prev) =>
      prev.map((s) =>
        s.section === 'nav' ? { ...s, content: newLinks } : s
      )
    );
    saveNav({ content: newLinks });
  }

  function updateLink(index: number, field: string, value: any) {
    const newLinks = links.map((l, i) => (i === index ? { ...l, [field]: value } : l));
    setSections((prev) =>
      prev.map((s) =>
        s.section === 'nav' ? { ...s, content: newLinks } : s
      )
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">Global Settings</p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#0d1f3d] tracking-[-2px] uppercase leading-[0.95]">Nav & Logo</h1>
            <p className="text-sm text-[#8a9bac] mt-4 font-semibold uppercase tracking-[0.5px]">Edit navigation links and logo</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Logo */}
        <div className="bg-white border border-[#6B8FAB]/30 rounded-xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E3E8ED]">
            <div className="w-10 h-px bg-[#1B3A4C]"></div>
            <p className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px]">Logo</p>
          </div>
          <p className="text-xs text-[#6B8FAB] mb-4">The logo shown in the site navigation</p>

          <div className="flex items-center gap-6">
            <div className="relative w-40 h-20 bg-[#F8FAFB] rounded-lg border border-[#E3E8ED] overflow-hidden flex items-center justify-center">
              {logoPath ? (
                <Image src={logoPath} alt="Logo" fill className="object-contain p-2" sizes="160px" />
              ) : (
                <ImageIcon className="w-8 h-8 text-[#6B8FAB]" />
              )}
            </div>
            <button
              onClick={() => setMediaOpen(true)}
              className="px-5 py-2.5 bg-[#1B3A4C] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {logoPath ? 'Replace Logo' : 'Upload Logo'}
            </button>
          </div>
          {logoPath && <p className="text-xs text-[#6B8FAB] mt-3">{logoPath}</p>}
        </div>

        {/* Links */}
        <div className="bg-white border border-[#6B8FAB]/30 rounded-xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E3E8ED]">
            <div className="w-10 h-px bg-[#1B3A4C]"></div>
            <p className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px]">Navigation Links</p>
          </div>
          <p className="text-xs text-[#6B8FAB] mb-6">Reorder, rename, and show/hide links</p>

          <div className="space-y-3">
            {links.map((link, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 bg-[#F8FAFB] rounded-lg border border-[#E3E8ED]">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveLink(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-[#6B8FAB] hover:text-[#1B3A4C] transition-colors disabled:opacity-30"
                  >
                    <UpIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveLink(idx, 'down')}
                    disabled={idx === links.length - 1}
                    className="p-1 text-[#6B8FAB] hover:text-[#1B3A4C] transition-colors disabled:opacity-30"
                  >
                    <DownIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateLink(idx, 'label', e.target.value)}
                    placeholder="Label"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => updateLink(idx, 'href', e.target.value)}
                    placeholder="URL"
                    className={inputClass}
                  />
                </div>

                <button
                  onClick={() => {
                    updateLink(idx, 'visible', !link.visible);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    link.visible
                      ? 'bg-[#1B3A4C] text-white'
                      : 'bg-[#E3E8ED] text-[#6B8FAB]'
                  }`}
                >
                  {link.visible ? 'Shown' : 'Hidden'}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => {
                const newLinks = [...links, { label: 'New Link', href: '/', visible: true }];
                setSections((prev) =>
                  prev.map((s) =>
                    s.section === 'nav' ? { ...s, content: newLinks } : s
                  )
                );
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-[#0d1f3d] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#0d1f3d] hover:bg-[#E3E8ED] hover:text-white transition"
            >
              + Add Link
            </button>
            <button
              onClick={() => saveNav({ content: links })}
              disabled={saving}
              className="inline-flex items-center gap-2 px-7 py-3 bg-[#E3E8ED] text-white rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] hover:bg-[#1B3A4C] transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Links'}
            </button>
          </div>
        </div>
      </div>

      <MediaPicker
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(path) => {
          saveNav({ images: [path] });
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

function UpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

function DownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
