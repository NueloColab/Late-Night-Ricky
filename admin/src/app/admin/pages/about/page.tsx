'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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

  const [form, setForm] = useState<Record<string, string>>(EMPTY_CONTENT);

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
    <div className="max-w-5xl">
      <Link
        href="/admin/content"
        className="inline-flex items-center gap-2 text-sm text-[#7a7a7a] hover:text-[#111] transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        <span>Back to Content</span>
      </Link>
      <div className="mb-12">
        <p className="text-xs text-[#b0b0b0] tracking-[3px] uppercase font-semibold mb-4">CMS</p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#111] tracking-[-2px] uppercase leading-[0.95]">About Page Editor</h1>
            <p className="text-sm text-[#a0a0a0] mt-4 font-semibold uppercase tracking-[0.5px]">Edit portrait, bio, and headline</p>
          </div>
          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#3a3a3a] hover:text-white transition"
          >
            View on Site
          </a>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white border border-[#b0b0b0]/30 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#8a8a8a]">
              <p className="text-xs font-semibold text-[#b0b0b0] uppercase tracking-[3px]">Sections</p>
            </div>
            <div className="divide-y divide-[#8a8a8a]">
              {ABOUT_SECTIONS.map((name) => {
                const label = name === 'portrait' ? 'Portrait' : 'Biography';
                return (
                  <button
                    key={name}
                    onClick={() => setSelectedSection(name)}
                    className={`w-full text-left px-5 py-3 text-sm font-semibold transition-colors flex items-center justify-between ${
                      selectedSection === name
                        ? 'bg-[#7a7a7a] text-white'
                        : 'text-[#7a7a7a] hover:bg-[#F8FAFB]'
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

          {hasData && (
            <div className="mt-4 bg-white border border-[#b0b0b0]/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-[#b0b0b0] uppercase tracking-[3px] mb-3">Current Data</p>
              <div className="space-y-1.5 text-xs">
                {[
                  { label: 'Headline', key: 'headline' },
                  { label: 'Bio 1', key: 'bio1' },
                  { label: 'Bio 2', key: 'bio2' },
                  { label: 'Bio 3', key: 'bio3' },
                  { label: 'Bio 4', key: 'bio4' },
                  { label: 'Image', key: 'image' },
                ].map(({ label, key }) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-[#a0a0a0]">{label}</span>
                    <span className={content[key] ? 'text-[#2d6a2d] font-semibold' : 'text-[#b0b0b0]'}>
                      {content[key] ? 'Set' : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {loading ? (
            <p className="text-[#b0b0b0] text-sm">Loading...</p>
          ) : selectedSection === 'portrait' ? (
            <div className="bg-white border border-[#b0b0b0]/30 rounded-xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#8a8a8a]">
                <div className="w-10 h-px bg-[#7a7a7a]"></div>
                <p className="text-xs font-semibold text-[#b0b0b0] uppercase tracking-[3px]">Portrait</p>
              </div>

              <div className="relative w-full max-w-sm aspect-[3/4] bg-[#F8FAFB] rounded-xl border border-[#8a8a8a] overflow-hidden mb-4 flex items-center justify-center">
                {portraitPath ? (
                  <Image src={portraitPath} alt="Portrait" fill className="object-cover" sizes="400px" />
                ) : (
                  <svg className="w-12 h-12 text-[#b0b0b0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMediaOpen(true)}
                  className="px-5 py-2.5 bg-[#7a7a7a] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  {portraitPath ? 'Replace Portrait' : 'Upload Portrait'}
                </button>
                {portraitPath && (
                  <button
                    onClick={() => {
                      const newForm = { ...form, image: '' };
                      setForm(newForm);
                      saveImage('');
                    }}
                    className="px-4 py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
              {portraitPath && <p className="text-xs text-[#b0b0b0] mt-3">{portraitPath}</p>}
            </div>
          ) : (
            <div className="bg-white border border-[#b0b0b0]/30 rounded-xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#8a8a8a]">
                <div className="w-10 h-px bg-[#7a7a7a]"></div>
                <p className="text-xs font-semibold text-[#b0b0b0] uppercase tracking-[3px]">Biography</p>
              </div>
              <p className="text-xs text-[#b0b0b0] mb-6">Edit the headline and bio paragraphs</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-[#b0b0b0] uppercase tracking-[3px] mb-2">Headline</label>
                  <input
                    type="text"
                    value={form.headline}
                    onChange={(e) => setForm({ ...form, headline: e.target.value })}
                    placeholder="e.g. International DJ & Grammy Winning Producer"
                    className="w-full px-4 py-2.5 bg-white border border-[#b0b0b0]/30 rounded-lg text-[#7a7a7a] text-sm focus:outline-none focus:border-[#7a7a7a] transition-colors"
                  />
                </div>

                {[1, 2, 3, 4].map((n) => {
                  const key = `bio${n}` as const;
                  return (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-[#b0b0b0] uppercase tracking-[3px] mb-2">
                        Bio Paragraph {n}
                      </label>
                      <textarea
                        value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        placeholder={`Bio paragraph ${n}...`}
                        rows={4}
                        className="w-full px-4 py-2.5 bg-white border border-[#b0b0b0]/30 rounded-lg text-[#7a7a7a] text-sm focus:outline-none focus:border-[#7a7a7a] transition-colors resize-y"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={saveBiography}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-7 py-3 bg-[#3a3a3a] text-white rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] hover:bg-[#7a7a7a] transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Biography'}
                </button>
                {!hasData && (
                  <span className="text-xs text-amber-600">No existing data — saving will create it</span>
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
