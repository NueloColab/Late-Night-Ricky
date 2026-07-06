'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import MediaPicker from '@/components/media-picker';

interface SectionData {
  id: number;
  page: string;
  section: string;
  content: any;
  order: number;
  isActive: boolean;
  isVisible: boolean;
}

function parseContent(content: any): Record<string, any> {
  if (!content) return {};
  if (typeof content === 'string') {
    try { return JSON.parse(content); } catch { return {}; }
  }
  return content;
}

export default function AboutEditor() {
  const [section, setSection] = useState<SectionData | null>(null);
  const [content, setContent] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<string>('');

  const fields = [
    { key: 'headline', label: 'Headline', type: 'text' as const },
    { key: 'quote', label: 'Quote', type: 'textarea' as const },
    { key: 'quoteAttribution', label: 'Quote Attribution', type: 'text' as const },
    { key: 'bio1', label: 'Bio Paragraph 1', type: 'textarea' as const },
    { key: 'bio2', label: 'Bio Paragraph 2', type: 'textarea' as const },
    { key: 'bio3', label: 'Bio Paragraph 3', type: 'textarea' as const },
    { key: 'bio4', label: 'Bio Paragraph 4', type: 'textarea' as const },
    { key: 'image', label: 'About Image', type: 'image' as const },
    { key: 'aboutGrayscale', label: 'Black & White Filter', type: 'toggle' as const },
    { key: 'aboutBrownFilter', label: 'Brown / Sepia Filter', type: 'toggle' as const },
    { key: 'aboutGoldFilter', label: 'Gold Tint Filter', type: 'toggle' as const },
    { key: 'aboutHeadingImage', label: '"About" Heading Image', type: 'image' as const },
    { key: 'rickyTextImage', label: '"Ricky" Heading Image', type: 'image' as const },
    { key: 'pressPackLink', label: 'Press Pack File', type: 'image' as const },
    { key: 'pressPackPin', label: 'Press Pack PIN (4 digits)', type: 'text' as const },
  ];

  const fetchSection = useCallback(async () => {
    try {
      const res = await fetch('/api/sections?page=about');
      if (res.ok) {
        const data = await res.json();
        const sections: SectionData[] = data.sections || [];
        const intro = sections.find((s: SectionData) => s.section === 'intro');
        if (intro) {
          setSection(intro);
          setContent(parseContent(intro.content));
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSection(); }, [fetchSection]);

  function updateContent(key: string, value: any) {
    setContent(prev => ({ ...prev, [key]: value }));
  }

  async function saveSection() {
    setSaving(true);
    try {
      if (section) {
        await fetch(`/api/sections/${section.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });
      } else {
        await fetch('/api/sections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page: 'about', section: 'intro', order: 0, content, isActive: true }),
        });
      }
      await fetchSection();
    } catch (err) {
      console.error('Save error:', err);
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function toggleVisibility() {
    if (!section) return;
    setSaving(true);
    try {
      await fetch(`/api/sections/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !section.isVisible }),
      });
      await fetchSection();
    } catch (err) {
      console.error('Toggle error:', err);
    } finally {
      setSaving(false);
    }
  }

  function handleMediaSelect(path: string) {
    if (!mediaTarget) return;
    updateContent(mediaTarget, path);
    setMediaOpen(false);
  }

  if (loading) return <div className="p-8 text-[#6B8FAB]">Loading...</div>;

  return (
    <div className="max-w-5xl">
      <Link href="/admin/content" className="inline-flex items-center gap-2 text-sm text-[#1B3A4C] hover:text-[#111] transition-colors mb-6">
        <ArrowLeft size={14} />
        <span>Back to Content</span>
      </Link>

      <div className="mb-12">
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">CMS</p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#111] tracking-[-2px] uppercase leading-[0.95]">About Page Editor</h1>
            <p className="text-sm text-[#a0a0a0] mt-4 font-semibold uppercase tracking-[0.5px]">Edit headline, bio, quote, images and press pack</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/about" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#E3E8ED] transition">
              View on Site
            </a>
            <button
              onClick={toggleVisibility}
              disabled={!section}
              className="inline-flex items-center gap-2 px-5 py-3 border-2 border-[#6B8FAB]/30 rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#6B8FAB] hover:bg-[#6B8FAB] hover:text-white transition disabled:opacity-50"
            >
              {section && !section.isVisible ? <><EyeOff size={14} /> Hidden</> : <><Eye size={14} /> Visible</>}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#6B8FAB]/30 rounded-xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E3E8ED]">
          <div className="w-10 h-px bg-[#1B3A4C]"></div>
          <p className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px]">About / Quote</p>
          {section && !section.isVisible && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">Hidden</span>}
        </div>

        <div className="space-y-5">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  value={content[field.key] || ''}
                  onChange={(e) => updateContent(field.key, e.target.value)}
                  placeholder={field.label}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C] transition-colors resize-y"
                />
              ) : field.type === 'image' ? (
                <div>
                  {content[field.key] ? (
                    <div className="w-full max-w-md aspect-video bg-[#E3E8ED] rounded-xl overflow-hidden mb-2 border border-[#6B8FAB]/30">
                      {content[field.key].match(/\.(mp4|webm|mov|avi)$/i) ? (
                        <video src={content[field.key]} className="w-full h-full object-contain" controls muted />
                      ) : content[field.key].match(/\.pdf$/i) ? (
                        <div className="flex flex-col items-center justify-center h-full p-6">
                          <svg className="w-12 h-12 text-[#6B8FAB] mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M9 15h6" /><path d="M9 11h6" /></svg>
                          <span className="text-xs text-[#6B8FAB] font-semibold">PDF Document</span>
                        </div>
                      ) : (
                        <img src={content[field.key]} alt={field.label} className="object-contain w-full h-full p-4" />
                      )}
                    </div>
                  ) : null}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setMediaTarget(field.key); setMediaOpen(true); }}
                      className="px-5 py-2.5 bg-[#1B3A4C] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      {content[field.key] ? 'Replace Media' : 'Upload Image / Video / PDF'}
                    </button>
                    {content[field.key] && (
                      <button
                        onClick={() => updateContent(field.key, '')}
                        className="px-4 py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  value={content[field.key] || ''}
                  onChange={(e) => updateContent(field.key, e.target.value)}
                  placeholder={field.label}
                  className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C] transition-colors"
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={saveSection}
            disabled={saving}
            className="px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#1B3A4C] hover:text-white transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save About'}
          </button>
          {!section && <span className="text-xs text-amber-600">No existing data — saving will create it</span>}
        </div>
      </div>

      <MediaPicker open={mediaOpen} onClose={() => setMediaOpen(false)} onSelect={handleMediaSelect} filterType="all" />
    </div>
  );
}