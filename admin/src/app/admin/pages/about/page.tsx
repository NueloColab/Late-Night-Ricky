'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import SectionEditor from '@/components/section-editor';
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

interface Stat {
  label: string;
  key: string;
  value: string;
}

const ABOUT_SECTIONS = ['portrait', 'bio', 'stats'];

export default function AboutEditor() {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>('bio');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaField, setMediaField] = useState<'portrait' | null>(null);

  const fetchSections = useCallback(async () => {
    const res = await fetch('/api/sections?page=about');
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

  // Extract stats from the stats section content
  const statsSection = sections.find((s) => s.section === 'stats');
  const statsContent = statsSection?.content;
  let stats: Stat[] = [];
  try {
    const parsed = typeof statsContent === 'string' ? JSON.parse(statsContent || '[]') : statsContent;
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
      stats = parsed;
    }
  } catch {
    stats = [
      { label: 'Grammy', key: 'grammy', value: '' },
      { label: 'Platinum', key: 'platinum', value: '' },
      { label: 'Shows', key: 'shows', value: '' },
      { label: 'Countries', key: 'countries', value: '' },
    ];
  }

  async function saveStats(newStats: Stat[]) {
    if (!statsSection) return;
    setSaving(true);
    await fetch(`/api/sections/${statsSection.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newStats }),
    });
    await fetchSections();
    setSaving(false);
  }

  async function savePortrait(path: string) {
    const portraitSection = sections.find((s) => s.section === 'portrait');
    if (!portraitSection) return;
    setSaving(true);
    await fetch(`/api/sections/${portraitSection.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: [path] }),
    });
    await fetchSections();
    setSaving(false);
  }

  const portraitPath = sections.find((s) => s.section === 'portrait')?.images?.[0];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl lg:text-4xl font-semibold text-[#1B3A4C] tracking-tight">About Page Editor</h1>
        <p className="text-[#8FA8BE] mt-1 text-sm font-medium tracking-wide uppercase">Edit portrait, bio, and stats</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Section list */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-[#8FA8BE]/20 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E3E8ED]">
              <h2 className="font-serif text-sm font-semibold text-[#1B3A4C] uppercase tracking-widest">Sections</h2>
            </div>
            <div className="divide-y divide-[#E3E8ED]">
              {ABOUT_SECTIONS.map((name) => {
                const s = sections.find((sec) => sec.section === name);
                const label = name === 'portrait' ? 'Portrait' : name === 'bio' ? 'Biography' : 'Stats';
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
          ) : selectedSection === 'portrait' ? (
            <div className="bg-white rounded-2xl p-6 border border-[#8FA8BE]/20">
              <h3 className="font-serif text-lg font-semibold text-[#1B3A4C] mb-4">Portrait</h3>
              <div className="relative w-full max-w-sm aspect-[3/4] bg-[#E3E8ED] rounded-xl overflow-hidden mb-4">
                {portraitPath ? (
                  <Image src={portraitPath} alt="Portrait" fill className="object-cover" sizes="400px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-[#8FA8BE]" />
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setMediaField('portrait');
                  setMediaOpen(true);
                }}
                className="px-4 py-2.5 bg-[#1B3A4C] text-white rounded-lg text-sm font-semibold hover:bg-[#2a4f66] transition-colors"
              >
                {portraitPath ? 'Replace Portrait' : 'Upload Portrait'}
              </button>
            </div>
          ) : selectedSection === 'stats' ? (
            <div className="bg-white rounded-2xl p-6 border border-[#8FA8BE]/20">
              <h3 className="font-serif text-lg font-semibold text-[#1B3A4C] mb-1">Stats</h3>
              <p className="text-xs text-[#8FA8BE] mb-6">Edit the 4 key numbers</p>

              <div className="space-y-4">
                {stats.map((stat, i) => (
                  <div key={stat.key}>
                    <label className="block text-xs font-semibold text-[#8FA8BE] uppercase tracking-widest mb-1.5">
                      {stat.label}
                    </label>
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => {
                        const newStats = [...stats];
                        newStats[i] = { ...stat, value: e.target.value };
                        setSections((prev) =
                          prev.map((s) =>
                            s.section === 'stats' ? { ...s, content: newStats } : s
                          )
                        );
                      }}
                      placeholder="e.g. 3x Grammy Winner"
                      className="w-full px-4 py-2.5 bg-[#E3E8ED] rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]/20"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <button
                  onClick={() => saveStats(stats)}
                  disabled={saving}
                  className="px-6 py-3 bg-[#1B3A4C] text-white rounded-xl font-semibold text-sm uppercase tracking-widest hover:bg-[#2a4f66] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Stats'}
                </button>
              </div>
            </div>
          ) : (
            <SectionEditor section={activeSection} onSaved={fetchSections} />
          )}
        </div>
      </div>

      <MediaPicker
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(path) => {
          if (mediaField === 'portrait') {
            savePortrait(path);
          }
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
