'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, GripVertical, Trash2, Plus, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import MediaPicker from '@/components/media-picker';

// ─── Types ───

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
  isVisible: boolean;
}

interface ShowCard {
  id: number;
  order: number;
  imagePath: string | null;
  venue: string;
  location: string;
  season: string;
  title: string;
  description: string;
  href: string;
  isActive: boolean;
}

interface Track {
  id: number;
  order: number;
  title: string;
  filePath: string | null;
  coverPath: string | null;
  duration: string | null;
  spotifyUrl: string | null;
  appleMusicUrl: string | null;
  youtubeUrl: string | null;
  isActive: boolean;
}

// ─── Section order matching the live front end ───

const HOME_SECTIONS = [
  { key: 'hero', label: 'Hero' },
  { key: 'video', label: 'Showreel' },
  { key: 'about', label: 'About / Quote' },
  { key: 'moments', label: 'Late Night Moments' },
  { key: 'performers', label: 'Has Performed With' },
  { key: 'venues', label: 'Worldwide Performances' },
  { key: 'radio', label: 'Music & Mixes' },
  { key: 'share_music', label: 'Share Your Music' },
  { key: 'brands', label: 'Trusted by Global Brands' },
  { key: 'contact_section', label: 'Contact' },
  { key: 'footer', label: 'Footer' },
];

function parseContent(content: any): Record<string, any> {
  if (!content) return {};
  if (typeof content === 'string') {
    try { return JSON.parse(content); } catch { return {}; }
  }
  return content;
}

// ─── Main Component ───

