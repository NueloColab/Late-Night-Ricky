'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface Asset {
  id: number;
  filename: string;
  originalName: string;
  type: string;
  size: number;
  path: string;
  thumbnailPath?: string;
  uploadedAt: string;
}

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  filterType?: 'image' | 'video' | 'all';
}

export default function MediaPicker({ open, onClose, onSelect, filterType = 'all' }: MediaPickerProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchAssets = useCallback(async () => {
    const res = await fetch('/api/assets');
    if (res.ok) {
      const data = await res.json();
      setAssets(data.assets || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) {
      fetchAssets();
    }
  }, [open, fetchAssets]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success && data.asset) {
      onSelect(data.asset.path);
      onClose();
    }
    setUploading(false);
    e.target.value = '';
  }

  const filtered = assets.filter((a) => {
    const matchesSearch = a.originalName.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || a.type === filterType;
    return matchesSearch && matchesType;
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1B3A4C]/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-[#E3E8ED] flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-[#1B3A4C]">Media Library</h2>
          <button onClick={onClose} className="text-[#8FA8BE] hover:text-[#1B3A4C] transition-colors">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-[#E3E8ED] flex items-center gap-3">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 bg-[#E3E8ED] rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]/20"
          />
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B3A4C] text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-[#2a4f66] transition-colors">
            {uploading ? 'Uploading...' : 'Upload New'}
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept={filterType === 'image' ? 'image/*' : filterType === 'video' ? 'video/*' : undefined} />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-[#8FA8BE] text-sm text-center py-8">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-[#8FA8BE] text-sm text-center py-8">No assets found.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filtered.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => {
                    onSelect(asset.path);
                    onClose();
                  }}
                  className="group relative aspect-square bg-[#E3E8ED] rounded-xl overflow-hidden hover:ring-2 hover:ring-[#1B3A4C] transition-all text-left"
                >
                  {asset.type === 'image' ? (
                    <Image src={asset.path} alt={asset.originalName} fill className="object-cover" sizes="150px" />
                  ) : asset.type === 'video' ? (
                    <video src={asset.path} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileIcon className="w-8 h-8 text-[#8FA8BE]" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1B3A4C]/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-white font-medium truncate">{asset.originalName}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
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

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
