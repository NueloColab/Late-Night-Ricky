'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

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

interface PartnerLogo {
  id: number;
  order: number;
  imagePath: string | null;
  name: string;
  href: string | null;
  isActive: boolean;
}

interface ClientName {
  id: number;
  order: number;
  name: string;
  isActive: boolean;
}

interface Track {
  id: number;
  order: number;
  title: string;
  duration: string;
  filePath: string;
  isActive: boolean;
}

const SECTIONS = [
  { key: 'hero', label: 'Hero' },
  { key: 'video', label: 'Video' },
  { key: 'reach', label: 'Reach' },
  { key: 'shows', label: 'Shows' },
  { key: 'partners', label: 'Partners' },
  { key: 'radio', label: 'Radio' },
  { key: 'clients', label: 'Clients' },
  { key: 'share', label: 'Share Music' },
  { key: 'contact', label: 'Contact' },
];

export default function HomeEditor() {
  const [activeTab, setActiveTab] = useState('hero');
  const [sections, setSections] = useState<SectionData[]>([]);
  const [showCards, setShowCards] = useState<ShowCard[]>([]);
  const [logos, setLogos] = useState<PartnerLogo[]>([]);
  const [clients, setClients] = useState<ClientName[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [secRes, cardsRes, logosRes, clientsRes, tracksRes] = await Promise.all([
        fetch('/api/sections?page=home'),
        fetch('/api/show-cards'),
        fetch('/api/partner-logos'),
        fetch('/api/client-names'),
        fetch('/api/tracks'),
      ]);
      const secData = await secRes.json();
      const cardsData = await cardsRes.json();
      const logosData = await logosRes.json();
      const clientsData = await clientsRes.json();
      const tracksData = await tracksRes.json();

      setSections(secData.sections || []);
      setShowCards(cardsData.cards || []);
      setLogos(logosData.logos || []);
      setClients(clientsData.names || []);
      setTracks(tracksData.tracks || []);
    } catch (err) {
      console.error('Fetch error:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  function getSection(key: string): SectionData | null {
    return sections.find((s) => s.section === key) || null;
  }

  function getContent(key: string, field: string, fallback = '') {
    const s = getSection(key);
    if (!s?.content) return fallback;
    if (typeof s.content === 'string') {
      try {
        const parsed = JSON.parse(s.content);
        return parsed[field] || fallback;
      } catch {
        return fallback;
      }
    }
    return s.content[field] || fallback;
  }

  async function saveSection(key: string, updates: any) {
    const s = getSection(key);
    if (!s) return;
    setSaving(true);
    try {
      const currentContent = typeof s.content === 'string' ? JSON.parse(s.content) : (s.content || {});
      const newContent = { ...currentContent, ...updates };
      await fetch(`/api/sections?id=${s.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });
      setSections((prev) => prev.map((sec) => sec.id === s.id ? { ...sec, content: newContent } : sec));
      setMessage('Saved');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('Save failed');
    }
    setSaving(false);
  }

  async function updateShowCard(id: number, field: string, value: any) {
    setShowCards((prev) => prev.map((c) => c.id === id ? { ...c, [field]: value } : c));
  }

  async function saveShowCard(id: number) {
    const card = showCards.find((c) => c.id === id);
    if (!card) return;
    setSaving(true);
    await fetch(`/api/show-cards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
    });
    setSaving(false);
    setMessage('Card saved');
    setTimeout(() => setMessage(''), 2000);
  }

  async function updateLogo(id: number, field: string, value: any) {
    setLogos((prev) => prev.map((l) => l.id === id ? { ...l, [field]: value } : l));
  }

  async function saveLogo(id: number) {
    const logo = logos.find((l) => l.id === id);
    if (!logo) return;
    setSaving(true);
    await fetch(`/api/partner-logos?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logo),
    });
    setSaving(false);
    setMessage('Logo saved');
    setTimeout(() => setMessage(''), 2000);
  }

  async function deleteLogo(id: number) {
    if (!confirm('Delete this logo?')) return;
    await fetch(`/api/partner-logos?id=${id}`, { method: 'DELETE' });
    setLogos((prev) => prev.filter((l) => l.id !== id));
  }

  async function addLogo() {
    const res = await fetch('/api/partner-logos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Logo', imagePath: '/assets/logo-placeholder.png', order: logos.length }),
    });
    const data = await res.json();
    if (data.logo) setLogos((prev) => [...prev, data.logo]);
  }

  async function updateClient(id: number, value: string) {
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, name: value } : c));
  }

  async function saveClient(id: number) {
    const client = clients.find((c) => c.id === id);
    if (!client) return;
    setSaving(true);
    await fetch(`/api/client-names?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });
    setSaving(false);
    setMessage('Client saved');
    setTimeout(() => setMessage(''), 2000);
  }

  async function deleteClient(id: number) {
    if (!confirm('Delete this client?')) return;
    await fetch(`/api/client-names?id=${id}`, { method: 'DELETE' });
    setClients((prev) => prev.filter((c) => c.id !== id));
  }

  async function addClient() {
    const res = await fetch('/api/client-names', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Client', order: clients.length }),
    });
    const data = await res.json();
    if (data.name) setClients((prev) => [...prev, data.name]);
  }

  async function updateTrack(id: number, field: string, value: any) {
    setTracks((prev) => prev.map((t) => t.id === id ? { ...t, [field]: value } : t));
  }

  async function saveTrack(id: number) {
    const track = tracks.find((t) => t.id === id);
    if (!track) return;
    setSaving(true);
    await fetch(`/api/tracks?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(track),
    });
    setSaving(false);
    setMessage('Track saved');
    setTimeout(() => setMessage(''), 2000);
  }

  async function deleteTrack(id: number) {
    if (!confirm('Delete this track?')) return;
    await fetch(`/api/tracks?id=${id}`, { method: 'DELETE' });
    setTracks((prev) => prev.filter((t) => t.id !== id));
  }

  async function addTrack() {
    const res = await fetch('/api/tracks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Track', duration: '0:30', filePath: '/assets/snippet-1.mp3', order: tracks.length }),
    });
    const data = await res.json();
    if (data.track) setTracks((prev) => [...prev, data.track]);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Home Page Editor</h1>
            <p className="text-gray-400 text-sm">Edit sections and content</p>
          </div>
          <div className="flex items-center gap-3">
            {message && (
              <span className={`text-sm ${message.includes('failed') ? 'text-red-400' : 'text-green-400'}`}>
                {message}
              </span>
            )}
            {saving && <span className="text-sm text-gray-400">Saving...</span>}
            <a href="/" target="_blank" className="px-4 py-2 bg-[#1B3A4C] rounded text-sm hover:bg-[#2a4f66]">
              View Site →
            </a>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-56 flex-shrink-0">
            <div className="bg-[#111318] rounded-xl border border-[#2A2E36] overflow-hidden">
              {SECTIONS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setActiveTab(s.key)}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                    activeTab === s.key ? 'bg-[#1B3A4C] text-white' : 'text-gray-300 hover:bg-[#1a1a1a]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'hero' && (
              <SectionPanel title="Hero Section">
                <Field label="Title" value={getContent('hero', 'title')} onChange={(v) => saveSection('hero', { title: v })} />
                <Field label="Subtitle" value={getContent('hero', 'subtitle')} onChange={(v) => saveSection('hero', { subtitle: v })} />
                <Field label="Hero Image Path" value={getContent('hero', 'image')} onChange={(v) => saveSection('hero', { image: v })} />
                <Field label="Logo Path" value={getContent('hero', 'logo')} onChange={(v) => saveSection('hero', { logo: v })} />
              </SectionPanel>
            )}

            {activeTab === 'video' && (
              <SectionPanel title="Video Section">
                <Field label="Video Poster" value={getContent('video', 'poster')} onChange={(v) => saveSection('video', { poster: v })} />
                <Field label="Video Source (MP4)" value={getContent('video', 'src')} onChange={(v) => saveSection('video', { src: v })} />
              </SectionPanel>
            )}

            {activeTab === 'reach' && (
              <SectionPanel title="Reach Section">
                <TextArea label="Headline" value={getContent('reach', 'headline')} onChange={(v) => saveSection('reach', { headline: v })} />
                <TextArea label="Subtext" value={getContent('reach', 'subtext')} onChange={(v) => saveSection('reach', { subtext: v })} />
              </SectionPanel>
            )}

            {activeTab === 'shows' && (
              <SectionPanel title="Show Cards">
                <div className="space-y-4">
                  {showCards.map((card, idx) => (
                    <div key={card.id} className="bg-[#111318] rounded-lg p-4 border border-[#2A2E36]">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gray-400">#{idx + 1}</span>
                        <span className="text-sm font-semibold">{card.title}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => updateShowCard(card.id, 'title', e.target.value)}
                          className="bg-[#0a0a0a] border border-[#2A2E36] rounded px-3 py-2 text-sm"
                          placeholder="Title"
                        />
                        <input
                          type="text"
                          value={card.venue}
                          onChange={(e) => updateShowCard(card.id, 'venue', e.target.value)}
                          className="bg-[#0a0a0a] border border-[#2A2E36] rounded px-3 py-2 text-sm"
                          placeholder="Venue"
                        />
                        <input
                          type="text"
                          value={card.location}
                          onChange={(e) => updateShowCard(card.id, 'location', e.target.value)}
                          className="bg-[#0a0a0a] border border-[#2A2E36] rounded px-3 py-2 text-sm"
                          placeholder="Location"
                        />
                        <input
                          type="text"
                          value={card.season}
                          onChange={(e) => updateShowCard(card.id, 'season', e.target.value)}
                          className="bg-[#0a0a0a] border border-[#2A2E36] rounded px-3 py-2 text-sm"
                          placeholder="Season"
                        />
                        <input
                          type="text"
                          value={card.href}
                          onChange={(e) => updateShowCard(card.id, 'href', e.target.value)}
                          className="bg-[#0a0a0a] border border-[#2A2E36] rounded px-3 py-2 text-sm col-span-2"
                          placeholder="Link"
                        />
                        <textarea
                          value={card.description}
                          onChange={(e) => updateShowCard(card.id, 'description', e.target.value)}
                          className="bg-[#0a0a0a] border border-[#2A2E36] rounded px-3 py-2 text-sm col-span-2"
                          placeholder="Description"
                          rows={2}
                        />
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button onClick={() => saveShowCard(card.id)} className="px-4 py-2 bg-[#1B3A4C] rounded text-sm hover:bg-[#2a4f66]">
                          Save Card
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionPanel>
            )}

            {activeTab === 'partners' && (
              <SectionPanel title="Partner Logos">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {logos.map((logo, idx) => (
                    <div key={logo.id} className="bg-[#111318] rounded-lg p-4 border border-[#2A2E36]">
                      <div className="text-xs text-gray-400 mb-2">#{idx + 1}</div>
                      {logo.imagePath && (
                        <img src={logo.imagePath} alt={logo.name} className="w-full h-16 object-contain mb-3" />
                      )}
                      <input
                        type="text"
                        value={logo.name}
                        onChange={(e) => updateLogo(logo.id, 'name', e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-[#2A2E36] rounded px-3 py-2 text-sm mb-2"
                        placeholder="Name"
                      />
                      <input
                        type="text"
                        value={logo.imagePath || ''}
                        onChange={(e) => updateLogo(logo.id, 'imagePath', e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-[#2A2E36] rounded px-3 py-2 text-sm mb-2"
                        placeholder="Image path"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => saveLogo(logo.id)} className="flex-1 py-2 bg-[#1B3A4C] rounded text-sm hover:bg-[#2a4f66]">
                          Save
                        </button>
                        <button onClick={() => deleteLogo(logo.id)} className="px-3 py-2 bg-red-900/50 text-red-400 rounded text-sm hover:bg-red-900">
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={addLogo} className="mt-4 px-4 py-2 bg-[#1B3A4C] rounded text-sm hover:bg-[#2a4f66]">
                  + Add Logo
                </button>
              </SectionPanel>
            )}

            {activeTab === 'radio' && (
              <SectionPanel title="Radio Tracks">
                <div className="space-y-3">
                  {tracks.map((track, idx) => (
                    <div key={track.id} className="bg-[#111318] rounded-lg p-4 border border-[#2A2E36] flex items-center gap-4">
                      <span className="text-xs text-gray-400 w-8">#{idx + 1}</span>
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={track.title}
                          onChange={(e) => updateTrack(track.id, 'title', e.target.value)}
                          className="bg-[#0a0a0a] border border-[#2A2E36] rounded px-3 py-2 text-sm"
                          placeholder="Title"
                        />
                        <input
                          type="text"
                          value={track.duration}
                          onChange={(e) => updateTrack(track.id, 'duration', e.target.value)}
                          className="bg-[#0a0a0a] border border-[#2A2E36] rounded px-3 py-2 text-sm"
                          placeholder="Duration"
                        />
                        <input
                          type="text"
                          value={track.filePath}
                          onChange={(e) => updateTrack(track.id, 'filePath', e.target.value)}
                          className="bg-[#0a0a0a] border border-[#2A2E36] rounded px-3 py-2 text-sm"
                          placeholder="File path"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => saveTrack(track.id)} className="px-3 py-2 bg-[#1B3A4C] rounded text-sm hover:bg-[#2a4f66]">
                          Save
                        </button>
                        <button onClick={() => deleteTrack(track.id)} className="px-3 py-2 bg-red-900/50 text-red-400 rounded text-sm hover:bg-red-900">
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={addTrack} className="mt-4 px-4 py-2 bg-[#1B3A4C] rounded text-sm hover:bg-[#2a4f66]">
                  + Add Track
                </button>
              </SectionPanel>
            )}

            {activeTab === 'clients' && (
              <SectionPanel title="Client Names">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {clients.map((client, idx) => (
                    <div key={client.id} className="bg-[#111318] rounded-lg p-3 border border-[#2A2E36] flex items-center gap-2">
                      <span className="text-xs text-gray-400">#{idx + 1}</span>
                      <input
                        type="text"
                        value={client.name}
                        onChange={(e) => updateClient(client.id, e.target.value)}
                        className="flex-1 bg-[#0a0a0a] border border-[#2A2E36] rounded px-3 py-2 text-sm"
                      />
                      <button onClick={() => saveClient(client.id)} className="px-3 py-2 bg-[#1B3A4C] rounded text-sm hover:bg-[#2a4f66]">
                        Save
                      </button>
                      <button onClick={() => deleteClient(client.id)} className="px-2 py-2 bg-red-900/50 text-red-400 rounded text-sm hover:bg-red-900">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={addClient} className="mt-4 px-4 py-2 bg-[#1B3A4C] rounded text-sm hover:bg-[#2a4f66]">
                  + Add Client
                </button>
              </SectionPanel>
            )}

            {activeTab === 'share' && (
              <SectionPanel title="Share Music Section">
                <Field label="Headline" value={getContent('share', 'headline')} onChange={(v) => saveSection('share', { headline: v })} />
                <TextArea label="Description" value={getContent('share', 'description')} onChange={(v) => saveSection('share', { description: v })} />
              </SectionPanel>
            )}

            {activeTab === 'contact' && (
              <SectionPanel title="Contact Section">
                <Field label="Booking Email" value={getContent('contact', 'bookingEmail')} onChange={(v) => saveSection('contact', { bookingEmail: v })} />
                <Field label="Instagram" value={getContent('contact', 'instagram')} onChange={(v) => saveSection('contact', { instagram: v })} />
              </SectionPanel>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111318] rounded-xl border border-[#2A2E36] p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0a0a0a] border border-[#2A2E36] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1B3A4C]"
      />
    </div>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full bg-[#0a0a0a] border border-[#2A2E36] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1B3A4C] resize-y"
      />
    </div>
  );
}