export default function HomeEditor() {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>(typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('section') || 'hero' : 'hero');
  const [showCards, setShowCards] = useState<ShowCard[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<{ type: string; id?: number; field?: string } | null>(null);
  const [playingTrack, setPlayingTrack] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function flash(msg: string) {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(null), 2000);
  }

  const fetchSections = useCallback(async () => {
    const res = await fetch('/api/sections?page=home');
    if (res.ok) {
      const data = await res.json();
      const homeSections = data.sections || [];
      // Fetch about section separately since it's on a different page
      const aboutRes = await fetch('/api/sections?page=about');
      if (aboutRes.ok) {
        const aboutData = await aboutRes.json();
        const intro = (aboutData.sections || []).find((s: any) => s.section === 'intro');
        if (intro) {
          homeSections.push({ ...intro, section: 'about' });
        }
      }
      setSections(homeSections);
    }
    setLoading(false);
  }, []);

  const fetchShowCards = useCallback(async () => {
    const res = await fetch('/api/show-cards');
    if (res.ok) { const data = await res.json(); setShowCards(data.cards || []); }
  }, []);

  const fetchTracks = useCallback(async () => {
    const res = await fetch('/api/public/tracks');
    if (res.ok) { const data = await res.json(); setTracks(data.tracks || []); }
  }, []);

  useEffect(() => { fetchSections(); fetchShowCards(); fetchTracks(); }, [fetchSections, fetchShowCards, fetchTracks]);

  function getSection(name: string): SectionData | undefined {
    return sections.find(s => s.section === name || (name === 'about' && s.section === 'intro'));
  }

  function updateContent(name: string, key: string, value: any) {
    setSections(prev => prev.map(s => {
      const match = s.section === name || (name === 'about' && s.section === 'intro');
      if (!match) return s;
      const content = parseContent(s.content);
      return { ...s, content: { ...content, [key]: value } };
    }));
  }

  async function saveSection(name: string) {
    const section = getSection(name);
    if (!section) return;
    setSaving(name);
    const payload: any = {};
    if (section.content !== undefined) payload.content = section.content;
    if (section.images !== undefined) payload.images = section.images;
    if (section.videos !== undefined) payload.videos = section.videos;
    if (section.links !== undefined) payload.links = section.links;
    payload.isVisible = section.isVisible !== undefined ? section.isVisible : true;
    await fetch(`/api/sections/${section.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(null);
    flash(`${name} saved`);
    fetchSections();
  }

  function toggleVisibility(name: string) {
    setSections(prev => prev.map(s => {
      const match = s.section === name || (name === 'about' && s.section === 'intro');
      return match ? { ...s, isVisible: !s.isVisible } : s;
    }));
  }

  function openMedia(type: string, id?: number, field?: string) {
    setMediaTarget({ type, id, field });
    setMediaOpen(true);
  }

  function handleMediaSelect(path: string) {
    if (!mediaTarget) return;
    const { type, id, field } = mediaTarget;

    if (type === 'section' && field) {
      updateContent(selectedSection, field, path);
    } else if (type === 'showcard' && id) {
      setShowCards(prev => prev.map(c => c.id === id ? { ...c, imagePath: path } : c));
    } else if (type === 'track-cover' && id) {
      setTracks(prev => prev.map(t => t.id === id ? { ...t, coverPath: path } : t));
    } else if (type === 'moments-image' && id !== undefined) {
      const section = getSection('moments');
      const content = parseContent(section?.content);
      const items = content.items || [];
      const itemIndex = Number(id);
      if (items[itemIndex]) {
        const newItems = [...items];
        newItems[itemIndex] = { ...newItems[itemIndex], images: [...(newItems[itemIndex].images || []), path] };
        updateContent('moments', 'items', newItems);
      }
    } else if (type === 'performers' && field) {
      const section = getSection('performers');
      const content = parseContent(section?.content);
      if (field === 'row1') {
        updateContent('performers', 'row1Images', [...(content.row1Images || []), path]);
      } else if (field === 'row2') {
        updateContent('performers', 'row2Images', [...(content.row2Images || []), path]);
      }
    } else if (type === 'brands-logo' && id !== undefined) {
      const section = getSection('brands');
      const content = parseContent(section?.content);
      const logos = content.logos || [];
      const newLogos = [...logos];
      newLogos[id] = { ...newLogos[id], src: path };
      updateContent('brands', 'logos', newLogos);
    }
  }

  // ─── Render ───

  return (
    <div className="max-w-7xl mx-auto relative">
      {savedMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg animate-fade-in">
          {savedMsg}
        </div>
      )}

      <Link href="/admin/content" className="inline-flex items-center gap-2 text-sm text-[#1B3A4C] hover:text-[#111] transition-colors mb-6">
        <ArrowLeft size={14} />
        <span>Back to Content</span>
      </Link>

      <div className="flex items-center justify-between mb-12">
        <div>
          <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">Page Editor</p>
          <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#111] tracking-[-2px] uppercase leading-[0.95]">
            Home Page
          </h1>
          <p className="text-sm text-[#a0a0a0] mt-4 font-semibold uppercase tracking-[0.5px]">Edit sections matching the live site</p>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#1B3A4C] hover:text-white transition">
          View on Site →
        </a>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Section nav */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white border border-[#6B8FAB]/30 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#6B8FAB]/30">
              <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold">Sections</p>
            </div>
            <div className="divide-y divide-[#6B8FAB]/20">
              {HOME_SECTIONS.map((sec) => {
                const s = getSection(sec.key);
                return (
                  <button
                    key={sec.key}
                    onClick={() => setSelectedSection(sec.key)}
                    className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors flex items-center justify-between ${
                      selectedSection === sec.key ? 'bg-[#1B3A4C] text-white' : 'text-[#1B3A4C] hover:bg-[#E3E8ED]'
                    }`}
                  >
                    <span>{sec.label}</span>
                    <div className="flex items-center gap-2">
                      {!s && <span className="text-[10px] uppercase tracking-wider opacity-60">New</span>}
                      {s && !s.isVisible && <EyeOff size={14} className="opacity-50" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Show Cards & Tracks quick nav */}
          <div className="mt-4 bg-white border border-[#6B8FAB]/30 overflow-hidden">
            <button onClick={() => setSelectedSection('showcards')} className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors flex items-center justify-between ${selectedSection === 'showcards' ? 'bg-[#1B3A4C] text-white' : 'text-[#1B3A4C] hover:bg-[#E3E8ED]'}`}>
              <span>Show Cards</span>
              <span className="text-xs text-[#6B8FAB]">{showCards.length}</span>
            </button>
            <button onClick={() => setSelectedSection('tracks')} className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors flex items-center justify-between ${selectedSection === 'tracks' ? 'bg-[#1B3A4C] text-white' : 'text-[#1B3A4C] hover:bg-[#E3E8ED]'}`}>
              <span>Music Tracks</span>
              <span className="text-xs text-[#6B8FAB]">{tracks.length}</span>
            </button>
          </div>
        </div>

        {/* Editor panel */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <p className="text-[#6B8FAB] text-sm">Loading...</p>
          ) : selectedSection === 'showcards' ? (
            <ShowCardsEditor cards={showCards} setCards={setShowCards} onOpenMedia={(id) => openMedia('showcard', id)} />
          ) : selectedSection === 'tracks' ? (
            <TracksEditor tracks={tracks} setTracks={setTracks} playingTrack={playingTrack} setPlayingTrack={setPlayingTrack} audioRef={audioRef} onOpenMedia={(id) => openMedia('track-cover', id)} />
          ) : selectedSection === 'hero' ? (
            <SectionEditor section={getSection('hero')} label="Hero" fields={[
              { key: 'tagline', label: 'Tagline', type: 'text' },
              { key: 'logo', label: 'Logo', type: 'image' },
              { key: 'image', label: 'Background Image', type: 'image' },
              { key: 'grayscale', label: 'Black & White Filter', type: 'toggle' },
              { key: 'brownFilter', label: 'Brown / Sepia Filter', type: 'toggle' },
              { key: 'goldFilter', label: 'Gold Tint Filter', type: 'toggle' },
              { key: 'backgroundSize', label: 'Zoom (Background Size)', type: 'select', options: ['cover', 'contain', '120%', '150%', '200%'] },
              { key: 'backgroundPosition', label: 'Focus Point', type: 'select', options: ['center', 'top', 'bottom', 'left', 'right', '70% center', '25% center'] },
            ]} onUpdate={(key, val) => updateContent('hero', key, val)} onSave={() => saveSection('hero')} saving={saving === 'hero'} onToggleVisibility={() => toggleVisibility('hero')} onOpenMedia={(field) => openMedia('section', undefined, field)} />
          ) : selectedSection === 'video' ? (
            <SectionEditor section={getSection('video')} label="Showreel" fields={[
              { key: 'src', label: 'Video File', type: 'text' },
              { key: 'poster', label: 'Poster Image', type: 'image' },
            ]} onUpdate={(key, val) => updateContent('video', key, val)} onSave={() => saveSection('video')} saving={saving === 'video'} onToggleVisibility={() => toggleVisibility('video')} onOpenMedia={(field) => openMedia('section', undefined, field)} />
          ) : selectedSection === 'about' ? (
            <SectionEditor section={getSection('about')} label="About / Quote" fields={[
              { key: 'headline', label: 'Headline', type: 'text' },
              { key: 'quote', label: 'Quote', type: 'textarea' },
              { key: 'quoteAttribution', label: 'Quote Attribution', type: 'text' },
              { key: 'bio1', label: 'Bio Paragraph 1', type: 'textarea' },
              { key: 'bio2', label: 'Bio Paragraph 2', type: 'textarea' },
              { key: 'bio3', label: 'Bio Paragraph 3', type: 'textarea' },
              { key: 'bio4', label: 'Bio Paragraph 4', type: 'textarea' },
              { key: 'image', label: 'About Image', type: 'image' },
              { key: 'aboutGrayscale', label: 'Black & White Filter', type: 'toggle' },
              { key: 'aboutBrownFilter', label: 'Brown / Sepia Filter', type: 'toggle' },
              { key: 'aboutGoldFilter', label: 'Gold Tint Filter', type: 'toggle' },
              { key: 'aboutHeadingImage', label: '"About" Heading Image', type: 'image' },
              { key: 'rickyTextImage', label: '"Ricky" Heading Image', type: 'image' },
              { key: 'pressPackLink', label: 'Press Pack File', type: 'image' },
              { key: 'pressPackPin', label: 'Press Pack PIN (4 digits)', type: 'text' },
            ]} onUpdate={(key, val) => updateContent('about', key, val)} onSave={() => saveSection('about')} saving={saving === 'about'} onToggleVisibility={() => toggleVisibility('about')} onOpenMedia={(field) => openMedia('section', undefined, field)} />
          ) : selectedSection === 'moments' ? (
            <MomentsEditor section={getSection('moments')} onUpdate={(key, val) => updateContent('moments', key, val)} onSave={() => saveSection('moments')} saving={saving === 'moments'} onToggleVisibility={() => toggleVisibility('moments')} onOpenMedia={(field) => openMedia('section', undefined, field)} setMediaTarget={setMediaTarget} setMediaOpen={setMediaOpen} />
          ) : selectedSection === 'performers' ? (
            <PerformersEditor section={getSection('performers')} onUpdate={(key, val) => updateContent('performers', key, val)} onSave={() => saveSection('performers')} saving={saving === 'performers'} onToggleVisibility={() => toggleVisibility('performers')} onOpenMedia={(field) => openMedia('section', undefined, field)} setMediaTarget={setMediaTarget} setMediaOpen={setMediaOpen} />
          ) : selectedSection === 'venues' ? (
            <VenuesEditor section={getSection('venues')} onUpdate={(key, val) => updateContent('venues', key, val)} onSave={() => saveSection('venues')} saving={saving === 'venues'} onToggleVisibility={() => toggleVisibility('venues')} onOpenMedia={(field) => openMedia('section', undefined, field)} setMediaTarget={setMediaTarget} setMediaOpen={setMediaOpen} />
          ) : selectedSection === 'radio' ? (
            <SectionEditor section={getSection('radio')} label="Music & Mixes" fields={[
              { key: 'label', label: 'Label Tag', type: 'text' },
              { key: 'headline', label: 'Headline', type: 'text' },
              { key: 'description', label: 'Description', type: 'textarea' },
              { key: 'image', label: 'Section Image', type: 'image' },
              { key: 'spotifyUrl', label: 'Spotify URL', type: 'text' },
              { key: 'appleMusicUrl', label: 'Apple Music URL', type: 'text' },
              { key: 'youtubeUrl', label: 'YouTube URL', type: 'text' },
            ]} onUpdate={(key, val) => updateContent('radio', key, val)} onSave={() => saveSection('radio')} saving={saving === 'radio'} onToggleVisibility={() => toggleVisibility('radio')} onOpenMedia={(field) => openMedia('section', undefined, field)} />
          ) : selectedSection === 'share_music' ? (
            <SectionEditor section={getSection('share_music')} label="Share Your Music" fields={[
              { key: 'heading', label: 'Heading', type: 'text' },
              { key: 'description', label: 'Description', type: 'textarea' },
              { key: 'ctaText', label: 'CTA Button Text', type: 'text' },
              { key: 'ctaLink', label: 'CTA Link', type: 'text' },
            ]} onUpdate={(key, val) => updateContent('share_music', key, val)} onSave={() => saveSection('share_music')} saving={saving === 'share_music'} onToggleVisibility={() => toggleVisibility('share_music')} onOpenMedia={(field) => openMedia('section', undefined, field)} />
          ) : selectedSection === 'brands' ? (
            <BrandsEditor section={getSection('brands')} onUpdate={(key, val) => updateContent('brands', key, val)} onSave={() => saveSection('brands')} saving={saving === 'brands'} onToggleVisibility={() => toggleVisibility('brands')} onOpenMedia={(field) => openMedia('section', undefined, field)} setMediaTarget={setMediaTarget} setMediaOpen={setMediaOpen} />
          ) : selectedSection === 'contact_section' ? (
            <SectionEditor section={getSection('contact_section')} label="Contact" fields={[
              { key: 'heading', label: 'Heading', type: 'text' },
              { key: 'bookingEmail', label: 'Booking Email', type: 'text' },
              { key: 'instagram', label: 'Instagram', type: 'text' },
              { key: 'instagramUrl', label: 'Instagram URL', type: 'text' },
              { key: 'youtubeUrl', label: 'YouTube URL', type: 'text' },
              { key: 'spotifyUrl', label: 'Spotify URL', type: 'text' },
              { key: 'appleMusicUrl', label: 'Apple Music URL', type: 'text' },
              { key: 'tiktokUrl', label: 'TikTok URL', type: 'text' },
              { key: 'twitterUrl', label: 'Twitter/X URL', type: 'text' },
              { key: 'facebookUrl', label: 'Facebook URL', type: 'text' },
            ]} onUpdate={(key, val) => updateContent('contact_section', key, val)} onSave={() => saveSection('contact_section')} saving={saving === 'contact_section'} onToggleVisibility={() => toggleVisibility('contact_section')} onOpenMedia={(field) => openMedia('section', undefined, field)} />
          ) : selectedSection === 'footer' ? (
            <SectionEditor section={getSection('footer')} label="Footer" fields={[
              { key: 'copyright', label: 'Copyright Text', type: 'text' },
              { key: 'poweredBy', label: 'Powered By Text', type: 'text' },
              { key: 'poweredByUrl', label: 'Powered By URL', type: 'text' },
              { key: 'logo', label: 'Footer Logo', type: 'image' },
            ]} onUpdate={(key, val) => updateContent('footer', key, val)} onSave={() => saveSection('footer')} saving={saving === 'footer'} onToggleVisibility={() => toggleVisibility('footer')} onOpenMedia={(field) => openMedia('section', undefined, field)} />
          ) : (
            <p className="text-[#6B8FAB] text-sm">Select a section to edit.</p>
          )}
        </div>
      </div>

      <MediaPicker open={mediaOpen} onClose={() => setMediaOpen(false)} onSelect={handleMediaSelect} filterType="all" />
    </div>
  );
}

