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

interface ShowreelCard {
  id: string;
  imagePath: string;
  title: string;
  subtitle: string;
  description: string;
}

const SHOWREEL_SECTIONS = ['video', 'cards'];

export default function ShowreelEditor() {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>('video');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'video' | string | null>(null);
  const [mediaFilter, setMediaFilter] = useState<'image' | 'video'>('image');

  const fetchSections = useCallback(async () => {
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

  const activeSection = sections.find((s) => s.section === selectedSection) || null;

  const videoSection = sections.find((s) => s.section === 'video');
  const videoPath = videoSection?.videos?.[0] || videoSection?.content?.[0];

  const cardsSection = sections.find((s) => s.section === 'cards');
  let showreelCards: ShowreelCard[] = [];
  try {
    const parsed = typeof cardsSection?.content === 'string' ? JSON.parse(cardsSection.content || '[]') : (cardsSection?.content || []);
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
      showreelCards = parsed;
    }
  } catch {
    showreelCards = [];
  }

  async function saveVideo(path: string) {
    if (!videoSection) return;
    setSaving(true);
    await fetch(`/api/sections/${videoSection.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videos: [path] }),
    });
    await fetchSections();
    setSaving(false);
  }

  async function saveCards(newCards: ShowreelCard[]) {
    if (!cardsSection) return;
    setSaving(true);
    await fetch(`/api/sections/${cardsSection.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newCards }),
    });
    await fetchSections();
    setSaving(false);
  }

  function addCard() {
    const newCard: ShowreelCard = {
      id: `card-${Date.now()}`,
      imagePath: '',
      title: 'New Card',
      subtitle: '',
      description: '',
    };
    const updated = [...showreelCards, newCard];
    setSections((prev) =
      prev.map((s) =
        s.section === 'cards' ? { ...s, content: updated } : s
      )
    );
  }

  function updateCard(id: string, field: string, value: string) {
    const updated = showreelCards.map((c) => (c.id === id ? { ...c, [field]: value } : c));
    setSections((prev) =
      prev.map((s) =
        s.section === 'cards' ? { ...s, content: updated } : s
      )
    );
  }

  function removeCard(id: string) {
    const updated = showreelCards.filter((c) => c.id !== id);
    setSections((prev) =
      prev.map((s) =
        s.section === 'cards' ? { ...s, content: updated } : s
      )
    );
  }

  function moveCard(id: string, dir: 'up' | 'down') {
    const idx = showreelCards.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const newIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= showreelCards.length) return;
    const updated = [...showreelCards];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    setSections((prev) =
      prev.map((s) =
        s.section === 'cards' ? { ...s, content: updated } : s
      )
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl lg:text-4xl font-semibold text-[#1B3A4C] tracking-tight">Showreel Editor</h1>
        <p className="text-[#8FA8BE] mt-1 text-sm font-medium tracking-wide uppercase">Edit video and showreel cards</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Section list */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-[#8FA8BE]/20 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E3E8ED]">
              <h2 className="font-serif text-sm font-semibold text-[#1B3A4C] uppercase tracking-widest">Sections</h2>
            </div>
            <div className="divide-y divide-[#E3E8ED]">
              {SHOWREEL_SECTIONS.map((name) => {
                const s = sections.find((sec) => sec.section === name);
                const label = name === 'video' ? 'Main Video' : 'Showreel Cards';
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
          ) : selectedSection === 'video' ? (
            <div className="bg-white rounded-2xl p-6 border border-[#8FA8BE]/20">
              <h3 className="font-serif text-lg font-semibold text-[#1B3A4C] mb-4">Main Video</h3>
              <div className="relative w-full max-w-lg aspect-video bg-[#E3E8ED] rounded-xl overflow-hidden mb-4">
                {videoPath ? (
                  <video src={videoPath} className="w-full h-full object-cover" controls />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <VideoIcon className="w-12 h-12 text-[#8FA8BE]" />
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setMediaTarget('video');
                  setMediaFilter('video');
                  setMediaOpen(true);
                }}
                className="px-4 py-2.5 bg-[#1B3A4C] text-white rounded-lg text-sm font-semibold hover:bg-[#2a4f66] transition-colors"
              >
                {videoPath ? 'Replace Video' : 'Upload Video'}
              </button>
            </div>
          ) : selectedSection === 'cards' ? (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-[#8FA8BE]/20">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-[#1B3A4C]">Showreel Cards</h3>
                    <p className="text-xs text-[#8FA8BE]">Manage cards shown on the showreel page</p>
                  </div>
                  <button
                    onClick={addCard}
                    className="px-4 py-2.5 bg-[#1B3A4C] text-white rounded-lg text-sm font-semibold hover:bg-[#2a4f66] transition-colors"
                  >
                    + Add Card
                  </button>
                </div>

                <div className="space-y-4">
                  {showreelCards.map((card, idx) => (
                    <div key={card.id} className="border border-[#E3E8ED] rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs font-semibold text-[#8FA8BE] uppercase tracking-widest">#{idx + 1}</span>
                        <div className="flex items-center gap-1 ml-auto">
                          <button
                            onClick={() => moveCard(card.id, 'up')}
                            disabled={idx === 0}
                            className="p-1.5 text-[#8FA8BE] hover:text-[#1B3A4C] hover:bg-[#E3E8ED] rounded-lg transition-colors disabled:opacity-30"
                          >
                            <UpIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveCard(card.id, 'down')}
                            disabled={idx === showreelCards.length - 1}
                            className="p-1.5 text-[#8FA8BE] hover:text-[#1B3A4C] hover:bg-[#E3E8ED] rounded-lg transition-colors disabled:opacity-30"
                          >
                            <DownIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeCard(card.id)}
                            className="p-1.5 text-[#8FA8BE] hover:text-[#1B3A4C] hover:bg-[#E3E8ED] rounded-lg transition-colors"
                          >
                            <CloseIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#8FA8BE] uppercase tracking-widest mb-1.5">Image</label>
                          <div className="relative w-full aspect-video bg-[#E3E8ED] rounded-xl overflow-hidden mb-2">
                            {card.imagePath ? (
                              <Image src={card.imagePath} alt={card.title} fill className="object-cover" sizes="400px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-[#8FA8BE]" />
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setMediaTarget(card.id);
                              setMediaFilter('image');
                              setMediaOpen(true);
                            }}
                            className="px-3 py-1.5 bg-[#1B3A4C] text-white rounded-lg text-xs font-semibold hover:bg-[#2a4f66] transition-colors"
                          >
                            Replace Image
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-[#8FA8BE] uppercase tracking-widest mb-1.5">Title</label>
                            <input
                              type="text"
                              value={card.title}
                              onChange={(e) => updateCard(card.id, 'title', e.target.value)}
                              className="w-full px-4 py-2.5 bg-[#E3E8ED] rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]/20"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#8FA8BE] uppercase tracking-widest mb-1.5">Subtitle</label>
                            <input
                              type="text"
                              value={card.subtitle}
                              onChange={(e) => updateCard(card.id, 'subtitle', e.target.value)}
                              className="w-full px-4 py-2.5 bg-[#E3E8ED] rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]/20"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#8FA8BE] uppercase tracking-widest mb-1.5">Description</label>
                            <textarea
                              value={card.description}
                              onChange={(e) => updateCard(card.id, 'description', e.target.value)}
                              rows={3}
                              className="w-full px-4 py-2.5 bg-[#E3E8ED] rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]/20 resize-y"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {showreelCards.length > 0 && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => saveCards(showreelCards)}
                      disabled={saving}
                      className="px-6 py-3 bg-[#1B3A4C] text-white rounded-xl font-semibold text-sm uppercase tracking-widest hover:bg-[#2a4f66] transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Cards'}
                    </button>
                  </div>
                )}
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
          if (mediaTarget === 'video') {
            saveVideo(path);
          } else if (mediaTarget) {
            updateCard(mediaTarget, 'imagePath', path);
          }
        }}
        filterType={mediaFilter}
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

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
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

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
