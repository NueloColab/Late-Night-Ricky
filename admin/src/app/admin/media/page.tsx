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
  usedIn?: string[];
  uploadedAt: string;
}

export default function MediaPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchAssets = useCallback(async () => {
    const res = await fetch('/api/media');
    if (res.ok) {
      const data = await res.json();
      setAssets(data.assets || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      await fetch('/api/media', { method: 'POST', body: formData });
    }
    await fetchAssets();
    setUploading(false);
    e.target.value = '';
  }

  const filtered = assets.filter((a) => {
    const matchesSearch =
      a.originalName.toLowerCase().includes(search.toLowerCase()) ||
      a.filename.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || a.type === filter;
    return matchesSearch && matchesFilter;
  });

  const types = ['all', ...Array.from(new Set(assets.map((a) => a.type)))];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#1B3A4C]">Media Library</h1>
          <p className="text-[#8FA8BE] mt-1 text-sm">Manage images, videos, and documents</p>
        </div>
        <label className="inline-flex items-center gap-2 px-5 py-3 bg-[#1B3A4C] text-white rounded-xl font-semibold text-sm uppercase tracking-widest cursor-pointer hover:bg-[#2a4f66] transition-colors">
          <UploadIcon className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload'}
          <input type="file" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-3 bg-white rounded-xl border border-[#8FA8BE]/30 text-sm focus:outline-none focus:border-[#1B3A4C] text-[#1B3A4C]"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-3 bg-white rounded-xl border border-[#8FA8BE]/30 text-sm focus:outline-none focus:border-[#1B3A4C] text-[#1B3A4C]"
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {t === 'all' ? 'All Types' : t}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-[#8FA8BE] text-sm">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#8FA8BE]/20">
          <p className="text-[#8FA8BE] text-sm">No files found. Upload your first asset above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((asset) => (
            <div
              key={asset.id}
              className="group bg-white rounded-2xl overflow-hidden border border-[#8FA8BE]/20 hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-[#E3E8ED] flex items-center justify-center relative">
                {asset.type === 'image' ? (
                  <Image
                    src={asset.path}
                    alt={asset.originalName}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover"
                  />
                ) : asset.type === 'video' ? (
                  <video src={asset.path} className="w-full h-full object-cover" />
                ) : (
                  <FileIcon className="w-10 h-10 text-[#8FA8BE]" />
                )}
                <div className="absolute inset-0 bg-[#1B3A4C]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a
                    href={asset.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white text-[#1B3A4C] rounded-lg text-xs font-semibold"
                  >
                    View
                  </a>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-[#1B3A4C] truncate">{asset.originalName}</p>
                <p className="text-[10px] text-[#8FA8BE] mt-0.5 uppercase tracking-wide">
                  {formatBytes(asset.size)} · {asset.type}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
