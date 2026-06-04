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
  { label: 'About', href: '/about.html', visible: true },
  { label: 'Showreel', href: '/showreel.html', visible: true },
  { label: 'Contact', href: '/contact.html', visible: true },
];

export default function NavEditor() {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);

  const fetchSections = useCallback(async () => {
    const res = await fetch('/api/sections?page=global');
    if (res.ok) {
      const data = await res.json();
      setSections(data.sections || []);
    }
    setLoading(false);
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
    setSections((prev) =
      prev.map((s) =
        s.section === 'nav' ? { ...s, content: newLinks } : s
      )
    );
    saveNav({ content: newLinks });
  }

  function updateLink(index: number, field: string, value: any) {
    const newLinks = links.map((l, i) => (i === index ? { ...l, [field]: value } : l));
    setSections((prev) =
      prev.map((s) =
        s.section === 'nav' ? { ...s, content: newLinks } : s
      )
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl lg:text-4xl font-semibold text-[#1B3A4C] tracking-tight">Nav & Logo</h1>
        <p className="text-[#8FA8BE] mt-1 text-sm font-medium tracking-wide uppercase">Edit navigation links and logo</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Logo */}
        <div className="bg-white rounded-2xl p-6 border border-[#8FA8BE]/20">
          <h3 className="font-serif text-lg font-semibold text-[#1B3A4C] mb-1">Logo</h3>
          <p className="text-xs text-[#8FA8BE] mb-4">The logo shown in the site navigation</p>

          <div className="relative w-40 h-20 bg-[#E3E8ED] rounded-xl overflow-hidden mb-4">
            {logoPath ? (
              <Image src={logoPath} alt="Logo" fill className="object-contain p-2" sizes="160px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-[#8FA8BE]" />
              </div>
            )}
          </div>
          <button
            onClick={() => setMediaOpen(true)}
            className="px-4 py-2.5 bg-[#1B3A4C] text-white rounded-lg text-sm font-semibold hover:bg-[#2a4f66] transition-colors"
          >
            {logoPath ? 'Replace Logo' : 'Upload Logo'}
          </button>
        </div>

        {/* Links */}
        <div className="bg-white rounded-2xl p-6 border border-[#8FA8BE]/20">
          <h3 className="font-serif text-lg font-semibold text-[#1B3A4C] mb-1">Navigation Links</h3>
          <p className="text-xs text-[#8FA8BE] mb-6">Reorder, rename, and show/hide links</p>

          <div className="space-y-3">
            {links.map((link, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-[#E3E8ED] rounded-xl">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveLink(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-[#8FA8BE] hover:text-[#1B3A4C] transition-colors disabled:opacity-30"
                  >
                    <UpIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveLink(idx, 'down')}
                    disabled={idx === links.length - 1}
                    className="p-1 text-[#8FA8BE] hover:text-[#1B3A4C] transition-colors disabled:opacity-30"
                  >
                    <DownIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 min-w-0 grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateLink(idx, 'label', e.target.value)}
                    placeholder="Label"
                    className="px-3 py-2 bg-white rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]/20"
                  />
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => updateLink(idx, 'href', e.target.value)}
                    placeholder="URL"
                    className="px-3 py-2 bg-white rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]/20"
                  />
                </div>

                <button
                  onClick={() => {
                    updateLink(idx, 'visible', !link.visible);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    link.visible
                      ? 'bg-[#1B3A4C] text-white'
                      : 'bg-white text-[#8FA8BE]'
                  }`}
                >
                  {link.visible ? 'Shown' : 'Hidden'}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => {
                const newLinks = [...links, { label: 'New Link', href: '/', visible: true }];
                setSections((prev) =
                  prev.map((s) =
                    s.section === 'nav' ? { ...s, content: newLinks } : s
                  )
                );
              }}
              className="px-4 py-2.5 border border-[#1B3A4C] text-[#1B3A4C] rounded-lg text-sm font-semibold hover:bg-[#1B3A4C] hover:text-white transition-colors"
            >
              + Add Link
            </button>
            <button
              onClick={() => saveNav({ content: links })}
              disabled={saving}
              className="px-6 py-3 bg-[#1B3A4C] text-white rounded-xl font-semibold text-sm uppercase tracking-widest hover:bg-[#2a4f66] transition-colors disabled:opacity-50"
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
