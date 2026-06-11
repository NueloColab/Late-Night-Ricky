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

const ABOUT_SECTIONS = ['portrait', 'biography'];

const EMPTY_CONTENT = {
  headline: '',
  bio1: '',
  bio2: '',
  bio3: '',
  bio4: '',
  image: '',
};

export default function AboutEditor() {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>('biography');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);

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

  const introSection = sections.find((s) => s.section === 'intro');
  const content = introSection?.content || {};

  const [form, setForm] = useState(EMPTY_CONTENT);

  // Sync form with fetched data
  useEffect(() => {
    setForm({
      headline: content.headline || '',
      bio1: content.bio1 || '',
      bio2: content.bio2 || '',
      bio3: content.bio3 || '',
      bio4: content.bio4 || '',
      image: content.image || '',
    });
  }, [introSection?.id]);

  async function saveBiography() {
    setSaving(true);
    try {
      if (introSection) {
        await fetch(`/api/sections/${introSection.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: form }),
        });
      } else {
        // Create intro section if it doesn't exist
        await fetch('/api/sections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: 'about',
            section: 'intro',
            order: 0,
            content: form,
            isActive: true,
          }),
        });
      }
      await fetchSections();
    } catch (err) {
      console.error('Save error:', err);
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function saveImage(path: string) {
    const newForm = { ...form, image: path };
    setForm(newForm);
    setSaving(true);
    try {
      if (introSection) {
        await fetch(`/api/sections/${introSection.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newForm }),
        });
      } else {
        await fetch('/api/sections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: 'about',
            section: 'intro',
            order: 0,
            content: newForm,
            isActive: true,
          }),
        });
      }
      await fetchSections();
    } catch (err) {
      console.error('Save image error:', err);
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  }

  const portraitPath = form.image || content.image;

  const hasData = !!introSection;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl lg:text-4xl font-semibold text-white tracking-tight">About Page Editor</h1>
          <p className="text-[#8FA3B3] mt-1 text-sm font-medium tracking-wide uppercase">Edit portrait, bio, and headline</p>
        </div>
        <a
          href="/about"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 border-2 border-[#1B3A4C] text-white rounded-xl text-sm font-semibold uppercase tracking-wide hover:bg-[#1B3A4C] hover:text-white transition-colors"
        >
          View on Site →
        </a>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Section list */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-[#111318] rounded-2xl border border-[#8FA8BE]/20 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#2A2E36]">
              <h2 className="font-serif text-sm font-semibold text-white uppercase tracking-widest">Sections</h2>
            </div>
            <div className="divide-y divide-[#2A2E36]">
              {ABOUT_SECTIONS.map((name) => {
                const label = name === 'portrait' ? 'Portrait' : 'Biography';
                return (
                  <button
                    key={name}
                    onClick={() => setSelectedSection(name)}
                    className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors flex items-center justify-between ${
                      selectedSection === name
                        ? 'bg-[#1B3A4C] text-white'
                        : 'text-white hover:bg-[#0A0A0A]'
                    }`}
                  >
                    <span>{label}</span>
                    {!hasData && (
                      <span className="text-[10px] uppercase tracking-wider opacity-60">New</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current data summary */}
          {hasData && (
            <div className="mt-4 bg-[#111318] rounded-2xl border border-[#8FA8BE]/20 p-4">
              <p className="text-xs text-[#8FA3B3] uppercase tracking-widest mb-2">Current Data</p>
              <div className="space-y-1 text-xs text-[#8FA3B3]">
                <p>Headline: <span className="text-white">{content.headline ? '✓ Set' : '—'}</span></p>
                <p>Bio 1: <span className="text-white">{content.bio1 ? '✓ Set' : '—'}</span></p>
                <p>Bio 2: <span className="text-white">{content.bio2 ? '✓ Set' : '—'}</span></p>
                <p>Bio 3: <span className="text-white">{content.bio3 ? '✓ Set' : '—'}</span></p>
                <p>Bio 4: <span className="text-white">{content.bio4 ? '✓ Set' : '—'}</span></p>
                <p>Image: <span className="text-white">{content.image ? '✓ Set' : '—'}</span></p>
              </div>
            </div>
          )}
        </div>

        {/* Editor panel */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <p className="text-[#8FA3B3] text-sm">Loading...</p>
          ) : selectedSection === 'portrait' ? (
            <div className="bg-[#111318] rounded-2xl p-6 border border-[#8FA8BE]/20">
              <h3 className="font-serif text-lg font-semibold text-white mb-4">Portrait</h3>
              <div className="relative w-full max-w-sm aspect-[3/4] bg-[#0A0A0A] rounded-xl overflow-hidden mb-4">
                {portraitPath ? (
                  <Image
                    src={portraitPath}
                    alt="Portrait"
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-[#8FA3B3]" />
                  </div>
                )}
              </div>
              <button
                onClick={() => setMediaOpen(true)}
                className="px-4 py-2.5 bg-[#1B3A4C] text-white rounded-lg text-sm font-semibold hover:bg-[#2a4f66] transition-colors"
              >
                {portraitPath ? 'Replace Portrait' : 'Upload Portrait'}
              </button>
              {portraitPath && (
                <p className="text-xs text-[#8FA3B3] mt-2">{portraitPath}</p>
              )}
            </div>
          ) : (
            <div className="bg-[#111318] rounded-2xl p-6 border border-[#8FA8BE]/20">
              <h3 className="font-serif text-lg font-semibold text-white mb-1">Biography</h3>
              <p className="text-xs text-[#8FA3B3] mb-6">Edit the headline and bio paragraphs</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-[#8FA3B3] uppercase tracking-widest mb-2">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={form.headline}
                    onChange={(e) => setForm({ ...form, headline: e.target.value })}
                    placeholder="e.g. International DJ & Grammy Winning Producer"
                    className="w-full px-4 py-2.5 bg-[#0A0A0A] rounded-lg text-sm text-white placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]/50"
                  />
                </div>

                {[1, 2, 3, 4].map((n) => {
                  const key = `bio${n}` as const;
                  return (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-[#8FA3B3] uppercase tracking-widest mb-2">
                        Bio Paragraph {n}
                      </label>
                      <textarea
                        value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        placeholder={`Bio paragraph ${n}...`}
                        rows={4}
                        className="w-full px-4 py-2.5 bg-[#0A0A0A] rounded-lg text-sm text-white placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]/50 resize-y"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={saveBiography}
                  disabled={saving}
                  className="px-6 py-3 bg-[#1B3A4C] text-white rounded-xl font-semibold text-sm uppercase tracking-widest hover:bg-[#2a4f66] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Biography'}
                </button>
                {!hasData && (
                  <span className="text-xs text-amber-400">⚠ No existing data — saving will create it</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <MediaPicker
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(path) => {
          saveImage(path);
          setMediaOpen(false);
        }}
        filterType="image"
      />
    </div>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}