// ─── Generic Section Editor ───

function SectionEditor({ section, label, fields, onUpdate, onSave, saving, onToggleVisibility, onOpenMedia }: {
  section?: SectionData;
  label: string;
  fields: { key: string; label: string; type: 'text' | 'textarea' | 'image' | 'toggle' | 'select'; options?: string[] }[];
  onUpdate: (key: string, val: any) => void;
  onSave: () => void | Promise<void>;
  saving: boolean;
  onToggleVisibility: () => void;
  onOpenMedia: (field: string) => void;
}) {
  if (!section) {
    return (
      <div className="bg-white border border-[#6B8FAB]/30 p-8">
        <p className="text-[#6B8FAB] text-sm">This section doesn&apos;t exist in the database yet. Try selecting another section.</p>
      </div>
    );
  }
  const content = parseContent(section.content);

  return (
    <div className="bg-white border border-[#6B8FAB]/30 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-1">{label}</p>
          <p className="text-sm text-[#a0a0a0] font-semibold uppercase tracking-[0.5px]">Edit content for this section</p>
        </div>
        <button
          onClick={onToggleVisibility}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[1px] border-2 transition ${
            section.isVisible !== false
              ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-50'
              : 'border-[#6B8FAB]/30 text-[#6B8FAB] hover:bg-[#E3E8ED]'
          }`}
        >
          {section.isVisible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
          {section.isVisible !== false ? 'Visible' : 'Hidden'}
        </button>
      </div>

      <div className="space-y-4">
        {fields.map(field => {
          const value = content[field.key];
          if (field.type === 'text') {
            return (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">{field.label}</label>
                <input
                  type="text"
                  value={value || ''}
                  onChange={(e) => onUpdate(field.key, e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
                />
              </div>
            );
          }
          if (field.type === 'textarea') {
            return (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">{field.label}</label>
                <textarea
                  value={value || ''}
                  onChange={(e) => onUpdate(field.key, e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C] resize-y"
                />
              </div>
            );
          }
          if (field.type === 'image') {
            return (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">{field.label}</label>
                {value && (
                  <div className="w-full aspect-video bg-[#E3E8ED] rounded-xl overflow-hidden mb-2 border border-[#6B8FAB]/30 max-w-md">
                    {value.match(/\.(mp4|webm|mov|avi)$/i) ? (
                      <video src={value} className="object-contain w-full h-full" controls muted />
                    ) : value.match(/\.pdf$/i) ? (
                      <div className="flex flex-col items-center justify-center h-full p-6">
                        <svg className="w-12 h-12 text-[#6B8FAB] mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M9 15h6" /><path d="M9 11h6" /></svg>
                        <span className="text-xs text-[#6B8FAB] font-semibold">PDF Document</span>
                      </div>
                    ) : (
                      <img src={value} alt={field.label} className="object-contain w-full h-full" />
                    )}
                  </div>
                )}
                <button onClick={() => onOpenMedia(field.key)} className="px-4 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#E3E8ED] hover:text-white transition">
                  {value ? 'Replace Media' : 'Upload Image / Video / PDF'}
                </button>
              </div>
            );
          }
          if (field.type === 'toggle') {
            return (
              <div key={field.key} className="flex items-center gap-2">
                <input type="checkbox" checked={value !== false} onChange={(e) => onUpdate(field.key, e.target.checked)} className="w-4 h-4 accent-[#1B3A4C]" />
                <span className="text-sm font-semibold text-[#1B3A4C]">{field.label}</span>
              </div>
            );
          }
          if (field.type === 'select') {
            return (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">{field.label}</label>
                <select value={value || field.options?.[0] || ''} onChange={(e) => onUpdate(field.key, e.target.value)} className="w-full px-3 py-2 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]">
                  {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            );
          }
          return null;
        })}
      </div>

      <div className="flex justify-end">
        <button onClick={onSave} disabled={saving} className="px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#1B3A4C] hover:text-white transition disabled:opacity-50">
          {saving ? 'Saving...' : `Save ${label}`}
        </button>
      </div>
    </div>
  );
}

// ─── Show Cards Editor ───

function ShowCardsEditor({ cards, setCards, onOpenMedia }: {
  cards: ShowCard[];
  setCards: React.Dispatch<React.SetStateAction<ShowCard[]>>;
  onOpenMedia: (id: number) => void;
}) {
  const [savingCard, setSavingCard] = useState<number | null>(null);

  async function saveCard(card: ShowCard) {
    setSavingCard(card.id);
    await fetch(`/api/show-cards/${card.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imagePath: card.imagePath, venue: card.venue, location: card.location, season: card.season, title: card.title, description: card.description, href: card.href }),
    });
    setSavingCard(null);
  }

  async function addCard() {
    const order = cards.length + 1;
    await fetch('/api/show-cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Show', venue: 'Venue', location: 'City', season: '2025', description: 'Description', imagePath: null, href: '#', order }),
    });
    const res = await fetch('/api/show-cards');
    if (res.ok) { const data = await res.json(); setCards(data.cards || []); }
  }

  async function deleteCard(id: number) {
    if (!confirm('Delete this show card?')) return;
    await fetch(`/api/show-cards/${id}`, { method: 'DELETE' });
    setCards(prev => prev.filter(c => c.id !== id));
  }

  async function moveCard(id: number, direction: 'up' | 'down') {
    const idx = cards.findIndex(c => c.id === id);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= cards.length) return;
    const newCards = [...cards];
    [newCards[idx], newCards[newIdx]] = [newCards[newIdx], newCards[idx]];
    const updated = newCards.map((c, i) => ({ ...c, order: i + 1 }));
    setCards(updated);
    await Promise.all(updated.map(c => fetch(`/api/show-cards/${c.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: c.order }) })));
  }

  return (
    <div className="bg-white border border-[#6B8FAB]/30 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-1">Show Cards</p>
          <p className="text-sm text-[#a0a0a0] font-semibold uppercase tracking-[0.5px]">Edit show cards displayed in the Late Night Moments section</p>
        </div>
        <button onClick={addCard} className="px-4 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#1B3A4C] hover:text-white transition">
          + Add Card
        </button>
      </div>

      <div className="space-y-4">
        {cards.map((card, idx) => (
          <div key={card.id} className="border border-[#6B8FAB]/30 p-4 space-y-3 bg-white">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px]">#{idx + 1}</span>
              <div className="flex items-center gap-1 ml-auto">
                <button onClick={() => moveCard(card.id, 'up')} disabled={idx === 0} className="p-1.5 text-[#6B8FAB] hover:text-[#1B3A4C] hover:bg-[#E3E8ED] rounded-lg transition-colors disabled:opacity-30"><ChevronUp size={16} /></button>
                <button onClick={() => moveCard(card.id, 'down')} disabled={idx === cards.length - 1} className="p-1.5 text-[#6B8FAB] hover:text-[#1B3A4C] hover:bg-[#E3E8ED] rounded-lg transition-colors disabled:opacity-30"><ChevronDown size={16} /></button>
                <button onClick={() => deleteCard(card.id)} className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px] mb-1">Title</label>
                <input type="text" value={card.title} onChange={(e) => setCards(prev => prev.map(c => c.id === card.id ? { ...c, title: e.target.value } : c))} className="w-full px-3 py-2 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px] mb-1">Venue</label>
                <input type="text" value={card.venue} onChange={(e) => setCards(prev => prev.map(c => c.id === card.id ? { ...c, venue: e.target.value } : c))} className="w-full px-3 py-2 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px] mb-1">Location</label>
                <input type="text" value={card.location} onChange={(e) => setCards(prev => prev.map(c => c.id === card.id ? { ...c, location: e.target.value } : c))} className="w-full px-3 py-2 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px] mb-1">Season</label>
                <input type="text" value={card.season} onChange={(e) => setCards(prev => prev.map(c => c.id === card.id ? { ...c, season: e.target.value } : c))} className="w-full px-3 py-2 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px] mb-1">Description</label>
              <textarea value={card.description} onChange={(e) => setCards(prev => prev.map(c => c.id === card.id ? { ...c, description: e.target.value } : c))} rows={2} className="w-full px-3 py-2 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C] resize-y" />
            </div>
            <div className="flex items-center gap-3">
              {card.imagePath && <div className="w-20 h-20 bg-[#E3E8ED] rounded-lg overflow-hidden border border-[#6B8FAB]/30"><img src={card.imagePath} alt="" className="w-full h-full object-cover" /></div>}
              <button onClick={() => onOpenMedia(card.id)} className="px-4 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#1B3A4C] hover:text-white transition">{card.imagePath ? 'Replace' : 'Add Image'}</button>
              <button onClick={() => saveCard(card)} disabled={savingCard === card.id} className="px-4 py-2 border border-[#6B8FAB]/50 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#1B3A4C] hover:border-[#111] transition disabled:opacity-50">{savingCard === card.id ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tracks Editor ───

function TracksEditor({ tracks, setTracks, playingTrack, setPlayingTrack, audioRef, onOpenMedia }: {
  tracks: Track[];
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
  playingTrack: number | null;
  setPlayingTrack: React.Dispatch<React.SetStateAction<number | null>>;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  onOpenMedia: (id: number) => void;
}) {
  const [savingTrack, setSavingTrack] = useState<number | null>(null);

  async function saveTrack(track: Track) {
    setSavingTrack(track.id);
    await fetch(`/api/tracks/${track.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: track.title, filePath: track.filePath, coverPath: track.coverPath, duration: track.duration, spotifyUrl: track.spotifyUrl, appleMusicUrl: track.appleMusicUrl, youtubeUrl: track.youtubeUrl, order: track.order }),
    });
    setSavingTrack(null);
  }

  async function addTrack() {
    const order = tracks.length + 1;
    await fetch('/api/tracks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Track', duration: '0:30', filePath: null, order }),
    });
    const res = await fetch('/api/public/tracks');
    if (res.ok) { const data = await res.json(); setTracks(data.tracks || []); }
  }

  async function deleteTrack(id: number) {
    if (!confirm('Delete this track?')) return;
    await fetch(`/api/tracks/${id}`, { method: 'DELETE' });
    setTracks(prev => prev.filter(t => t.id !== id));
  }

  async function uploadTrackFile(id: number, file: File) {
    const track = tracks.find(t => t.id === id);
    if (!track) return;
    setSavingTrack(id);
    try {
      const sigRes = await fetch('/api/upload-signature?' + new URLSearchParams({ filename: file.name }));
      const sigData = await sigRes.json();
      if (!sigRes.ok || sigData.error) { alert(sigData.error || 'Failed to get upload signature'); setSavingTrack(null); return; }

      const cFormData = new FormData();
      cFormData.append('file', file);
      cFormData.append('api_key', sigData.apiKey);
      cFormData.append('timestamp', sigData.timestamp);
      cFormData.append('signature', sigData.signature);
      cFormData.append('public_id', sigData.publicId);
      cFormData.append('folder', sigData.folder);
      cFormData.append('overwrite', 'true');

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`, { method: 'POST', body: cFormData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || uploadData.error) { alert(uploadData.error?.message || 'Upload failed'); setSavingTrack(null); return; }

      const saveRes = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: uploadData.secure_url, filename: sigData.publicId, originalName: file.name, type: 'audio', size: file.size }) });
      const saveData = await saveRes.json();
      if (!saveRes.ok || saveData.error) { alert(saveData.error || 'Failed to save asset'); setSavingTrack(null); return; }

      await fetch(`/api/tracks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: track.title, filePath: saveData.asset.path, duration: track.duration, order: track.order }) });
      const res = await fetch('/api/public/tracks');
      if (res.ok) { const data = await res.json(); setTracks(data.tracks || []); }
    } catch (err: any) { alert(err.message || 'Upload failed'); }
    setSavingTrack(null);
  }

  function togglePlay(trackId: number, filePath: string | null) {
    if (!filePath) return;
    if (playingTrack === trackId) { audioRef.current?.pause(); setPlayingTrack(null); }
    else { if (audioRef.current) audioRef.current.pause(); const audio = new Audio(filePath); audioRef.current = audio; audio.play().catch(() => {}); setPlayingTrack(trackId); audio.onended = () => setPlayingTrack(null); }
  }

  return (
    <div className="bg-white border border-[#6B8FAB]/30 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-1">Music Tracks</p>
          <p className="text-sm text-[#a0a0a0] font-semibold uppercase tracking-[0.5px]">Manage tracks in the Music & Mixes section</p>
        </div>
        <button onClick={addTrack} className="px-4 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#1B3A4C] hover:text-white transition">
          + Add Track
        </button>
      </div>

      <div className="space-y-3">
        {tracks.map((track, idx) => (
          <div key={track.id} className="border border-[#6B8FAB]/30 p-4 space-y-3 bg-white">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px]">#{idx + 1}</span>
              <span className="text-sm font-medium text-[#1B3A4C]">{track.title}</span>
              <button onClick={() => deleteTrack(track.id)} className="ml-auto p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px] mb-1">Title</label>
                <input type="text" value={track.title} onChange={(e) => setTracks(prev => prev.map(t => t.id === track.id ? { ...t, title: e.target.value } : t))} className="w-full px-3 py-2 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px] mb-1">Duration</label>
                <input type="text" value={track.duration || ''} onChange={(e) => setTracks(prev => prev.map(t => t.id === track.id ? { ...t, duration: e.target.value } : t))} className="w-full px-3 py-2 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px] mb-1">Spotify URL</label>
                <input type="text" value={track.spotifyUrl || ''} onChange={(e) => setTracks(prev => prev.map(t => t.id === track.id ? { ...t, spotifyUrl: e.target.value } : t))} className="w-full px-3 py-2 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px] mb-1">Apple Music URL</label>
                <input type="text" value={track.appleMusicUrl || ''} onChange={(e) => setTracks(prev => prev.map(t => t.id === track.id ? { ...t, appleMusicUrl: e.target.value } : t))} className="w-full px-3 py-2 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px] mb-1">YouTube URL</label>
                <input type="text" value={track.youtubeUrl || ''} onChange={(e) => setTracks(prev => prev.map(t => t.id === track.id ? { ...t, youtubeUrl: e.target.value } : t))} className="w-full px-3 py-2 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]" />
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {track.coverPath && <div className="w-16 h-16 bg-[#E3E8ED] rounded-lg overflow-hidden border border-[#6B8FAB]/30"><img src={track.coverPath} alt="" className="w-full h-full object-cover" /></div>}
              <button onClick={() => onOpenMedia(track.id)} className="px-3 py-1.5 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#1B3A4C] hover:text-white transition">Cover</button>
              <label className="px-3 py-1.5 border border-[#6B8FAB]/50 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#1B3A4C] hover:border-[#111] transition cursor-pointer">
                <Upload size={12} className="inline mr-1" />Audio
                <input type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadTrackFile(track.id, f); }} />
              </label>
              {track.filePath && <button onClick={() => togglePlay(track.id, track.filePath)} className="px-3 py-1.5 border border-[#6B8FAB]/50 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#1B3A4C] hover:border-[#111] transition">{playingTrack === track.id ? 'Pause' : 'Play'}</button>}
              <button onClick={() => saveTrack(track)} disabled={savingTrack === track.id} className="px-3 py-1.5 border border-[#6B8FAB]/50 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#1B3A4C] hover:border-[#111] transition disabled:opacity-50">{savingTrack === track.id ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
// ─── Moments Editor ───

function MomentsEditor({ section, onUpdate, onSave, saving, onToggleVisibility, onOpenMedia, setMediaTarget, setMediaOpen }: {
  section?: SectionData;
  onUpdate: (key: string, val: any) => void;
  onSave: () => void | Promise<void>;
  saving: boolean;
  onToggleVisibility: () => void;
  onOpenMedia: (field: string) => void; setMediaTarget: any; setMediaOpen: any;
}) {
  const content = parseContent(section?.content);
  const items: any[] = content.items || [];

  function updateItem(index: number, field: string, value: any) {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onUpdate('items', newItems);
  }
  function addItem() { onUpdate('items', [...items, { id: String(Date.now()), title: 'New Moment', subtitle: 'Venue, City', description: 'Description...', images: [] }]); }
  function removeItem(index: number) { onUpdate('items', items.filter((_: any, i: number) => i !== index)); }
  function addImage(index: number, imageUrl: string) { const newItems = [...items]; newItems[index] = { ...newItems[index], images: [...(newItems[index].images || []), imageUrl] }; onUpdate('items', newItems); }
  function removeImage(itemIndex: number, imageIndex: number) { const newItems = [...items]; newItems[itemIndex] = { ...newItems[itemIndex], images: newItems[itemIndex].images.filter((_: any, i: number) => i !== imageIndex) }; onUpdate('items', newItems); }

  if (!section) return <div className="bg-white border border-[#6B8FAB]/30 p-8"><p className="text-[#6B8FAB] text-sm">Moments section not found in database.</p></div>;

  return (
    <div className="bg-white border border-[#6B8FAB]/30 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-1">Late Night Moments</p><p className="text-sm text-[#a0a0a0] font-semibold uppercase tracking-[0.5px]">Edit moments with gallery and video</p></div>
        <button onClick={onToggleVisibility} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[1px] border-2 transition ${section.isVisible !== false ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-50' : 'border-[#6B8FAB]/30 text-[#6B8FAB] hover:bg-[#E3E8ED]'}`}>
          {section.isVisible !== false ? <Eye size={14} /> : <EyeOff size={14} />}{section.isVisible !== false ? 'Visible' : 'Hidden'}
        </button>
      </div>
      <div className="space-y-4">
        <div><label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Heading</label><input type="text" value={content.heading || ''} onChange={(e) => onUpdate('heading', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]" /></div>
        <div><label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Subtext</label><input type="text" value={content.subtext || ''} onChange={(e) => onUpdate('subtext', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]" /></div>
      </div>
      <div className="border-t border-[#6B8FAB]/20 pt-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px]">Moments ({items.length})</p>
          <button onClick={addItem} className="px-4 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#1B3A4C] hover:text-white transition">+ Add Moment</button>
        </div>
        <div className="space-y-4">
          {items.map((item: any, i: number) => (
            <div key={i} className="border border-[#6B8FAB]/30 p-4 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px]">Moment #{i + 1}</span>
                <button onClick={() => removeItem(i)} className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px] mb-1">Title</label><input type="text" value={item.title || ''} onChange={(e) => updateItem(i, 'title', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]" /></div>
                <div><label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px] mb-1">Subtitle</label><input type="text" value={item.subtitle || ''} onChange={(e) => updateItem(i, 'subtitle', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]" /></div>
              </div>
              <div><label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px] mb-1">Description</label><textarea value={item.description || ''} onChange={(e) => updateItem(i, 'description', e.target.value)} rows={2} className="w-full px-3 py-2 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C] resize-y" /></div>
              <div><label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px] mb-1">Gallery Images</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(item.images || []).map((img: string, j: number) => (
                    <div key={j} className="relative w-20 h-20 bg-[#E3E8ED] rounded-lg overflow-hidden border border-[#6B8FAB]/30 group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage(i, j)} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition">×</button>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setMediaTarget({ type: 'moments-image', id: i }); setMediaOpen(true); }} className="px-3 py-1.5 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#1B3A4C] hover:text-white transition">+ Add Image</button>
              </div>
              <div><label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px] mb-1">Video URL (optional)</label><input type="text" value={item.video || ''} onChange={(e) => updateItem(i, 'video', e.target.value)} placeholder="e.g. /assets/showreel-video.mp4" className="w-full px-3 py-2 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]" /></div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end"><button onClick={onSave} disabled={saving} className="px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#1B3A4C] hover:text-white transition disabled:opacity-50">{saving ? 'Saving...' : 'Save Moments'}</button></div>
    </div>
  );
}

