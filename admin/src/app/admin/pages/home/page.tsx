'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

interface Track {
  id: number;
  order: number;
  title: string;
  filePath: string | null;
  duration: string | null;
  spotifyUrl: string | null;
  appleMusicUrl: string | null;
  isActive: boolean;
}

interface ClientName {
  id: number;
  order: number;
  name: string;
  isActive: boolean;
}

const HOME_SECTIONS = ['hero', 'video', 'reach', 'shows', 'partners', 'radio', 'clients', 'carousel', 'share_music', 'reach_out', 'contact'];

function parseContent(content: any): Record<string, any> {
  if (!content) return {};
  if (typeof content === 'string') {
    try {
      return JSON.parse(content);
    } catch {
      return {};
    }
  }
  return content;
}

export default function HomeEditor() {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showCards, setShowCards] = useState<ShowCard[]>([]);
  const [partnerLogos, setPartnerLogos] = useState<PartnerLogo[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [clientNames, setClientNames] = useState<ClientName[]>([]);
  const [carouselImages, setCarouselImages] = useState<{ id: number; imagePath: string | null; alt: string; order: number; isActive: boolean }[]>([]);
  const [carouselLoading, setCarouselLoading] = useState(false);
  const [savingCarousel, setSavingCarousel] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [logosLoading, setLogosLoading] = useState(false);
  const [tracksLoading, setTracksLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [savingCard, setSavingCard] = useState<number | null>(null);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [savingLogo, setSavingLogo] = useState<number | null>(null);
  const [savingTrack, setSavingTrack] = useState<number | null>(null);
  const [savingClient, setSavingClient] = useState<number | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<{ type: string; id?: number; field?: string } | null>(null);
  const [playingTrack, setPlayingTrack] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function flashSaved(msg: string) {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(null), 2000);
  }

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

  const fetchPartnerLogos = useCallback(async () => {
    setLogosLoading(true);
    const res = await fetch('/api/partner-logos');
    if (res.ok) {
      const data = await res.json();
      setPartnerLogos(data.logos || []);
    }
    setLogosLoading(false);
  }, []);

  const fetchTracks = useCallback(async () => {
    setTracksLoading(true);
    const res = await fetch('/api/public/tracks');
    if (res.ok) {
      const data = await res.json();
      setTracks(data.tracks || []);
    }
    setTracksLoading(false);
  }, []);

  const fetchClientNames = useCallback(async () => {
    setClientsLoading(true);
    const res = await fetch('/api/public/client-names');
    if (res.ok) {
      const data = await res.json();
      setClientNames(data.names || []);
    }
    setClientsLoading(false);
  }, []);

  const fetchCarousel = useCallback(async () => {
    setCarouselLoading(true);
    const res = await fetch('/api/carousel');
    if (res.ok) {
      const data = await res.json();
      setCarouselImages(data.images || []);
    }
    setCarouselLoading(false);
  }, []);

  useEffect(() => {
    fetchSections();
    fetchShowCards();
    fetchPartnerLogos();
    fetchTracks();
    fetchClientNames();
    fetchCarousel();
  }, [fetchSections, fetchShowCards, fetchPartnerLogos, fetchTracks, fetchClientNames, fetchCarousel]);

  function getSection(name: string): SectionData | undefined {
    return sections.find((s) => s.section === name);
  }

  function updateSectionField(name: string, field: 'content' | 'images' | 'videos' | 'links', value: any) {
    setSections((prev) =>
      prev.map((s) => (s.section === name ? { ...s, [field]: value } : s))
    );
  }

  function updateSectionContent(name: string, key: string, value: any) {
    const section = getSection(name);
    if (!section) return;
    const content = parseContent(section.content);
    const updated = { ...content, [key]: value };
    updateSectionField(name, 'content', updated);
  }

  async function saveSection(name: string) {
    const section = getSection(name);
    if (!section) return;
    setSavingSection(name);
    const payload: any = {};
    if (section.content !== undefined) payload.content = section.content;
    if (section.images !== undefined) payload.images = section.images;
    if (section.videos !== undefined) payload.videos = section.videos;
    if (section.links !== undefined) payload.links = section.links;
    await fetch(`/api/sections/${section.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSavingSection(null);
    flashSaved(`${name.charAt(0).toUpperCase() + name.slice(1)} saved`);
    fetchSections();
  }

  async function moveCard(id: number, direction: 'up' | 'down') {
    const idx = showCards.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= showCards.length) return;

    const newCards = [...showCards];
    const temp = newCards[idx];
    newCards[idx] = newCards[newIdx];
    newCards[newIdx] = temp;

    const updated = newCards.map((c, i) => ({ ...c, order: i + 1 }));
    setShowCards(updated);

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

  async function movePartnerLogo(id: number, direction: 'up' | 'down') {
    const idx = partnerLogos.findIndex((l) => l.id === id);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= partnerLogos.length) return;

    const newLogos = [...partnerLogos];
    const temp = newLogos[idx];
    newLogos[idx] = newLogos[newIdx];
    newLogos[newIdx] = temp;

    const updated = newLogos.map((l, i) => ({ ...l, order: i + 1 }));
    setPartnerLogos(updated);

    await Promise.all([
      fetch(`/api/partner-logos/${updated[idx].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: updated[idx].order }),
      }),
      fetch(`/api/partner-logos/${updated[newIdx].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: updated[newIdx].order }),
      }),
    ]);
  }

  function updatePartnerLogo(id: number, field: string, value: any) {
    setPartnerLogos((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  }

  async function savePartnerLogo(id: number) {
    const logo = partnerLogos.find((l) => l.id === id);
    if (!logo) return;
    setSavingLogo(id);
    await fetch(`/api/partner-logos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: logo.name,
        imagePath: logo.imagePath,
        href: logo.href,
        order: logo.order,
      }),
    });
    setSavingLogo(null);
  }

  async function deletePartnerLogo(id: number) {
    if (!confirm('Delete this logo?')) return;
    await fetch(`/api/partner-logos/${id}`, { method: 'DELETE' });
    fetchPartnerLogos();
  }

  async function addPartnerLogo() {
    const order = partnerLogos.length + 1;
    await fetch('/api/partner-logos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Partner', imagePath: null, order }),
    });
    fetchPartnerLogos();
  }

  async function moveTrack(id: number, direction: 'up' | 'down') {
    const idx = tracks.findIndex((t) => t.id === id);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= tracks.length) return;

    const newTracks = [...tracks];
    const temp = newTracks[idx];
    newTracks[idx] = newTracks[newIdx];
    newTracks[newIdx] = temp;

    const updated = newTracks.map((t, i) => ({ ...t, order: i + 1 }));
    setTracks(updated);

    await Promise.all([
      fetch(`/api/tracks/${updated[idx].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: updated[idx].order }),
      }),
      fetch(`/api/tracks/${updated[newIdx].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: updated[newIdx].order }),
      }),
    ]);
  }

  function updateTrack(id: number, field: string, value: any) {
    setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  }

  async function saveTrack(id: number) {
    const track = tracks.find((t) => t.id === id);
    if (!track) return;
    setSavingTrack(id);
    await fetch(`/api/tracks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: track.title,
        filePath: track.filePath,
        duration: track.duration,
        order: track.order,
      }),
    });
    setSavingTrack(null);
  }

  async function uploadTrackFile(id: number, file: File) {
    const track = tracks.find((t) => t.id === id);
    if (!track) return;
    setSavingTrack(id);

    try {
      console.log('[Track Upload] Starting upload for:', file.name, 'size:', file.size);

      // Step 1: Get Cloudinary upload signature
      const sigRes = await fetch('/api/upload-signature?' + new URLSearchParams({
        filename: file.name,
      }));
      const sigData = await sigRes.json();
      console.log('[Track Upload] Signature response:', sigRes.status, sigData);

      if (!sigRes.ok || sigData.error) {
        alert(sigData.error || `Failed to get upload signature (${sigRes.status})`);
        setSavingTrack(null);
        return;
      }

      // Step 2: Upload directly to Cloudinary (bypasses Vercel size limits)
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`;
      const cFormData = new FormData();
      cFormData.append('file', file);
      cFormData.append('api_key', sigData.apiKey);
      cFormData.append('timestamp', sigData.timestamp);
      cFormData.append('signature', sigData.signature);
      cFormData.append('public_id', sigData.publicId);
      cFormData.append('folder', sigData.folder);
      cFormData.append('overwrite', 'true');

      console.log('[Track Upload] Uploading to Cloudinary...');
      const uploadRes = await fetch(cloudinaryUrl, { method: 'POST', body: cFormData });
      const uploadData = await uploadRes.json();
      console.log('[Track Upload] Cloudinary response:', uploadRes.status, uploadData);

      if (!uploadRes.ok || uploadData.error) {
        const errMsg = uploadData.error?.message || JSON.stringify(uploadData.error) || 'Cloudinary upload failed';
        alert(errMsg);
        setSavingTrack(null);
        return;
      }

      // Step 3: Save the Cloudinary URL to our DB
      console.log('[Track Upload] Saving to DB...');
      const saveRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: uploadData.secure_url,
          filename: sigData.publicId,
          originalName: file.name,
          type: 'audio',
          size: file.size,
        }),
      });
      const saveData = await saveRes.json();
      console.log('[Track Upload] DB save response:', saveRes.status, saveData);

      if (!saveRes.ok || saveData.error) {
        alert(saveData.error || 'Failed to save asset');
        setSavingTrack(null);
        return;
      }

      // Step 4: Update the track with the new file path
      await fetch(`/api/tracks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: track.title,
          filePath: saveData.asset.path,
          duration: track.duration,
          order: track.order,
        }),
      });
      fetchTracks();
    } catch (err: any) {
      console.error('[Track Upload] Exception:', err);
      alert(err.message || 'Upload failed');
    }
    setSavingTrack(null);
  }

  async function deleteTrack(id: number) {
    if (!confirm('Delete this track?')) return;
    await fetch(`/api/tracks/${id}`, { method: 'DELETE' });
    fetchTracks();
  }

  async function addTrack() {
    const order = tracks.length + 1;
    await fetch('/api/tracks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Track', duration: '0:30', filePath: null, order }),
    });
    fetchTracks();
  }

  async function moveClient(id: number, direction: 'up' | 'down') {
    const idx = clientNames.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= clientNames.length) return;

    const newClients = [...clientNames];
    const temp = newClients[idx];
    newClients[idx] = newClients[newIdx];
    newClients[newIdx] = temp;

    const updated = newClients.map((c, i) => ({ ...c, order: i + 1 }));
    setClientNames(updated);

    await Promise.all([
      fetch(`/api/client-names/${updated[idx].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: updated[idx].order }),
      }),
      fetch(`/api/client-names/${updated[newIdx].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: updated[newIdx].order }),
      }),
    ]);
  }

  function updateClient(id: number, field: string, value: any) {
    setClientNames((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  }

  async function saveClient(id: number) {
    const client = clientNames.find((c) => c.id === id);
    if (!client) return;
    setSavingClient(id);
    await fetch(`/api/client-names/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: client.name,
        order: client.order,
      }),
    });
    setSavingClient(null);
  }

  async function deleteClient(id: number) {
    if (!confirm('Delete this client?')) return;
    await fetch(`/api/client-names/${id}`, { method: 'DELETE' });
    fetchClientNames();
  }

  async function addClient() {
    const order = clientNames.length + 1;
    await fetch('/api/client-names', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Client', order }),
    });
    fetchClientNames();
  }

  function updateCarousel(id: number, field: string, value: any) {
    setCarouselImages((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  }

  async function saveCarousel(id: number) {
    const img = carouselImages.find((c) => c.id === id);
    if (!img) return;
    setSavingCarousel(id);
    await fetch(`/api/carousel/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imagePath: img.imagePath,
        alt: img.alt,
        order: img.order,
        isActive: img.isActive,
      }),
    });
    setSavingCarousel(null);
  }

  async function deleteCarousel(id: number) {
    if (!confirm('Delete this image?')) return;
    await fetch(`/api/carousel/${id}`, { method: 'DELETE' });
    fetchCarousel();
  }

  async function addCarousel() {
    const order = carouselImages.length + 1;
    await fetch('/api/carousel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imagePath: null, alt: '', order }),
    });
    fetchCarousel();
  }

  async function moveCarousel(id: number, direction: 'up' | 'down') {
    const idx = carouselImages.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= carouselImages.length) return;

    const updated = [...carouselImages];
    const temp = updated[idx];
    updated[idx] = updated[newIdx];
    updated[newIdx] = temp;

    updated[idx].order = idx;
    updated[newIdx].order = newIdx;

    setCarouselImages(updated);
    await Promise.all([
      fetch(`/api/carousel/${updated[idx].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: updated[idx].order }),
      }),
      fetch(`/api/carousel/${updated[newIdx].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: updated[newIdx].order }),
      }),
    ]);
  }

  function openMediaPicker(type: string, id?: number, field?: string) {
    setMediaTarget({ type, id, field });
    setMediaOpen(true);
  }

  function handleMediaSelect(path: string) {
    if (!mediaTarget) return;

    if (mediaTarget.type === 'showcard' && mediaTarget.id !== undefined) {
      updateCard(mediaTarget.id, 'imagePath', path);
    } else if (mediaTarget.type === 'hero-image') {
      updateSectionContent('hero', 'image', path);
    } else if (mediaTarget.type === 'hero-logo') {
      updateSectionContent('hero', 'logo', path);
    } else if (mediaTarget.type === 'video-poster') {
      updateSectionContent('video', 'poster', path);
    } else if (mediaTarget.type === 'partner-logo' && mediaTarget.id !== undefined) {
      updatePartnerLogo(mediaTarget.id, 'imagePath', path);
    } else if (mediaTarget.type === 'carousel' && mediaTarget.id !== undefined) {
      updateCarousel(mediaTarget.id, 'imagePath', path);
    } else if (mediaTarget.type === 'reach-out-image') {
      updateSectionContent('reach_out', 'image', path);
    } else if (mediaTarget.type === 'reach-grammy') {
      updateSectionContent('reach', 'grammyBadge', path);
    } else if (mediaTarget.type === 'radio-image') {
      updateSectionContent('radio', 'image', path);
    }
  }

  function togglePlay(trackId: number, filePath: string | null) {
    if (!filePath) return;
    if (playingTrack === trackId) {
      audioRef.current?.pause();
      setPlayingTrack(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(filePath);
      audioRef.current = audio;
      audio.play().catch(() => {});
      setPlayingTrack(trackId);
      audio.onended = () => setPlayingTrack(null);
    }
  }

  const sectionList = HOME_SECTIONS.map((name) => {
    const s = sections.find((sec) => sec.section === name);
    const customLabels: Record<string, string> = {
      share_music: 'Share Music',
      contact: 'Reach Out',
    };
    return {
      name,
      label: customLabels[name] || name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      exists: !!s,
      id: s?.id,
      isActive: s?.isActive ?? true,
    };
  });

  return (
    <div className="max-w-7xl mx-auto relative">
      {/* Saved toast */}
      {savedMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg animate-fade-in">
          {savedMsg}
        </div>
      )}
      {/* Header */}
      <Link
        href="/admin/content"
        className="inline-flex items-center gap-2 text-sm text-[#1B3A4C] hover:text-[#111] transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        <span>Back to Content</span>
      </Link>
      <div className="flex items-center justify-between mb-12">
        <div>
          <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">Page Editor</p>
          <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#111] tracking-[-2px] uppercase leading-[0.95]">
            Home Page
          </h1>
          <p className="text-sm text-[#5B7A8E] mt-4 font-semibold uppercase tracking-[0.5px]">Edit sections and show cards</p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition"
        >
          View on Site →
        </a>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Section list */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white border border-[#A3B5C4]/30 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#A3B5C4]/30">
              <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold">Sections</p>
            </div>
            <div className="divide-y divide-[#A3B5C4]/20">
              {sectionList.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setSelectedSection(item.name)}
                  className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors flex items-center justify-between ${
                    selectedSection === item.name
                      ? 'bg-[#1B3A4C] text-white'
                      : 'text-[#1B3A4C] hover:bg-[#E3E8ED]'
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
          <div className="mt-4 bg-white border border-[#A3B5C4]/30 overflow-hidden">
            <button
              onClick={() => setSelectedSection('showcards')}
              className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors flex items-center justify-between ${
                selectedSection === 'showcards'
                  ? 'bg-[#1B3A4C] text-white'
                  : 'text-[#1B3A4C] hover:bg-[#E3E8ED]'
              }`}
            >
              <span>Show Cards</span>
              <span className="text-xs text-[#6B8FAB]">{showCards.length}</span>
            </button>
          </div>
        </div>

        {/* Editor panel */}
        <div className="flex-1 min-w-0">
          {loading || cardsLoading ? (
            <p className="text-[#6B8FAB] text-sm">Loading...</p>
          ) : selectedSection === 'showcards' ? (
            <ShowCardsEditor
              cards={showCards}
              onMove={moveCard}
              onUpdate={updateCard}
              onSave={saveCard}
              savingCard={savingCard}
              onOpenMedia={(id) => openMediaPicker('showcard', id)}
            />
          ) : selectedSection === 'hero' ? (
            <HeroEditor
              section={getSection('hero')}
              onChange={(key, val) => updateSectionContent('hero', key, val)}
              onSave={() => saveSection('hero')}
              saving={savingSection === 'hero'}
              onOpenMedia={(field) => openMediaPicker(field === 'image' ? 'hero-image' : 'hero-logo')}
            />
          ) : selectedSection === 'video' ? (
            <VideoEditor
              section={getSection('video')}
              onChange={(key, val) => updateSectionContent('video', key, val)}
              onSave={() => saveSection('video')}
              saving={savingSection === 'video'}
              onOpenMedia={() => openMediaPicker('video-poster')}
            />
          ) : selectedSection === 'reach' ? (
            <ReachEditor
              section={getSection('reach')}
              onChange={(key, val) => updateSectionContent('reach', key, val)}
              onSave={() => saveSection('reach')}
              saving={savingSection === 'reach'}
            />
          ) : selectedSection === 'partners' ? (
            <PartnersEditor
              logos={partnerLogos}
              loading={logosLoading}
              savingLogo={savingLogo}
              onMove={movePartnerLogo}
              onUpdate={updatePartnerLogo}
              onSave={savePartnerLogo}
              onDelete={deletePartnerLogo}
              onAdd={addPartnerLogo}
              onOpenMedia={(id) => openMediaPicker('partner-logo', id)}
            />
          ) : selectedSection === 'radio' ? (
            <RadioEditor
              section={getSection('radio')}
              tracks={tracks}
              loading={tracksLoading}
              savingTrack={savingTrack}
              playingTrack={playingTrack}
              savingSection={savingSection === 'radio'}
              onTogglePlay={togglePlay}
              onMove={moveTrack}
              onUpdate={updateTrack}
              onSave={saveTrack}
              onDelete={deleteTrack}
              onAdd={addTrack}
              onUploadFile={uploadTrackFile}
              onSectionChange={(key, val) => updateSectionContent('radio', key, val)}
              onSectionSave={() => saveSection('radio')}
              onOpenMedia={() => openMediaPicker('radio-image')}
            />
          ) : selectedSection === 'clients' ? (
            <ClientsEditor
              clients={clientNames}
              loading={clientsLoading}
              savingClient={savingClient}
              onMove={moveClient}
              onUpdate={updateClient}
              onSave={saveClient}
              onDelete={deleteClient}
              onAdd={addClient}
            />
          ) : selectedSection === 'carousel' ? (
            <CarouselEditor
              images={carouselImages}
              loading={carouselLoading}
              saving={savingCarousel}
              onMove={moveCarousel}
              onUpdate={updateCarousel}
              onSave={saveCarousel}
              onDelete={deleteCarousel}
              onAdd={addCarousel}
              onOpenMedia={(id) => openMediaPicker('carousel', id)}
            />
          ) : selectedSection === 'reach_out' ? (
            <ReachOutEditor
              section={getSection('reach_out')}
              onChange={(key, val) => updateSectionContent('reach_out', key, val)}
              onSave={() => saveSection('reach_out')}
              saving={savingSection === 'reach_out'}
              onOpenMedia={() => openMediaPicker('reach-out-image')}
            />
          ) : selectedSection === 'share_music' ? (
            <ShareEditor
              section={getSection('share_music')}
              onChange={(key, val) => updateSectionContent('share_music', key, val)}
              onSave={() => saveSection('share_music')}
              saving={savingSection === 'share_music'}
            />
          ) : selectedSection === 'contact' ? (
            <ContactEditor
              section={getSection('contact')}
              onChange={(key, val) => updateSectionContent('contact', key, val)}
              onSave={() => saveSection('contact')}
              saving={savingSection === 'contact'}
            />
          ) : (
            <p className="text-[#6B8FAB] text-sm">Select a section to edit.</p>
          )}
        </div>
      </div>

      <MediaPicker
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={handleMediaSelect}
        filterType="image"
      />
    </div>
  );
}

