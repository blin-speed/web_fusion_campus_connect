import React, { useState } from 'react';
import { uploadPhoto } from '../api/client';

export default function PhotoUploader({ purpose = 'LISTING', onUpload, maxPhotos = 4 }) {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    if (photos.length >= maxPhotos) return;
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file must be less than 5MB');
      return;
    }

    setError('');
    setUploading(true);
    try {
      const result = await uploadPhoto(file, purpose);
      const newPhotos = [...photos, result];
      setPhotos(newPhotos);
      if (onUpload) onUpload(newPhotos.map((p) => p.id));
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const removePhoto = (id) => {
    const newPhotos = photos.filter((p) => p.id !== id);
    setPhotos(newPhotos);
    if (onUpload) onUpload(newPhotos.map((p) => p.id));
  };

  return (
    <div className="flex flex-col gap-2 text-xs">
      {error && (
        <div className="border border-red-600 bg-red-50 dark:bg-red-950/40 p-2 text-red-600 dark:text-red-400 font-medium">
          Alert: {error}
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        {photos.map((p) => (
          <div key={p.id} className="relative w-24 h-24 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
            <img src={`/api/v1/files/${p.id}`} alt="Resource photo" className="object-cover w-full h-full" />
            <button
              type="button"
              onClick={() => removePhoto(p.id)}
              className="absolute top-0 right-0 bg-neutral-900 text-white text-xs px-1.5 py-0.5 hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        ))}
        {photos.length < maxPhotos && (
          <label className="w-24 h-24 border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-center justify-center cursor-pointer text-neutral-500 hover:border-orange-600 hover:text-orange-600 transition-colors bg-neutral-50 dark:bg-neutral-950">
            {uploading ? (
              <span className="font-semibold uppercase text-[10px] tracking-wider animate-pulse">Uploading...</span>
            ) : (
              <span className="font-semibold uppercase text-[10px] tracking-wider">+ Add Photo</span>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        )}
      </div>
      <span className="text-[11px] text-neutral-400">
        Max {maxPhotos} photos (JPG, PNG, WEBP &lt; 5MB)
      </span>
    </div>
  );
}
