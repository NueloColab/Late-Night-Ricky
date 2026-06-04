'use client';

import { useState } from 'react';
import Image from 'next/image';
import MediaPicker from './media-picker';

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

interface SectionEditorProps {
  section: SectionData | null;
  onSaved?: () => void;
}

export default function SectionEditor({ section, onSaved }: SectionEditorProps) {
  const [data, setData] = useState<SectionData | null>(section);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<string | null>(null);
  const [mediaFilter, setMediaFilter] = useState<'image' | 'video' | 'all'>('all');

  if (!section) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-[#8FA8BE]/20">
        <p className="text-[#8FA8BE] text-sm">Select a section to edit.</p>
      </div>
    );
  }

  if (data?.id !== section.id) {
    setData(section);
  }

  const content = typeof data?.content === 'string' ? JSON.parse(data.content || '[]') : (data?.content || []);
  const images = typeof data?.images === 'string' ? JSON.parse(data.images || '[]') : (data?.images || []);
  const videos = typeof data?.videos === 'string' ? JSON.parse(data.videos || '[]') : (data?.videos || []);
  const links = typeof data?.links === 'string' ? JSON.parse(data.links || '[]') : (data?.links || []);

  function updateField(field: string, value: any) {
    setData((prev) => prev ? { ...prev, [field]: value } : prev);
  }

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    const res = await fetch(`/api/sections/${data.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: data.content,
        images: data.images,
        videos: data.videos,
        links: data.links,
        isActive: data.isActive,
      }),
    });
    setSaving(false);
    if (res.ok) {
      onSaved?.();
    }
  }

  async function handlePublish() {
    setPublishing(true);
    await new Promise((r) => setTimeout(r, 800));
    setPublishing(false);
    alert('Publish triggered (site rebuild — mock for now)');
  }

  function openMediaPicker(target: string, filter: 'image' | 'video' | 'all' = 'all') {
    setMediaTarget(target);
    setMediaFilter(filter);
    setMediaOpen(true);
  }

  function handleMediaSelect(path: string) {
    if (!mediaTarget || !data) return;
    if (mediaTarget.startsWith('image-')) {
      const idx = parseInt(mediaTarget.replace('image-', ''));
      const newImages = [...images];
      newImages[idx] = path;
      updateField('images', newImages);
    } else if (mediaTarget.startsWith('video-')) {
      const idx = parseInt(mediaTarget.replace('video-', ''));
      const newVideos = [...videos];
      newVideos[idx] = path;
      updateField('videos', newVideos);
    }
  }

  return (
    <div className="space-y-6">
      {/* Content Fields */}
      {Array.isArray(content) && content.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-[#8FA8BE]/20">
          <h3 className="font-serif text-lg font-semibold text-[#1B3A4C] mb-4">Content</h3>
          <div className="space-y-4">
            {content.map((text: string, i: number) => (
              <div key={i}>
                <label className="block text-xs font-semibold text-[#8FA8BE] uppercase tracking-widest mb-1.5">
                  Text Block {i + 1}
                </label>
                <textarea
                  value={text}
                  onChange={(e) => {
                    const newContent = [...content];
                    newContent[i] = e.target.value;
                    updateField('content', newContent);
                  }}
                  rows={4}
                  className="w-full px-4 py-3 bg-[#E3E8ED] rounded-xl text-sm text-[#1B3A4C] focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]/20 resize-y"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Images */}
      {Array.isArray(images) && (
        <div className="bg-white rounded-2xl p-6 border border-[#8FA8BE]/20">
          <h3 className="font-serif text-lg font-semibold text-[#1B3A4C] mb-4">Images</h3>
          <div className="space-y-4">
            {images.length === 0 ? (
              <div className="flex items-center gap-3">
                <p className="text-sm text-[#8FA8BE]">No images</p>
                <button
                  onClick={() => openMediaPicker('image-0', 'image')}
                  className="px-3 py-1.5 bg-[#1B3A4C] text-white rounded-lg text-xs font-semibold hover:bg-[#2a4f66] transition-colors"
                >
                  Add Image
                </button>
              </div>
            ) : (
              images.map((img: string, i: number) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="relative w-24 h-24 bg-[#E3E8ED] rounded-xl overflow-hidden flex-shrink-0">
                    {img ? (
                      <Image src={img} alt="" fill className="object-cover" sizes="96px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-[#8FA8BE]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#8FA8BE] mb-1.5 uppercase tracking-widest font-semibold">Image {i + 1}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openMediaPicker(`image-${i}`, 'image')}
                        className="px-3 py-1.5 bg-[#1B3A4C] text-white rounded-lg text-xs font-semibold hover:bg-[#2a4f66] transition-colors"
                      >
                        Replace
                      </button>
                      <button
                        onClick={() => {
                          const newImages = images.filter((_: string, idx: number) => idx !== i);
                          updateField('images', newImages);
                        }}
                        className="px-3 py-1.5 bg-[#E3E8ED] text-[#1B3A4C] rounded-lg text-xs font-semibold hover:bg-[#d1d9e0] transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
            {images.length > 0 && (
              <button
                onClick={() => openMediaPicker(`image-${images.length}`, 'image')}
                className="px-3 py-1.5 border border-[#1B3A4C] text-[#1B3A4C] rounded-lg text-xs font-semibold hover:bg-[#1B3A4C] hover:text-white transition-colors"
              >
                + Add Another Image
              </button>
            )}
          </div>
        </div>
      )}

      {/* Videos */}
      {Array.isArray(videos) && (
        <div className="bg-white rounded-2xl p-6 border border-[#8FA8BE]/20">
          <h3 className="font-serif text-lg font-semibold text-[#1B3A4C] mb-4">Videos</h3>
          <div className="space-y-4">
            {videos.length === 0 ? (
              <div className="flex items-center gap-3">
                <p className="text-sm text-[#8FA8BE]">No videos</p>
                <button
                  onClick={() => openMediaPicker('video-0', 'video')}
                  className="px-3 py-1.5 bg-[#1B3A4C] text-white rounded-lg text-xs font-semibold hover:bg-[#2a4f66] transition-colors"
                >
                  Add Video
                </button>
              </div>
            ) : (
              videos.map((vid: string, i: number) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="relative w-24 h-24 bg-[#E3E8ED] rounded-xl overflow-hidden flex-shrink-0">
                    {vid ? (
                      <video src={vid} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <VideoIcon className="w-6 h-6 text-[#8FA8BE]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#8FA8BE] mb-1.5 uppercase tracking-widest font-semibold">Video {i + 1}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openMediaPicker(`video-${i}`, 'video')}
                        className="px-3 py-1.5 bg-[#1B3A4C] text-white rounded-lg text-xs font-semibold hover:bg-[#2a4f66] transition-colors"
                      >
                        Replace
                      </button>
                      <button
                        onClick={() => {
                          const newVideos = videos.filter((_: string, idx: number) => idx !== i);
                          updateField('videos', newVideos);
                        }}
                        className="px-3 py-1.5 bg-[#E3E8ED] text-[#1B3A4C] rounded-lg text-xs font-semibold hover:bg-[#d1d9e0] transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
            {videos.length > 0 && (
              <button
                onClick={() => openMediaPicker(`video-${videos.length}`, 'video')}
                className="px-3 py-1.5 border border-[#1B3A4C] text-[#1B3A4C] rounded-lg text-xs font-semibold hover:bg-[#1B3A4C] hover:text-white transition-colors"
              >
                + Add Another Video
              </button>
            )}
          </div>
        </div>
      )}

      {/* Links */}
      {Array.isArray(links) && (
        <div className="bg-white rounded-2xl p-6 border border-[#8FA8BE]/20">
          <h3 className="font-serif text-lg font-semibold text-[#1B3A4C] mb-4">Links</h3>
          <div className="space-y-3">
            {links.map((link: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="url"
                  value={link}
                  onChange={(e) => {
                    const newLinks = [...links];
                    newLinks[i] = e.target.value;
                    updateField('links', newLinks);
                  }}
                  placeholder="https://..."
                  className="flex-1 px-4 py-2.5 bg-[#E3E8ED] rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]/20"
                />
                <button
                  onClick={() => {
                    const newLinks = links.filter((_: string, idx: number) => idx !== i);
                    updateField('links', newLinks);
                  }}
                  className="px-3 py-2.5 bg-[#E3E8ED] text-[#1B3A4C] rounded-lg text-xs font-semibold hover:bg-[#d1d9e0] transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => updateField('links', [...links, ''])}
              className="px-3 py-1.5 border border-[#1B3A4C] text-[#1B3A4C] rounded-lg text-xs font-semibold hover:bg-[#1B3A4C] hover:text-white transition-colors"
            >
              + Add Link
            </button>
          </div>
        </div>
      )}

      {/* Active Toggle */}
      <div className="bg-white rounded-2xl p-6 border border-[#8FA8BE]/20 flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-semibold text-[#1B3A4C]">Section Active</h3>
          <p className="text-xs text-[#8FA8BE] mt-1">Show or hide this section on the site</p>
        </div>
        <button
          onClick={() => updateField('isActive', !data?.isActive)}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${data?.isActive ? 'bg-[#1B3A4C]' : 'bg-[#8FA8BE]'}`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${data?.isActive ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-[#1B3A4C] text-white rounded-xl font-semibold text-sm uppercase tracking-widest hover:bg-[#2a4f66] transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="px-6 py-3 bg-white border-2 border-[#1B3A4C] text-[#1B3A4C] rounded-xl font-semibold text-sm uppercase tracking-widest hover:bg-[#1B3A4C] hover:text-white transition-colors disabled:opacity-50"
        >
          {publishing ? 'Publishing...' : 'Publish'}
        </button>
      </div>

      <MediaPicker open={mediaOpen} onClose={() => setMediaOpen(false)} onSelect={handleMediaSelect} filterType={mediaFilter} />
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
