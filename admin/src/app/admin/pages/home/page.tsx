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

const HOME_SECTIONS = ['hero', 'video', 'reach', 'shows', 'partners', 'radio', 'clients', 'share_music', 'contact'];

export default function HomeEditor() {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showCards, setShowCards] = useState<ShowCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [savingCard, setSavingCard] = useState<number | null>(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<number | null>(null);

  const fetchSections = useCallback(async () => {
    const res = await fetch('/api/sections?page=home');
    if (res.ok) {
      const data = await res.json();
      setSections(data.sections || []);
      if (data.sections?.length > 0 && !selectedSection) {
        setSelectedSection(data.sections[0].section);
      }
    }
    setLoading(false);
  }, [selectedSection]);

  const fetchShowCards = useCallback(async () => {
    const res = await fetch('/api/show-cards');
    if (res.ok) {
      const data = await res.json();
      setShowCards(data.cards || []);
    }
    setCardsLoading(false);
  }, []);

  useEffect(() => {
    fetchSections();
    fetchShowCards();
  }, [fetchSections, fetchShowCards]);

  const activeSection = sections.find((s) => s.section === selectedSection) || null;

  async function moveCard(id: number, direction: 'up' | 'down') {
    const idx = showCards.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= showCards.length) return;

    const newCards = [...showCards];
    const temp = newCards[idx];
    newCards[idx] = newCards[newIdx];
    newCards[newIdx] = temp;

    // Update orders
    const updated = newCards.map((c, i) => ({ ...c, order: i + 1 }));
    setShowCards(updated);

    // Save both
    await Promise.all([
      fetch(`/api/show-cards/${updated[idx].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: updated[idx].order }),
      }),
      fetch(`/api/show-cards/${updated[newIdx].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: updated[newIdx].order }),
      }),
    ]);
  }

  async function updateCard(id: number, field: string, value: any) {
    setShowCards((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  }

  async function saveCard(id: number) {
    const card = showCards.find((c) => c.id === id);
    if (!card) return;
    setSavingCard(id);
    await fetch(`/api/show-cards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imagePath: card.imagePath,
        venue: card.venue,
        location: card.location,
        season: card.season,
        title: card.title,
        description: card.description,
        href: card.href,
      }),
    });
    setSavingCard(null);
  }

  const sectionList = HOME_SECTIONS.map((name) => {
    const s = sections.find((sec) => sec.section === name);
    return {
      name,
      label: name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      exists: !!s,
      id: s?.id,
      isActive: s?.isActive ?? true,
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl lg:text-4xl font-semibold text-white tracking-tight">Home Page Editor</h1>
          <p className="text-[#8FA3B3] mt-1 text-sm font-medium tracking-wide uppercase">Edit sections and show cards</p>
        </div>
        <a
          href="/"
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
              {sectionList.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setSelectedSection(item.name)}
                  className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors flex items-center justify-between ${
                    selectedSection === item.name
                      ? 'bg-[#1B3A4C] text-white'
                      : 'text-white hover:bg-[#0A0A0A]'
                  }`}
                >
                  <span>{item.label}</span>
                  {!item.exists && (
                    <span className="text-[10px] uppercase tracking-wider opacity-60">New</span>
                  )}
                  {item.exists && !item.isActive && selectedSection !== item.name && (
                    <span className="text-[10px] uppercase tracking-wider opacity-60">Hidden</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Show Cards quick nav */}
          <div className="mt-4 bg-[#111318] rounded-2xl border border-[#8FA8BE]/20 overflow-hidden">
            <button
              onClick={() => setSelectedSection('showcards')}
              className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors flex items-center justify-between ${
                selectedSection === 'showcards'
                  ? 'bg-[#1B3A4C] text-white'
                  : 'text-white hover:bg-[#0A0A0A]'
              }`}
            >
              <span>Show Cards</span>
              <span className="text-xs text-[#8FA3B3]">{showCards.length}</span>
            </button>
          </div>
        </div>

        {/* Editor panel */}
        <div className="flex-1 min-w-0">
          {loading || cardsLoading ? (
            <p className="text-[#8FA3B3] text-sm">Loading...</p>
          ) : selectedSection === 'showcards' ? (
            <ShowCardsEditor
              cards={showCards}
              onMove={moveCard}
              onUpdate={updateCard}
              onSave={saveCard}
              savingCard={savingCard}
              onOpenMedia={(id) => {
                setMediaTarget(id);
                setMediaOpen(true);
              }}
            />
          ) : (
            <SectionEditor section={activeSection} onSaved={fetchSections} />
          )}
        </div>
      </div>

      <MediaPicker
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(path) => {
          if (mediaTarget !== null) {
            updateCard(mediaTarget, 'imagePath', path);
          }
        }}
        filterType="image"
      />
    </div>
  );
}

function ShowCardsEditor({
  cards,
  onMove,
  onUpdate,
  onSave,
  savingCard,
  onOpenMedia,
}: {
  cards: ShowCard[];
  onMove: (id: number, dir: 'up' | 'down') => void;
  onUpdate: (id: number, field: string, value: any) => void;
  onSave: (id: number) => void;
  savingCard: number | null;
  onOpenMedia: (id: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-[#111318] rounded-2xl p-6 border border-[#8FA8BE]/20">
        <h2 className="font-serif text-xl font-semibold text-white mb-1">Show Cards</h2>
        <p className="text-xs text-[#8FA3B3] mb-6">Reorder and edit each show card</p>

        <div className="space-y-4">
          {cards.map((card, idx) => (
            <div key={card.id} className="border border-[#2A2E36] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-semibold text-[#8FA3B3] uppercase tracking-widest">#{idx + 1}</span>
                <div className="flex items-center gap-1 ml-auto">
                  <button
                    onClick={() => onMove(card.id, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 text-[#8FA3B3] hover:text-white hover:bg-[#0A0A0A] rounded-lg transition-colors disabled:opacity-30"
                  >
                    <UpIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onMove(card.id, 'down')}
                    disabled={idx === cards.length - 1}
                    className="p-1.5 text-[#8FA3B3] hover:text-white hover:bg-[#0A0A0A] rounded-lg transition-colors disabled:opacity-30"
                  >
                    <DownIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8FA3B3] uppercase tracking-widest mb-1.5">Image</label>
                  <div className="relative w-full aspect-video bg-[#0A0A0A] rounded-xl overflow-hidden mb-2">
                    {card.imagePath ? (
                      <Image src={card.imagePath} alt={card.title} fill className="object-cover" sizes="400px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-[#8FA3B3]" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onOpenMedia(card.id)}
                    className="px-3 py-1.5 bg-[#1B3A4C] text-white rounded-lg text-xs font-semibold hover:bg-[#2a4f66] transition-colors"
                  >
                    Replace Image
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#8FA3B3] uppercase tracking-widest mb-1.5">Title</label>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => onUpdate(card.id, 'title', e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0A0A0A] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#8FA3B3] uppercase tracking-widest mb-1.5">Venue</label>
                      <input
                        type="text"
                        value={card.venue}
                        onChange={(e) => onUpdate(card.id, 'venue', e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#0A0A0A] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#8FA3B3] uppercase tracking-widest mb-1.5">Location</label>
                      <input
                        type="text"
                        value={card.location}
                        onChange={(e) => onUpdate(card.id, 'location', e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#0A0A0A] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8FA3B3] uppercase tracking-widest mb-1.5">Season</label>
                    <input
                      type="text"
                      value={card.season}
                      onChange={(e) => onUpdate(card.id, 'season', e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0A0A0A] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8FA3B3] uppercase tracking-widest mb-1.5">Description</label>
                    <textarea
                      value={card.description}
                      onChange={(e) => onUpdate(card.id, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-[#0A0A0A] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]/20 resize-y"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => onSave(card.id)}
                  disabled={savingCard === card.id}
                  className="px-5 py-2.5 bg-[#1B3A4C] text-white rounded-lg text-sm font-semibold uppercase tracking-widest hover:bg-[#2a4f66] transition-colors disabled:opacity-50"
                >
                  {savingCard === card.id ? 'Saving...' : 'Save Card'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
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
