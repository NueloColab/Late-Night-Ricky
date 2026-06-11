'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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

interface ShowreelVideo {
  id: string;
  src: string;
  title: string;
  poster: string;
  year: string;
  description: string;
}

interface ShowreelCard {
  id: string;
  imagePath: string;
  title: string;
  subtitle: string;
  description: string;
}

const SHOWREEL_SECTIONS = ['video', 'videos', 'cards'];

const inputClass = 'w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C] transition-colors';

export default function ShowreelEditor() {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>('video');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<{ section: string; index?: number; field?: string } | null>(null);

  const fetchSections = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/sections?page=showreel');
    if (res.ok) {
      const data = await res.json();
      setSections(data.sections || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // Auto-create missing sections
  useEffect(() => {
    async function seedMissing() {
      const needed = ['video', 'videos', 'cards'];
      const missing = needed.filter((name) => !sections.some((s) => s.section === name));
      if (missing.length === 0) return;

      const created: SectionData[] = [];
      for (const name of missing) {
        const body: any = { page: 'showreel', section: name, order: needed.indexOf(name), isActive: true };
        if (name === 'videos' || name === 'cards') body.content = [];
        const res = await fetch('/api/sections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.section) created.push(data.section);
        }
      }
      if (created.length > 0) {
        setSections((prev) => [...prev, ...created]);
      }
    }
    if (!loading && sections.length < 3) {
      seedMissing();
    }
  }, [loading, sections]);

  const mainVideoSection = sections.find((s) => s.section === 'video');
  const mainVideoPath = mainVideoSection?.videos?.[0] || '';

  const gallerySection = sections.find((s) => s.section === 'videos');
  let galleryVideos: ShowreelVideo[] = [];
  try {
    const parsed = typeof gallerySection?.content === 'string' ? JSON.parse(gallerySection.content || '[]') : (gallerySection?.content || []);
    if (Array.isArray(parsed)) galleryVideos = parsed;
  } catch { /* ignore */ }

  const cardsSection = sections.find((s) => s.section === 'cards');
  let showreelCards: ShowreelCard[] = [];
  try {
    const parsed = typeof cardsSection?.content === 'string' ? JSON.parse(cardsSection.content || '[]') : (cardsSection?.content || []);
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
      showreelCards = parsed;
    }
  } catch { /* ignore */ }

  async function saveSection(sectionName: string, updates: Partial<SectionData>) {
    const section = sections.find((s) => s.section === sectionName);
    if (!section) return;
    setSaving(true);
    await fetch(`/api/sections/${section.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    await fetchSections();
    setSaving(false);
  }

  function openMedia(target: { section: string; index?: number; field?: string }) {
    setMediaTarget(target);
    setMediaOpen(true);
  }

  function handleMediaSelect(path: string) {
    if (!mediaTarget) return;
    const { section, index, field } = mediaTarget;

    if (section === 'video') {
      setSections((prev) => prev.map((s) => s.section === 'video' ? { ...s, videos: [path] } : s));
      saveSection('video', { videos: [path] });
    } else if (section === 'videos' && typeof index === 'number') {
      const updated = galleryVideos.map((v, i) => i === index ? { ...v, [field || 'src']: path } : v);
      setSections((prev) => prev.map((s) => s.section === 'videos' ? { ...s, content: updated } : s));
      saveSection('videos', { content: updated });
    }
    setMediaOpen(false);
    setMediaTarget(null);
  }

  // --- Main Video Section ---
  function renderMainVideo() {
    return (
      <div className="bg-white border border-[#A3B5C4]/30 rounded-xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E3E8ED]">
          <div className="w-10 h-px bg-[#1B3A4C]"></div>
          <p className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px]">Main Video</p>
        </div>

        <p className="text-sm text-[#6B8FAB] mb-4">This video appears as the background on the homepage hero section.</p>

        <div className="relative w-full max-w-lg aspect-video bg-[#F8FAFB] rounded-xl overflow-hidden mb-4 border border-[#E3E8ED] flex items-center justify-center">
          {mainVideoPath ? (
            <video src={mainVideoPath} className="w-full h-full object-cover" controls />
          ) : (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#A3B5C4" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px]">Video URL</label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={mainVideoPath}
              onChange={(e) => {
                setSections((prev) => prev.map((s) => s.section === 'video' ? { ...s, videos: [e.target.value] } : s));
              }}
              placeholder="https://... or /assets/video.mp4"
              className={`${inputClass} flex-1`}
            />
            <button
              onClick={() => mainVideoPath && saveSection('video', { videos: [mainVideoPath] })}
              disabled={saving || !mainVideoPath}
              className="px-5 py-2.5 bg-[#1B3A4C] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>

          <p className="text-xs text-[#6B8FAB]">Or upload a video file:</p>
          <button
            onClick={() => openMedia({ section: 'video' })}
            className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition"
          >
            Upload Video
          </button>
        </div>
      </div>
    );
  }

  // --- Gallery Videos Section ---
  function addGalleryVideo() {
    const newVideo: ShowreelVideo = {
      id: `video-${Date.now()}`,
      src: '',
      title: 'New Showreel',
      poster: '/assets/ricky-hero-new.jpg',
      year: new Date().getFullYear().toString(),
      description: '',
    };
    const updated = [...galleryVideos, newVideo];
    setSections((prev) => prev.map((s) => s.section === 'videos' ? { ...s, content: updated } : s));
  }

  function updateGalleryVideo(id: string, field: string, value: string) {
    const updated = galleryVideos.map((v) => (v.id === id ? { ...v, [field]: value } : v));
    setSections((prev) => prev.map((s) => s.section === 'videos' ? { ...s, content: updated } : s));
  }

  function removeGalleryVideo(id: string) {
    const updated = galleryVideos.filter((v) => v.id !== id);
    setSections((prev) => prev.map((s) => s.section === 'videos' ? { ...s, content: updated } : s));
  }

  function moveGalleryVideo(id: string, dir: 'up' | 'down') {
    const idx = galleryVideos.findIndex((v) => v.id === id);
    if (idx === -1) return;
    const newIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= galleryVideos.length) return;
    const updated = [...galleryVideos];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    setSections((prev) => prev.map((s) => s.section === 'videos' ? { ...s, content: updated } : s));
  }

  function renderGalleryVideos() {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-[#A3B5C4]/30 rounded-xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-px bg-[#1B3A4C]"></div>
              <p className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px]">Showreel Videos</p>
            </div>
            <button
              onClick={addGalleryVideo}
              className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition"
            >
              + Add Video
            </button>
          </div>

          <p className="text-sm text-[#6B8FAB] mb-4">These videos appear in the gallery on the /showreel page.</p>

          <div className="space-y-4">
            {galleryVideos.map((video, idx) => (
              <div key={video.id} className="border border-[#A3B5C4]/30 rounded-xl p-4 bg-[#F8FAFB]">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px]">#{idx + 1}</span>
                  <div className="flex items-center gap-1 ml-auto">
                    <button onClick={() => moveGalleryVideo(video.id, 'up')} disabled={idx === 0}
                      className="p-1.5 text-[#A3B5C4] hover:text-[#1B3A4C] hover:bg-[#E3E8ED] rounded-lg transition-colors disabled:opacity-30"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg></button>
                    <button onClick={() => moveGalleryVideo(video.id, 'down')} disabled={idx === galleryVideos.length - 1}
                      className="p-1.5 text-[#A3B5C4] hover:text-[#1B3A4C] hover:bg-[#E3E8ED] rounded-lg transition-colors disabled:opacity-30"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg></button>
                    <button onClick={() => removeGalleryVideo(video.id)}
                      className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Video URL</label>
                      <div className="flex items-center gap-2">
                        <input type="text" value={video.src} onChange={(e) => updateGalleryVideo(video.id, 'src', e.target.value)}
                          placeholder="https://... or /assets/video.mp4" className={`${inputClass} flex-1`} />
                        <button onClick={() => openMedia({ section: 'videos', index: idx, field: 'src' })}
                          className="px-3 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#111] hover:text-white transition shrink-0">Upload</button>
                      </div>
                    </div>
                    <div><label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Title</label>
                      <input type="text" value={video.title} onChange={(e) => updateGalleryVideo(video.id, 'title', e.target.value)} className={inputClass} /></div>
                    <div><label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Year</label>
                      <input type="text" value={video.year} onChange={(e) => updateGalleryVideo(video.id, 'year', e.target.value)} className={inputClass} /></div>
                    <div><label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Description</label>
                      <textarea value={video.description} onChange={(e) => updateGalleryVideo(video.id, 'description', e.target.value)} rows={3} className={`${inputClass} resize-y`} /></div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Preview</label>
                    <div className="relative w-full aspect-video bg-[#F8FAFB] rounded-xl overflow-hidden border border-[#E3E8ED]">
                      {video.src ? (
                        <video src={video.src} className="w-full h-full object-cover" controls />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#A3B5C4" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {galleryVideos.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button onClick={() => saveSection('videos', { content: galleryVideos })}
                disabled={saving}
                className="inline-flex items-center gap-2 px-7 py-3 bg-[#111] text-white rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] hover:bg-[#1B3A4C] transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Videos'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Cards Section ---
  function addCard() {
    const newCard: ShowreelCard = {
      id: `card-${Date.now()}`,
      imagePath: '',
      title: 'New Card',
      subtitle: '',
      description: '',
    };
    const updated = [...showreelCards, newCard];
    setSections((prev) => prev.map((s) => s.section === 'cards' ? { ...s, content: updated } : s));
  }

  function updateCard(id: string, field: string, value: string) {
    const updated = showreelCards.map((c) => (c.id === id ? { ...c, [field]: value } : c));
    setSections((prev) => prev.map((s) => s.section === 'cards' ? { ...s, content: updated } : s));
  }

  function removeCard(id: string) {
    const updated = showreelCards.filter((c) => c.id !== id);
    setSections((prev) => prev.map((s) => s.section === 'cards' ? { ...s, content: updated } : s));
  }

  function moveCard(id: string, dir: 'up' | 'down') {
    const idx = showreelCards.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const newIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= showreelCards.length) return;
    const updated = [...showreelCards];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    setSections((prev) => prev.map((s) => s.section === 'cards' ? { ...s, content: updated } : s));
  }

  function renderCards() {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-[#A3B5C4]/30 rounded-xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-px bg-[#1B3A4C]"></div>
              <p className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px]">Showreel Cards</p>
            </div>
            <button onClick={addCard}
              className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition"
            >
              + Add Card
            </button>
          </div>

          <div className="space-y-4">
            {showreelCards.map((card, idx) => (
              <div key={card.id} className="border border-[#A3B5C4]/30 rounded-xl p-4 bg-[#F8FAFB]">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px]">#{idx + 1}</span>
                  <div className="flex items-center gap-1 ml-auto">
                    <button onClick={() => moveCard(card.id, 'up')} disabled={idx === 0}
                      className="p-1.5 text-[#A3B5C4] hover:text-[#1B3A4C] hover:bg-[#E3E8ED] rounded-lg transition-colors disabled:opacity-30"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg></button>
                    <button onClick={() => moveCard(card.id, 'down')} disabled={idx === showreelCards.length - 1}
                      className="p-1.5 text-[#A3B5C4] hover:text-[#1B3A4C] hover:bg-[#E3E8ED] rounded-lg transition-colors disabled:opacity-30"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg></button>
                    <button onClick={() => removeCard(card.id)}
                      className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div><label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Image URL</label>
                      <input type="text" value={card.imagePath} onChange={(e) => updateCard(card.id, 'imagePath', e.target.value)} className={inputClass} /></div>
                    <div><label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Title</label>
                      <input type="text" value={card.title} onChange={(e) => updateCard(card.id, 'title', e.target.value)} className={inputClass} /></div>
                    <div><label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Subtitle</label>
                      <input type="text" value={card.subtitle} onChange={(e) => updateCard(card.id, 'subtitle', e.target.value)} className={inputClass} /></div>
                    <div><label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Description</label>
                      <textarea value={card.description} onChange={(e) => updateCard(card.id, 'description', e.target.value)} rows={3} className={`${inputClass} resize-y`} /></div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Preview</label>
                    <div className="relative w-full aspect-video bg-[#F8FAFB] rounded-xl overflow-hidden border border-[#E3E8ED] flex items-center justify-center">
                      {card.imagePath ? (
                        <img src={card.imagePath} alt={card.title} className="object-cover w-full h-full" />
                      ) : (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A3B5C4" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showreelCards.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button onClick={() => saveSection('cards', { content: showreelCards })}
                disabled={saving}
                className="inline-flex items-center gap-2 px-7 py-3 bg-[#111] text-white rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] hover:bg-[#1B3A4C] transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Cards'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const sectionLabels: Record<string, string> = {
    video: 'Main Video',
    videos: 'Showreel Videos',
    cards: 'Showreel Cards',
  };

      <Link
        href="/admin/content"
        className="inline-flex items-center gap-2 text-sm text-[#1B3A4C] hover:text-[#111] transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        <span>Back to Content</span>
      </Link>
  return (
    <div className="max-w-5xl">
      <div className="mb-12">
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">Page Editor</p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#111] tracking-[-2px] uppercase leading-[0.95]">Showreel Page</h1>
            <p className="text-sm text-[#5B7A8E] mt-4 font-semibold uppercase tracking-[0.5px]">Edit main video, gallery videos and cards</p>
          </div>
          <a href="/showreel" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition"
          >
            View on Site
          </a>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white border border-[#A3B5C4]/30 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E3E8ED]">
              <p className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px]">Sections</p>
            </div>
            <div className="divide-y divide-[#E3E8ED]">
              {SHOWREEL_SECTIONS.map((name) => (
                <button
                  key={name}
                  onClick={() => setSelectedSection(name)}
                  className={`w-full text-left px-5 py-3 text-sm font-semibold transition-colors flex items-center justify-between ${
                    selectedSection === name ? 'bg-[#1B3A4C] text-white' : 'text-[#1B3A4C] hover:bg-[#F8FAFB]'
                  }`}
                >
                  <span>{sectionLabels[name]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {loading ? (
            <p className="text-[#6B8FAB] text-sm">Loading...</p>
          ) : selectedSection === 'video' ? (
            renderMainVideo()
          ) : selectedSection === 'videos' ? (
            renderGalleryVideos()
          ) : selectedSection === 'cards' ? (
            renderCards()
          ) : null}
        </div>
      </div>

      <MediaPicker
        open={mediaOpen}
        onClose={() => { setMediaOpen(false); setMediaTarget(null); }}
        onSelect={handleMediaSelect}
        filterType="video"
      />
    </div>
  );
}
