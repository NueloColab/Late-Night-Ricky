'use client';

import { useState } from 'react';

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  filterType?: 'image' | 'video' | 'all';
}

/** Compress images client-side to stay under Cloudinary's 10MB limit */
async function compressImage(file: File, maxSizeMB: number = 9): Promise<File> {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size <= maxSizeBytes) return file;
  if (!file.type.startsWith('image/')) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Step-down: try progressively smaller sizes until under limit
      const tryScale = (scale: number) => {
        const width = Math.floor(img.width * scale);
        const height = Math.floor(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Try quality 0.85 first, then 0.6, then 0.4
        const qualities = [0.85, 0.6, 0.4];
        let qIndex = 0;

        const tryQuality = () => {
          const q = qualities[qIndex];
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                if (qIndex < qualities.length - 1) {
                  qIndex++;
                  tryQuality();
                } else if (scale > 0.25) {
                  // Scale down more and try again
                  tryScale(scale * 0.7);
                } else {
                  reject(new Error('Could not compress image under size limit'));
                }
                return;
              }
              if (blob.size <= maxSizeBytes) {
                resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                return;
              }
              if (qIndex < qualities.length - 1) {
                qIndex++;
                tryQuality();
              } else if (scale > 0.25) {
                tryScale(scale * 0.7);
              } else {
                // Last resort: use the smallest blob we got
                resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
              }
            },
            'image/jpeg',
            q
          );
        };

        tryQuality();
      };

      // Start with a scale that should keep most images under 10MB
      // A 4000x3000 image at 0.5 scale = 2000x1500, which at 0.85 quality is usually ~2-4MB
      const startScale = Math.min(1, 1800 / Math.max(img.width, img.height));
      tryScale(startScale);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = url;
  });
}

export default function MediaPicker({ open, onClose, onSelect, filterType = 'all' }: MediaPickerProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isVideo, setIsVideo] = useState(false);

  if (!open) return null;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setPreview(URL.createObjectURL(file));
    setIsVideo(file.type.startsWith('video/'));
    setUploading(true);

    try {
      // Compress images client-side to stay under Cloudinary 10MB limit
      let uploadFile = file;
      const MAX_CLOUDINARY_MB = 10;
      const MAX_BYTES = MAX_CLOUDINARY_MB * 1024 * 1024;

      if (file.size > MAX_BYTES) {
        if (file.type.startsWith('image/')) {
          uploadFile = await compressImage(file, 9.5);
        } else {
          setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is ${MAX_CLOUDINARY_MB}MB. Please use a smaller file.`);
          setUploading(false);
          e.target.value = '';
          return;
        }
      }

      // Step 1: Get upload signature from our API
      const sigRes = await fetch('/api/upload-signature?' + new URLSearchParams({
        filename: uploadFile.name,
      }));
      const sigData = await sigRes.json();

      if (!sigRes.ok || sigData.error) {
        setError(sigData.error || 'Failed to get upload signature');
        setUploading(false);
        e.target.value = '';
        return;
      }

      // Step 2: Upload directly to Cloudinary using signed upload
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`;
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('api_key', sigData.apiKey);
      formData.append('timestamp', sigData.timestamp);
      formData.append('signature', sigData.signature);
      formData.append('public_id', sigData.publicId);
      formData.append('folder', sigData.folder);
      formData.append('overwrite', 'true');

      const uploadRes = await fetch(cloudinaryUrl, { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || uploadData.error) {
        setError(uploadData.error?.message || 'Upload to Cloudinary failed');
        setUploading(false);
        e.target.value = '';
        return;
      }

      // Step 3: Save the asset to our database
      const saveRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: uploadData.secure_url,
          filename: sigData.publicId,
          originalName: file.name,
          type: uploadFile.type.startsWith('image/') ? 'image' : uploadFile.type.startsWith('video/') ? 'video' : uploadFile.type.startsWith('audio/') ? 'audio' : 'document',
          size: uploadFile.size,
        }),
      });

      const saveData = await saveRes.json();

      if (!saveRes.ok || saveData.error) {
        setError(saveData.error || 'Failed to save asset');
        setUploading(false);
        e.target.value = '';
        return;
      }

      if (saveData.success && saveData.asset?.path) {
        onSelect(saveData.asset.path);
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
    'image/*,video/*,audio/*';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#152a47]/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
        <div className="p-6 border-b border-[#0d1f3d] flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-[#152a47]">Upload Media</h2>
          <button onClick={onClose} className="text-[#C5E5F8] hover:text-[#152a47] transition-colors">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-4">
          {preview ? (
            <div className="w-full aspect-video bg-[#0A0A0A] rounded-xl overflow-hidden flex items-center justify-center">
              {isVideo ? (
                <video src={preview} className="w-full h-full object-cover" controls preload="metadata" />
              ) : (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              )}
            </div>
          ) : (
            <div className="w-full aspect-video bg-[#0d1f3d] rounded-xl flex flex-col items-center justify-center gap-2">
              <UploadIcon className="w-10 h-10 text-[#C5E5F8]" />
              <p className="text-sm text-[#C5E5F8]">Choose a file to upload</p>
              <p className="text-xs text-[#C5E5F8]">Images, video, and audio supported</p>
            </div>
          )}

          <label className={`w-full text-center inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors ${
            uploading
              ? 'bg-[#A8D5F0] text-white'
              : 'bg-[#152a47] text-white hover:bg-[#2a4f66]'
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
              <p className="text-xs text-gray-500 mt-2">Maximum file size: 10MB. Supported formats: JPG, PNG, GIF, WebP, MP3, MP4, WAV.</p>
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