function HeroEditor({
  section,
  onChange,
  onSave,
  saving,
  onOpenMedia,
}: {
  section?: SectionData;
  onChange: (key: string, val: any) => void;
  onSave: () => void;
  saving: boolean;
  onOpenMedia: (field: 'image' | 'logo') => void;
}) {
  if (!section) {
    return (
      <div className="bg-white border border-[#A3B5C4]/30 p-8">
        <p className="text-[#6B8FAB] text-sm">Hero section not found in database.</p>
      </div>
    );
  }
  const content = parseContent(section.content);
  return (
    <div className="bg-white border border-[#A3B5C4]/30 p-6 space-y-6">
      <div>
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-2">Hero</p>
        <p className="text-sm text-[#5B7A8E] font-semibold uppercase tracking-[0.5px]">Edit the hero headline and background image</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Title</label>
          <input
            type="text"
            value={content.title || ''}
            onChange={(e) => onChange('title', e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Subtitle</label>
          <input
            type="text"
            value={content.subtitle || ''}
            onChange={(e) => onChange('subtitle', e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Background Image</label>
            <div className="relative w-full aspect-video bg-[#E3E8ED] rounded-xl overflow-hidden mb-2 border border-[#A3B5C4]/30">
              {content.image ? (
                <img src={content.image} alt="Hero background" className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-[#A3B5C4]" />
                </div>
              )}
            </div>
            <button
              onClick={() => onOpenMedia('image')}
              className="px-4 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#111] hover:text-white transition"
            >
              Replace Image
            </button>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Logo</label>
            <div className="relative w-full aspect-video bg-[#E3E8ED] rounded-xl overflow-hidden mb-2 border border-[#A3B5C4]/30">
              {content.logo ? (
                <img src={content.logo} alt="Hero logo" className="object-contain p-4 w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-[#A3B5C4]" />
                </div>
              )}
            </div>
            <button
              onClick={() => onOpenMedia('logo')}
              className="px-4 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#111] hover:text-white transition"
            >
              Replace Logo
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 py-2">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={content.overlay !== false}
            onChange={(e) => onChange('overlay', e.target.checked)}
            className="w-4 h-4 accent-[#1B3A4C]"
          />
          <span className="text-sm font-semibold text-[#1B3A4C]">Steel blue overlay</span>
        </label>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={content.grayscale !== false}
            onChange={(e) => onChange('grayscale', e.target.checked)}
            className="w-4 h-4 accent-[#1B3A4C]"
          />
          <span className="text-sm font-semibold text-[#1B3A4C]">Black & white filter</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Zoom (Background Size)</label>
          <select
            value={content.backgroundSize || 'cover'}
            onChange={(e) => onChange('backgroundSize', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
          >
            <option value="cover">Cover (fill screen, may crop)</option>
            <option value="contain">Contain (show full image, white bars)</option>
            <option value="auto 100%">Auto Height (show full height, crop sides)</option>
            <option value="100% auto">Auto Width (show full width, crop top/bottom)</option>
            <option value="100%">100% (actual size, may leave gaps)</option>
            <option value="120%">120% (slight zoom in)</option>
            <option value="150%">150% (zoom in)</option>
            <option value="200%">200% (zoom in more)</option>
            <option value="250%">250% (zoom in max)</option>
            <option value="80%">80% (zoom out, leaves gaps)</option>
            <option value="50%">50% (zoom out more, leaves gaps)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Position (Focus Point)</label>
          <select
            value={content.backgroundPosition || 'center'}
            onChange={(e) => onChange('backgroundPosition', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
          >
            <option value="center">Center</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="top left">Top Left</option>
            <option value="top right">Top Right</option>
            <option value="bottom left">Bottom Left</option>
            <option value="bottom right">Bottom Right</option>
            <option value="25% center">25% Left (focus left)</option>
            <option value="75% center">75% Right (focus right)</option>
            <option value="center 25%">25% Top (focus top)</option>
            <option value="center 75%">75% Bottom (focus bottom)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Background Color (for gaps)</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={content.backgroundColor || '#c8cdd2'}
              onChange={(e) => onChange('backgroundColor', e.target.value)}
              className="w-10 h-10 rounded-lg border border-[#A3B5C4]/30 cursor-pointer"
            />
            <input
              type="text"
              value={content.backgroundColor || '#c8cdd2'}
              onChange={(e) => onChange('backgroundColor', e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
            />
          </div>
          <p className="text-xs text-[#6B8FAB] mt-1">Pick a color that matches the photo background for seamless edges</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Hero'}
        </button>
      </div>
    </div>
  );
}

function VideoEditor({
  section,
  onChange,
  onSave,
  saving,
  onOpenMedia,
}: {
  section?: SectionData;
  onChange: (key: string, val: any) => void;
  onSave: () => void;
  saving: boolean;
  onOpenMedia: () => void;
}) {
  if (!section) {
    return (
      <div className="bg-white border border-[#A3B5C4]/30 p-8">
        <p className="text-[#6B8FAB] text-sm">Video section not found in database.</p>
      </div>
    );
  }
  const content = parseContent(section.content);
  return (
    <div className="bg-white border border-[#A3B5C4]/30 p-6 space-y-6">
      <div>
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-2">Video</p>
        <p className="text-sm text-[#5B7A8E] font-semibold uppercase tracking-[0.5px]">Edit the video poster and source URL</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Video Source URL</label>
          <input
            type="url"
            value={content.src || ''}
            onChange={(e) => onChange('src', e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Poster Image</label>
          <div className="relative w-full aspect-video bg-[#E3E8ED] rounded-xl overflow-hidden mb-2 max-w-md border border-[#A3B5C4]/30">
            {content.poster ? (
              <img src={content.poster} alt="Video poster" className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-[#A3B5C4]" />
              </div>
            )}
          </div>
          <button
            onClick={onOpenMedia}
            className="px-4 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#111] hover:text-white transition"
          >
            Replace Poster
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Video'}
        </button>
      </div>
    </div>
  );
}

function ReachEditor({
  section,
  onChange,
  onSave,
  saving,
  onOpenMedia,
}: {
  section?: SectionData;
  onChange: (key: string, val: any) => void;
  onSave: () => void;
  saving: boolean;
  onOpenMedia?: () => void;
}) {
  if (!section) {
    return (
      <div className="bg-white border border-[#A3B5C4]/30 p-8">
        <p className="text-[#6B8FAB] text-sm">Reach section not found in database.</p>
      </div>
    );
  }
  const content = parseContent(section.content);
  return (
    <div className="bg-white border border-[#A3B5C4]/30 p-6 space-y-6">
      <div>
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-2">Reach</p>
        <p className="text-sm text-[#5B7A8E] font-semibold uppercase tracking-[0.5px]">Edit the reach headline and subtext</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Headline</label>
          <textarea
            value={content.headline || ''}
            onChange={(e) => onChange('headline', e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C] resize-y"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Subtext</label>
          <textarea
            value={content.subtext || ''}
            onChange={(e) => onChange('subtext', e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C] resize-y"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Grammy Badge</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={content.grammyBadge || ''}
              onChange={(e) => onChange('grammyBadge', e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
            />
            {onOpenMedia && (
              <button
                onClick={onOpenMedia}
                className="px-4 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#111] hover:text-white transition"
              >
                Replace Badge
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Reach'}
        </button>
      </div>
    </div>
  );
}

function PartnersEditor({
  logos,
  loading,
  savingLogo,
  onMove,
  onUpdate,
  onSave,
  onDelete,
  onAdd,
  onOpenMedia,
}: {
  logos: PartnerLogo[];
  loading: boolean;
  savingLogo: number | null;
  onMove: (id: number, dir: 'up' | 'down') => void;
  onUpdate: (id: number, field: string, value: any) => void;
  onSave: (id: number) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
  onOpenMedia: (id: number) => void;
}) {
  return (
    <div className="bg-white border border-[#A3B5C4]/30 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-1">Partners</p>
          <p className="text-sm text-[#5B7A8E] font-semibold uppercase tracking-[0.5px]">Edit partner logos — {logos.length} total</p>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#111] hover:text-white transition"
        >
          + Add Logo
        </button>
      </div>

      {loading ? (
        <p className="text-[#6B8FAB] text-sm">Loading...</p>
      ) : logos.length === 0 ? (
        <p className="text-[#6B8FAB] text-sm">No partner logos yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {logos.map((logo, idx) => (
            <div key={logo.id} className="border border-[#A3B5C4]/30 p-4 space-y-3 bg-white">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px]">#{idx + 1}</span>
                <div className="flex items-center gap-1 ml-auto">
                  <button
                    onClick={() => onMove(logo.id, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 text-[#6B8FAB] hover:text-[#1B3A4C] hover:bg-[#E3E8ED] rounded-lg transition-colors disabled:opacity-30"
                  >
                    <UpIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onMove(logo.id, 'down')}
                    disabled={idx === logos.length - 1}
                    className="p-1.5 text-[#6B8FAB] hover:text-[#1B3A4C] hover:bg-[#E3E8ED] rounded-lg transition-colors disabled:opacity-30"
                  >
                    <DownIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(logo.id)}
                    className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="relative w-full aspect-[3/2] bg-[#E3E8ED] rounded-xl overflow-hidden border border-[#A3B5C4]/30">
                {logo.imagePath ? (
                  <img src={logo.imagePath} alt={logo.name} className="object-contain p-2 w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-[#A3B5C4]" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Name</label>
                <input
                  type="text"
                  value={logo.name}
                  onChange={(e) => onUpdate(logo.id, 'name', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onOpenMedia(logo.id)}
                  className="flex-1 px-3 py-1.5 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#111] hover:text-white transition"
                >
                  Replace Image
                </button>
                <button
                  onClick={() => onSave(logo.id)}
                  disabled={savingLogo === logo.id}
                  className="px-3 py-1.5 border border-[#A3B5C4]/50 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#1B3A4C] hover:border-[#111] hover:text-[#111] transition disabled:opacity-50"
                >
                  {savingLogo === logo.id ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RadioEditor({
  section,
  tracks,
  loading,
  savingTrack,
  playingTrack,
  savingSection,
  onTogglePlay,
  onMove,
  onUpdate,
  onSave,
  onDelete,
  onAdd,
  onUploadFile,
  onSectionChange,
  onSectionSave,
  onOpenMedia,
}: {
  section?: SectionData;
  tracks: Track[];
  loading: boolean;
  savingTrack: number | null;
  playingTrack: number | null;
  savingSection?: boolean;
  onTogglePlay: (id: number, filePath: string | null) => void;
  onMove: (id: number, dir: 'up' | 'down') => void;
  onUpdate: (id: number, field: string, value: any) => void;
  onSave: (id: number) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
  onUploadFile: (id: number, file: File) => void;
  onSectionChange?: (key: string, val: any) => void;
  onSectionSave?: () => void;
  onOpenMedia?: () => void;
}) {
  const content = section ? parseContent(section.content) : {};
  return (
    <div className="bg-white border border-[#A3B5C4]/30 p-6 space-y-6">
      {section && (
        <div className="space-y-4 pb-4 border-b border-[#A3B5C4]/20">
          <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-1">Radio Section</p>
          <p className="text-sm text-[#5B7A8E] mb-4 font-semibold uppercase tracking-[0.5px]">Edit the radio section content and image</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Portrait Image</label>
              <div className="relative w-full aspect-video bg-[#E3E8ED] rounded-xl overflow-hidden mb-2 border border-[#A3B5C4]/30">
                {content.image ? (
                  <img src={content.image} alt="Radio portrait" className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-[#A3B5C4]" />
                  </div>
                )}
              </div>
              {onOpenMedia && (
                <button
                  onClick={onOpenMedia}
                  className="px-4 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#111] hover:text-white transition"
                >
                  Replace Image
                </button>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Label</label>
                <input
                  type="text"
                  value={content.label || ''}
                  onChange={(e) => onSectionChange?.('label', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Headline</label>
                <input
                  type="text"
                  value={content.headline || ''}
                  onChange={(e) => onSectionChange?.('headline', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Description</label>
                <textarea
                  value={content.description || ''}
                  onChange={(e) => onSectionChange?.('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C] resize-y"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Spotify URL</label>
              <input
                type="text"
                value={content.spotifyUrl || ''}
                onChange={(e) => onSectionChange?.('spotifyUrl', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Apple Music URL</label>
              <input
                type="text"
                value={content.appleMusicUrl || ''}
                onChange={(e) => onSectionChange?.('appleMusicUrl', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">YouTube URL</label>
              <input
                type="text"
                value={content.youtubeUrl || ''}
                onChange={(e) => onSectionChange?.('youtubeUrl', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
              />
            </div>
          </div>
          {onSectionSave && (
            <div className="flex justify-end">
              <button
                onClick={onSectionSave}
                disabled={savingSection}
                className="px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition disabled:opacity-50"
              >
                {savingSection ? 'Saving...' : 'Save Section'}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-1">Tracks</p>
          <p className="text-sm text-[#5B7A8E] font-semibold uppercase tracking-[0.5px]">Edit audio tracks — {tracks.length} total</p>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#111] hover:text-white transition"
        >
          + Add Track
        </button>
      </div>

      {loading ? (
        <p className="text-[#6B8FAB] text-sm">Loading...</p>
      ) : tracks.length === 0 ? (
        <p className="text-[#6B8FAB] text-sm">No tracks yet.</p>
      ) : (
        <div className="space-y-3">
          {tracks.map((track, idx) => (
            <div key={track.id} className="border border-[#A3B5C4]/30 rounded-xl p-4 bg-white">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px]">#{idx + 1}</span>
                <div className="flex items-center gap-1 ml-auto">
                  <button
                    onClick={() => onMove(track.id, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 text-[#6B8FAB] hover:text-[#1B3A4C] hover:bg-[#E3E8ED] rounded-lg transition-colors disabled:opacity-30"
                  >
                    <UpIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onMove(track.id, 'down')}
                    disabled={idx === tracks.length - 1}
                    className="p-1.5 text-[#6B8FAB] hover:text-[#1B3A4C] hover:bg-[#E3E8ED] rounded-lg transition-colors disabled:opacity-30"
                  >
                    <DownIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(track.id)}
                    className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Title</label>
                  <input
                    type="text"
                    value={track.title}
                    onChange={(e) => onUpdate(track.id, 'title', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Duration</label>
                  <input
                    type="text"
                    value={track.duration || ''}
                    onChange={(e) => onUpdate(track.id, 'duration', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onTogglePlay(track.id, track.filePath)}
                    disabled={!track.filePath}
                    className="p-2 border-2 border-[#111] rounded-full text-[#111] hover:bg-[#111] hover:text-white transition disabled:opacity-30"
                  >
                    {playingTrack === track.id ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => onSave(track.id)}
                    disabled={savingTrack === track.id}
                    className="flex-1 px-3 py-2 border border-[#A3B5C4]/50 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#1B3A4C] hover:border-[#111] hover:text-[#111] transition disabled:opacity-50"
                  >
                    {savingTrack === track.id ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

              <div className="mt-2">
                <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Audio File</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={track.filePath || ''}
                    onChange={(e) => onUpdate(track.id, 'filePath', e.target.value)}
                    placeholder="/assets/snippet.mp3"
                    className="flex-1 px-3 py-2 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
                  />
                  <label className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    savingTrack === track.id ? 'bg-[#6B8FAB] text-white' : 'bg-[#1B3A4C] text-white hover:bg-[#2a4f66]'
                  }`}>
                    <UploadIcon className="w-3.5 h-3.5" />
                    {savingTrack === track.id ? 'Uploading...' : 'Upload MP3'}
                    <input
                      type="file"
                      accept="audio/mp3,audio/mpeg,audio/wav,audio/aac"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onUploadFile(track.id, file);
                        e.target.value = '';
                      }}
                      disabled={savingTrack === track.id}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClientsEditor({
  clients,
  loading,
  savingClient,
  onMove,
  onUpdate,
  onSave,
  onDelete,
  onAdd,
}: {
  clients: ClientName[];
  loading: boolean;
  savingClient: number | null;
  onMove: (id: number, dir: 'up' | 'down') => void;
  onUpdate: (id: number, field: string, value: any) => void;
  onSave: (id: number) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
}) {
  return (
    <div className="bg-white border border-[#A3B5C4]/30 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-1">Clients</p>
          <p className="text-sm text-[#5B7A8E] font-semibold uppercase tracking-[0.5px]">Edit client names — {clients.length} total</p>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#111] hover:text-white transition"
        >
          + Add Client
        </button>
      </div>

      {loading ? (
        <p className="text-[#6B8FAB] text-sm">Loading...</p>
      ) : clients.length === 0 ? (
        <p className="text-[#6B8FAB] text-sm">No clients yet.</p>
      ) : (
        <div className="space-y-2">
          {clients.map((client, idx) => (
            <div key={client.id} className="flex items-center gap-3 border border-[#A3B5C4]/30 px-4 py-3 bg-white">
              <span className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px] w-8">{idx + 1}</span>
              <input
                type="text"
                value={client.name}
                onChange={(e) => onUpdate(client.id, 'name', e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
              />
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onMove(client.id, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 text-[#6B8FAB] hover:text-[#1B3A4C] hover:bg-[#E3E8ED] rounded-lg transition-colors disabled:opacity-30"
                >
                  <UpIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onMove(client.id, 'down')}
                  disabled={idx === clients.length - 1}
                  className="p-1.5 text-[#6B8FAB] hover:text-[#1B3A4C] hover:bg-[#E3E8ED] rounded-lg transition-colors disabled:opacity-30"
                >
                  <DownIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onSave(client.id)}
                  disabled={savingClient === client.id}
                  className="px-3 py-1.5 border border-[#A3B5C4]/50 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#1B3A4C] hover:border-[#111] hover:text-[#111] transition disabled:opacity-50"
                >
                  {savingClient === client.id ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => onDelete(client.id)}
                  className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ShareEditor({
  section,
  onChange,
  onSave,
  saving,
}: {
  section?: SectionData;
  onChange: (key: string, val: any) => void;
  onSave: () => void;
  saving: boolean;
}) {
  if (!section) {
    return (
      <div className="bg-white border border-[#A3B5C4]/30 p-8">
        <p className="text-[#6B8FAB] text-sm">Share Music section not found in database.</p>
      </div>
    );
  }
  const content = parseContent(section.content);
  return (
    <div className="bg-white border border-[#A3B5C4]/30 p-6 space-y-6">
      <div>
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-2">Share Music</p>
        <p className="text-sm text-[#5B7A8E] font-semibold uppercase tracking-[0.5px]">Edit the share music headline and description</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Headline</label>
          <input
            type="text"
            value={content.headline || ''}
            onChange={(e) => onChange('headline', e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Description</label>
          <textarea
            value={content.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C] resize-y"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Share Music'}
        </button>
      </div>
    </div>
  );
}

function ContactEditor({
  section,
  onChange,
  onSave,
  saving,
}: {
  section?: SectionData;
  onChange: (key: string, val: any) => void;
  onSave: () => void;
  saving: boolean;
}) {
  if (!section) {
    return (
      <div className="bg-white border border-[#A3B5C4]/30 p-8">
        <p className="text-[#6B8FAB] text-sm">Contact section not found in database.</p>
      </div>
    );
  }
  const content = parseContent(section.content);
  return (
    <div className="bg-white border border-[#A3B5C4]/30 p-6 space-y-6">
      <div>
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-2">Reach Out</p>
        <p className="text-sm text-[#5B7A8E] font-semibold uppercase tracking-[0.5px]">Edit contact details</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Booking Email</label>
          <input
            type="email"
            value={content.bookingEmail || ''}
            onChange={(e) => onChange('bookingEmail', e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Instagram</label>
          <input
            type="text"
            value={content.instagram || ''}
            onChange={(e) => onChange('instagram', e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Contact'}
        </button>
      </div>
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
      <div className="bg-white border border-[#A3B5C4]/30 p-6">
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-1">Show Cards</p>
        <p className="text-sm text-[#5B7A8E] font-semibold uppercase tracking-[0.5px] mb-6">Reorder and edit each show card</p>

        <div className="space-y-4">
          {cards.map((card, idx) => (
            <div key={card.id} className="border border-[#A3B5C4]/30 p-4 bg-white">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px]">#{idx + 1}</span>
                <div className="flex items-center gap-1 ml-auto">
                  <button
                    onClick={() => onMove(card.id, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 text-[#6B8FAB] hover:text-[#1B3A4C] hover:bg-[#E3E8ED] rounded-lg transition-colors disabled:opacity-30"
                  >
                    <UpIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onMove(card.id, 'down')}
                    disabled={idx === cards.length - 1}
                    className="p-1.5 text-[#6B8FAB] hover:text-[#1B3A4C] hover:bg-[#E3E8ED] rounded-lg transition-colors disabled:opacity-30"
                  >
                    <DownIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Image</label>
                  <div className="relative w-full aspect-video bg-[#E3E8ED] rounded-xl overflow-hidden mb-2 border border-[#A3B5C4]/30">
                    {card.imagePath ? (
                      <img src={card.imagePath} alt={card.title} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-[#A3B5C4]" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onOpenMedia(card.id)}
                    className="px-4 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#111] hover:text-white transition"
                  >
                    Replace Image
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Title</label>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => onUpdate(card.id, 'title', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Venue</label>
                      <input
                        type="text"
                        value={card.venue}
                        onChange={(e) => onUpdate(card.id, 'venue', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Location</label>
                      <input
                        type="text"
                        value={card.location}
                        onChange={(e) => onUpdate(card.id, 'location', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Season</label>
                    <input
                      type="text"
                      value={card.season}
                      onChange={(e) => onUpdate(card.id, 'season', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Description</label>
                    <textarea
                      value={card.description}
                      onChange={(e) => onUpdate(card.id, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C] resize-y"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => onSave(card.id)}
                  disabled={savingCard === card.id}
                  className="px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition disabled:opacity-50"
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

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function CarouselEditor({
  images,
  loading,
  saving,
  onMove,
  onUpdate,
  onSave,
  onDelete,
  onAdd,
  onOpenMedia,
}: {
  images: { id: number; imagePath: string | null; alt: string; order: number; isActive: boolean }[];
  loading: boolean;
  saving: number | null;
  onMove: (id: number, dir: 'up' | 'down') => void;
  onUpdate: (id: number, field: string, value: any) => void;
  onSave: (id: number) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
  onOpenMedia: (id: number) => void;
}) {
  return (
    <div className="bg-white border border-[#A3B5C4]/30 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-1">Carousel</p>
          <p className="text-sm text-[#5B7A8E] font-semibold uppercase tracking-[0.5px]">Edit carousel images — {images.length} total</p>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#111] hover:text-white transition"
        >
          + Add Image
        </button>
      </div>
      {loading ? (
        <p className="text-[#6B8FAB] text-sm">Loading...</p>
      ) : images.length === 0 ? (
        <p className="text-[#6B8FAB] text-sm">No images yet.</p>
      ) : (
        <div className="space-y-3">
          {images.map((img, idx) => (
            <div key={img.id} className="border border-[#A3B5C4]/30 rounded-xl p-4 bg-white">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[2px]">#{idx + 1}</span>
                <div className="flex items-center gap-1 ml-auto">
                  <button
                    onClick={() => onMove(img.id, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 text-[#6B8FAB] hover:text-[#1B3A4C] hover:bg-[#E3E8ED] rounded-lg transition-colors disabled:opacity-30"
                  >
                    <UpIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onMove(img.id, 'down')}
                    disabled={idx === images.length - 1}
                    className="p-1.5 text-[#6B8FAB] hover:text-[#1B3A4C] hover:bg-[#E3E8ED] rounded-lg transition-colors disabled:opacity-30"
                  >
                    <DownIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(img.id)}
                    className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Alt Text</label>
                  <input
                    type="text"
                    value={img.alt}
                    onChange={(e) => onUpdate(img.id, 'alt', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenMedia(img.id)}
                    className="px-3 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#111] hover:text-white transition"
                  >
                    Replace Image
                  </button>
                  <button
                    onClick={() => onSave(img.id)}
                    disabled={saving === img.id}
                    className="flex-1 px-3 py-2 border border-[#A3B5C4]/50 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#1B3A4C] hover:border-[#111] hover:text-[#111] transition disabled:opacity-50"
                  >
                    {saving === img.id ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
              {img.imagePath && (
                <div className="mt-2 aspect-video bg-[#E3E8ED] rounded-lg overflow-hidden">
                  <img src={img.imagePath} alt={img.alt} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReachOutEditor({
  section,
  onChange,
  onSave,
  saving,
  onOpenMedia,
}: {
  section: SectionData | undefined;
  onChange: (key: string, val: any) => void;
  onSave: () => void;
  saving: boolean;
  onOpenMedia: () => void;
}) {
  if (!section) return <p className="text-[#6B8FAB] text-sm">Section not found.</p>;
  const content = parseContent(section.content);
  return (
    <div className="bg-white border border-[#A3B5C4]/30 p-6 space-y-6">
      <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-1">Reach Out</p>
      <p className="text-sm text-[#5B7A8E] mb-6 font-semibold uppercase tracking-[0.5px]">Edit the reach out section.</p>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Headline</label>
          <input
            type="text"
            value={content.headline || ''}
            onChange={(e) => onChange('headline', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Signature</label>
          <input
            type="text"
            value={content.signature || ''}
            onChange={(e) => onChange('signature', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">CTA Text</label>
          <input
            type="text"
            value={content.cta || ''}
            onChange={(e) => onChange('cta', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Image</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={content.image || ''}
              onChange={(e) => onChange('image', e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
            />
            <button
              onClick={onOpenMedia}
              className="px-4 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#111] hover:bg-[#111] hover:text-white transition"
            >
              Replace Image
            </button>
          </div>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-6 py-2.5 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
