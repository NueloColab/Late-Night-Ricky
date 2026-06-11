'use client';

import { useState, useEffect, useCallback } from 'react';

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

/** Compress images client-side to stay under upload limits */
async function compressImage(file: File, maxSizeMB: number = 9): Promise<File> {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size <= maxSizeBytes) return file;
  if (!file.type.startsWith('image/')) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      const maxDimension = 2500;
      if (width > maxDimension || height > maxDimension) {
        const scale = Math.min(maxDimension / width, maxDimension / height);
        width = Math.floor(width * scale);
        height = Math.floor(height * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      const minQuality = 0.1;
      const maxQuality = 0.95;
      let bestBlob: Blob | null = null;

      const tryQuality = (q: number, attempts: number = 0) => {
        if (attempts > 8) {
          if (bestBlob) {
            resolve(new File([bestBlob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
          } else {
            reject(new Error('Could not compress image under size limit'));
          }
          return;
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error('Compression failed')); return; }
            if (blob.size <= maxSizeBytes) {
              resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
              return;
            }
            if (!bestBlob || blob.size < bestBlob.size) bestBlob = blob;
            const newQuality = q - 0.15;
            if (newQuality >= minQuality) {
              tryQuality(newQuality, attempts + 1);
            } else {
              const scale = 0.7;
              canvas.width = Math.floor(width * scale);
              canvas.height = Math.floor(height * scale);
              const newCtx = canvas.getContext('2d');
              newCtx?.drawImage(img, 0, 0, canvas.width, canvas.height);
              tryQuality(maxQuality, attempts + 1);
            }
          },
          'image/jpeg',
          q
        );
      };

      tryQuality(maxQuality);
    };

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

export default function MediaPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fetchAssets = useCallback(async () => {
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
      }
    } catch (e) {
      console.error('Fetch assets error:', e);
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
    setUploadError('');
    try {
      for (const file of Array.from(files)) {
        // Compress images client-side before uploading
        const uploadFile = await compressImage(file, 9);
        const formData = new FormData();
        formData.append('file', uploadFile);
        const res = await fetch('/api/media', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok || data.error) {
          setUploadError(data.error || `Upload failed (${res.status})`);
          break;
        }
      }
      await fetchAssets();
    } catch (err: any) {
      setUploadError(err.message || 'Network error');
    }
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
          <h1 className="font-display text-3xl font-semibold text-white">Media Library</h1>
          <p className="text-[#8FA3B3] mt-1 text-sm">Manage images, videos, and documents</p>
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
          className="flex-1 px-4 py-3 bg-white rounded-xl border border-[#8FA8BE]/30 text-sm focus:outline-none focus:border-[#1B3A4C] text-white"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-3 bg-white rounded-xl border border-[#8FA8BE]/30 text-sm focus:outline-none focus:border-[#1B3A4C] text-white"
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {t === 'all' ? 'All Types' : t}
            </option>
          ))}
        </select>
      </div>

      {uploadError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600 font-medium">⚠ {uploadError}</p>
        </div>
      )}

      {loading ? (
        <p className="text-[#8FA3B3] text-sm">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#8FA8BE]/20">
          <p className="text-[#8FA3B3] text-sm">No files found. Upload your first asset above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((asset) => (
            <div
              key={asset.id}
              className="group bg-white rounded-2xl overflow-hidden border border-[#8FA8BE]/20 hover:border-[#1B3A4C] transition-shadow"
            >
              <div className="aspect-square bg-[#0A0A0A] flex items-center justify-center relative">
                {asset.type === 'image' ? (
                  <img
                    src={asset.path}
                    alt={asset.originalName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%238FA8BE%22 stroke-width=%222%22%3E%3Crect x=%223%22 y=%223%22 width=%2218%22 height=%2218%22 rx=%222%22/%3E%3Ccircle cx=%228.5%22 cy=%228.5%22 r=%221.5%22/%3E%3Cpath d=%22M21 15l-5-5L5 21%22/%3E%3C/svg%3E';
                    }}
                  />
                ) : asset.type === 'video' ? (
                  <video src={asset.path} className="w-full h-full object-cover" preload="metadata" />
                ) : (
                  <FileIcon className="w-10 h-10 text-[#8FA3B3]" />
                )}
                <div className="absolute inset-0 bg-[#1B3A4C]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a
                    href={asset.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white text-white rounded-lg text-xs font-semibold"
                  >
                    View
                  </a>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-white truncate">{asset.originalName}</p>
                <p className="text-[10px] text-[#8FA3B3] mt-0.5 uppercase tracking-wide">
                  {formatBytes(asset.size)} · {asset.type}
                </p>
                {asset.usedIn && asset.usedIn.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {asset.usedIn.slice(0, 2).map((ref: string, i: number) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 bg-[#1B3A4C] text-white rounded font-semibold uppercase tracking-wider">
                        {ref}
                      </span>
                    ))}
                    {asset.usedIn.length > 2 && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-[#0A0A0A] text-white rounded font-semibold uppercase tracking-wider">+{asset.usedIn.length - 2}</span>
                    )}
                  </div>
                )}
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