// ─── Performers Editor ───

function PerformersEditor({ section, onUpdate, onSave, saving, onToggleVisibility, onOpenMedia, setMediaTarget, setMediaOpen }: {
  section?: SectionData; onUpdate: (key: string, val: any) => void; onSave: () => void | Promise<void>; saving: boolean; onToggleVisibility: () => void; onOpenMedia: (field: string) => void; setMediaTarget: any; setMediaOpen: any;
}) {
  const content = parseContent(section?.content);
  const row1Images: string[] = content.row1Images || [];
  const row2Images: string[] = content.row2Images || [];
  function addImage(row: 'row1' | 'row2', url: string) { if (row === 'row1') onUpdate('row1Images', [...row1Images, url]); else onUpdate('row2Images', [...row2Images, url]); }
  function removeImage(row: 'row1' | 'row2', index: number) { if (row === 'row1') onUpdate('row1Images', row1Images.filter((_: string, i: number) => i !== index)); else onUpdate('row2Images', row2Images.filter((_: string, i: number) => i !== index)); }

  if (!section) return <div className="bg-white border border-[#6B8FAB]/30 p-8"><p className="text-[#6B8FAB] text-sm">Performers section not found.</p></div>;

  return (
    <div className="bg-white border border-[#6B8FAB]/30 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-1">Has Performed With</p><p className="text-sm text-[#a0a0a0] font-semibold uppercase tracking-[0.5px]">Manage carousel images</p></div>
        <button onClick={onToggleVisibility} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[1px] border-2 transition ${section.isVisible !== false ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-50' : 'border-[#6B8FAB]/30 text-[#6B8FAB] hover:bg-[#E3E8ED]'}`}>
          {section.isVisible !== false ? <Eye size={14} /> : <EyeOff size={14} />}{section.isVisible !== false ? 'Visible' : 'Hidden'}
        </button>
      </div>
      <div className="space-y-4">
        <div><label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Heading</label><input type="text" value={content.heading || ''} onChange={(e) => onUpdate('heading', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]" /></div>
        <div><label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Subtext</label><input type="text" value={content.subtext || ''} onChange={(e) => onUpdate('subtext', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]" /></div>
        <div><label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Heading Image (Ricky text)</label>
          {content.headingImage && <div className="w-full aspect-video bg-[#E3E8ED] rounded-xl overflow-hidden mb-2 max-w-md border border-[#6B8FAB]/30"><img src={content.headingImage} alt="Heading" className="object-contain w-full h-full p-4" /></div>}
          <button onClick={() => onOpenMedia('headingImage')} className="px-4 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#1B3A4C] hover:text-white transition">{content.headingImage ? 'Replace Image' : 'Choose Image'}</button>
        </div>
      </div>
      {[{ key: 'row1', label: 'Row 1 (Scrolls Left)', images: row1Images }, { key: 'row2', label: 'Row 2 (Scrolls Right)', images: row2Images }].map(({ key, label, images }) => (
        <div key={key} className="border-t border-[#6B8FAB]/20 pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px]">{label}</p>
            <button onClick={() => { setMediaTarget({ type: 'performers', field: key }); setMediaOpen(true); }} className="px-3 py-1.5 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#1B3A4C] hover:text-white transition">+ Add Image</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(images as string[]).map((img: string, i: number) => (
              <div key={i} className="relative w-24 h-24 bg-[#E3E8ED] rounded-lg overflow-hidden border border-[#6B8FAB]/30 group">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button onClick={() => removeImage(key as 'row1' | 'row2', i)} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition">×</button>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex justify-end"><button onClick={onSave} disabled={saving} className="px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#1B3A4C] hover:text-white transition disabled:opacity-50">{saving ? 'Saving...' : 'Save Performers'}</button></div>
    </div>
  );
}

// ─── Venues Editor ───

function VenuesEditor({ section, onUpdate, onSave, saving, onToggleVisibility, onOpenMedia, setMediaTarget, setMediaOpen }: {
  section?: SectionData; onUpdate: (key: string, val: any) => void; onSave: () => void | Promise<void>; saving: boolean; onToggleVisibility: () => void; onOpenMedia: (field: string) => void; setMediaTarget: any; setMediaOpen: any;
}) {
  const content = parseContent(section?.content);
  const venues: string[] = content.venues || [];
  function addVenue() { const name = prompt('Enter venue name (e.g. O2 ARENA (London)):'); if (name) onUpdate('venues', [...venues, name]); }
  function removeVenue(index: number) { onUpdate('venues', venues.filter((_: string, i: number) => i !== index)); }
  function updateVenue(index: number, value: string) { const newVenues = [...venues]; newVenues[index] = value; onUpdate('venues', newVenues); }

  if (!section) return <div className="bg-white border border-[#6B8FAB]/30 p-8"><p className="text-[#6B8FAB] text-sm">Venues section not found.</p></div>;

  return (
    <div className="bg-white border border-[#6B8FAB]/30 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-1">Worldwide Performances</p><p className="text-sm text-[#a0a0a0] font-semibold uppercase tracking-[0.5px]">Manage venue list</p></div>
        <button onClick={onToggleVisibility} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[1px] border-2 transition ${section.isVisible !== false ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-50' : 'border-[#6B8FAB]/30 text-[#6B8FAB] hover:bg-[#E3E8ED]'}`}>
          {section.isVisible !== false ? <Eye size={14} /> : <EyeOff size={14} />}{section.isVisible !== false ? 'Visible' : 'Hidden'}
        </button>
      </div>
      <div className="space-y-4">
        <div><label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Heading</label><input type="text" value={content.heading || ''} onChange={(e) => onUpdate('heading', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]" /></div>
        <div><label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Background Image</label>
          {content.backgroundImage && <div className="w-full aspect-video bg-[#E3E8ED] rounded-xl overflow-hidden mb-2 max-w-md border border-[#6B8FAB]/30"><img src={content.backgroundImage} alt="" className="object-cover w-full h-full" /></div>}
          <button onClick={() => onOpenMedia('backgroundImage')} className="px-4 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#1B3A4C] hover:text-white transition">{content.backgroundImage ? 'Replace Image' : 'Choose Image'}</button>
        </div>
      </div>
      <div className="border-t border-[#6B8FAB]/20 pt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px]">Venues ({venues.length})</p>
          <button onClick={addVenue} className="px-4 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#1B3A4C] hover:text-white transition">+ Add Venue</button>
        </div>
        <div className="max-h-[400px] overflow-y-auto space-y-1">
          {venues.map((venue: string, i: number) => (
            <div key={i} className="flex items-center gap-2 group">
              <span className="text-[10px] text-[#6B8FAB] font-mono w-6">{i + 1}.</span>
              <input type="text" value={venue} onChange={(e) => updateVenue(i, e.target.value)} className="flex-1 px-2 py-1.5 bg-white border border-[#6B8FAB]/20 rounded text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]" />
              <button onClick={() => removeVenue(i)} className="p-1 text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end"><button onClick={onSave} disabled={saving} className="px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#1B3A4C] hover:text-white transition disabled:opacity-50">{saving ? 'Saving...' : 'Save Venues'}</button></div>
    </div>
  );
}

// ─── Brands Editor ───

function BrandsEditor({ section, onUpdate, onSave, saving, onToggleVisibility, onOpenMedia, setMediaTarget, setMediaOpen }: {
  section?: SectionData; onUpdate: (key: string, val: any) => void; onSave: () => void | Promise<void>; saving: boolean; onToggleVisibility: () => void; onOpenMedia: (field: string) => void; setMediaTarget: any; setMediaOpen: any;
}) {
  const content = parseContent(section?.content);
  const logos: { name: string; src: string }[] = content.logos || [];
  function updateLogo(index: number, field: 'name' | 'src', value: string) { const newLogos = [...logos]; newLogos[index] = { ...newLogos[index], [field]: value }; onUpdate('logos', newLogos); }
  function addLogo() { onUpdate('logos', [...logos, { name: 'New Brand', src: '' }]); }
  function removeLogo(index: number) { onUpdate('logos', logos.filter((_: any, i: number) => i !== index)); }
  function moveLogo(index: number, direction: 'up' | 'down') { const newIdx = direction === 'up' ? index - 1 : index + 1; if (newIdx < 0 || newIdx >= logos.length) return; const newLogos = [...logos]; [newLogos[index], newLogos[newIdx]] = [newLogos[newIdx], newLogos[index]]; onUpdate('logos', newLogos); }

  if (!section) return <div className="bg-white border border-[#6B8FAB]/30 p-8"><p className="text-[#6B8FAB] text-sm">Brands section not found.</p></div>;

  return (
    <div className="bg-white border border-[#6B8FAB]/30 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-1">Trusted by Global Brands</p><p className="text-sm text-[#a0a0a0] font-semibold uppercase tracking-[0.5px]">Manage brand logos</p></div>
        <button onClick={onToggleVisibility} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[1px] border-2 transition ${section.isVisible !== false ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-50' : 'border-[#6B8FAB]/30 text-[#6B8FAB] hover:bg-[#E3E8ED]'}`}>
          {section.isVisible !== false ? <Eye size={14} /> : <EyeOff size={14} />}{section.isVisible !== false ? 'Visible' : 'Hidden'}
        </button>
      </div>
      <div className="space-y-4">
        <div><label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Heading</label><input type="text" value={content.heading || ''} onChange={(e) => onUpdate('heading', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]" /></div>
        <div><label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Background Image</label>
          {content.backgroundImage && <div className="w-full aspect-video bg-[#E3E8ED] rounded-xl overflow-hidden mb-2 max-w-md border border-[#6B8FAB]/30"><img src={content.backgroundImage} alt="" className="object-cover w-full h-full" /></div>}
          <button onClick={() => onOpenMedia('backgroundImage')} className="px-4 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#1B3A4C] hover:text-white transition">{content.backgroundImage ? 'Replace Image' : 'Choose Image'}</button>
        </div>
      </div>
      <div className="border-t border-[#6B8FAB]/20 pt-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px]">Brand Logos ({logos.length})</p>
          <button onClick={addLogo} className="px-4 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#1B3A4C] hover:text-white transition">+ Add Logo</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {logos.map((logo: { name: string; src: string }, i: number) => (
            <div key={i} className="border border-[#6B8FAB]/30 p-4 space-y-3 bg-white">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px]">#{i + 1}</span>
                <div className="flex items-center gap-1 ml-auto">
                  <button onClick={() => moveLogo(i, 'up')} disabled={i === 0} className="p-1.5 text-[#6B8FAB] hover:text-[#1B3A4C] hover:bg-[#E3E8ED] rounded-lg transition-colors disabled:opacity-30"><ChevronUp size={16} /></button>
                  <button onClick={() => moveLogo(i, 'down')} disabled={i === logos.length - 1} className="p-1.5 text-[#6B8FAB] hover:text-[#1B3A4C] hover:bg-[#E3E8ED] rounded-lg transition-colors disabled:opacity-30"><ChevronDown size={16} /></button>
                  <button onClick={() => removeLogo(i)} className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="relative w-full aspect-[3/2] bg-[#E3E8ED] rounded-xl overflow-hidden border border-[#6B8FAB]/30">
                {logo.src ? <img src={logo.src} alt={logo.name} className="object-contain p-2 w-full h-full" /> : <div className="w-full h-full flex items-center justify-center"><Upload size={24} className="text-[#6B8FAB]" /></div>}
              </div>
              <div><label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px] mb-1">Name</label><input type="text" value={logo.name} onChange={(e) => updateLogo(i, 'name', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]" /></div>
              <div className="flex gap-2">
                <button onClick={() => { setMediaTarget({ type: 'brands-logo', id: i }); setMediaOpen(true); }} className="flex-1 px-3 py-1.5 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#1B3A4C] hover:text-white transition">{logo.src ? 'Replace' : 'Upload'}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end"><button onClick={onSave} disabled={saving} className="px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#1B3A4C] hover:text-white transition disabled:opacity-50">{saving ? 'Saving...' : 'Save Brands'}</button></div>
    </div>
  );
}
