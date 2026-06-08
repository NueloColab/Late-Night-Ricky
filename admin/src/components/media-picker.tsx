'use client';

import { useState } from 'react';

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  filterType?: 'image' | 'video' | 'all';
}

export default function MediaPicker({ open, onClose, onSelect, filterType = 'all' }: MediaPickerProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [fileType, setFileType] = useState('');

  if (!open) return null;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setPreview(URL.createObjectURL(file));
    setFileType(file.type);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload?_t=' + Date.now(), { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || `Upload failed (${res.status})`);
        setUploading(false);
        e.target.value = '';
        return;
      }

      if (data.success && data.asset?.path) {
        onSelect(data.asset.path);
        onClose();
      } else {
        setError('Upload returned invalid response');
      }
    } catch (err: any) {
      setError(err.message || 'Network error during upload');
    }
    setUploading(false);
    e.target.value = '';
  }

  const accept =
    filterType === 'image' ? 'image/*' :
    filterType === 'video' ? 'video/*' :
    'image/*,video/*';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1B3A4C]/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
        <div className="p-6 border-b border-[#E3E8ED] flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-[#1B3A4C]">Upload Media</h2>
          <button onClick={onClose} className="text-[#8FA8BE] hover:text-[#1B3A4C] transition-colors">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-4">
          {preview ? (
            <div className="w-full aspect-video bg-[#0A0A0A] rounded-xl overflow-hidden flex items-center justify-center">
              {fileType.startsWith('video/') ? (
                <video src={preview} className="w-full h-full object-cover" controls preload="metadata" />
              ) : (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              )}
            </div>
          ) : (
            <div className="w-full aspect-video bg-[#E3E8ED] rounded-xl flex flex-col items-center justify-center gap-2">
              <UploadIcon className="w-10 h-10 text-[#8FA8BE]" />
              <p className="text-sm text-[#8FA8BE]">Choose a file to upload</p>
            </div>
          )}

          <label className={`w-full text-center inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors ${
            uploading
              ? 'bg-[#6B8FAB] text-white'
              : 'bg-[#1B3A4C] text-white hover:bg-[#2a4f66]'
          }`}>
            {uploading ? 'Uploading...' : 'Choose File'}
            <input
              type="file"
              className="hidden"
              onChange={handleFile}
              disabled={uploading}
              accept={accept}
            />
          </label>

          {error && (
            <div className="w-full px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm text-red-600 font-medium">Upload failed</p>
              <p className="text-xs text-red-500 mt-1">{error}</p>
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

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
