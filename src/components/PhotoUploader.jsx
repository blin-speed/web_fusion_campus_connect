import React, { useState } from 'react';
import { uploadPhoto } from '../api/client';

export default function PhotoUploader({ purpose, onUpload, maxPhotos = 3 }) {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    if (photos.length >= maxPhotos) return;
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File must be smaller than 5MB');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadPhoto(file, purpose);
      const newPhotos = [...photos, result];
      setPhotos(newPhotos);
      onUpload(newPhotos.map(p => p.id));
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = null; // reset
    }
  };

  const removePhoto = (id) => {
    const newPhotos = photos.filter(p => p.id !== id);
    setPhotos(newPhotos);
    onUpload(newPhotos.map(p => p.id));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {photos.map(p => (
          <div key={p.id} className="relative w-24 h-24 border rounded overflow-hidden">
            <img src={`/api/v1/files/${p.id}`} alt="uploaded" className="object-cover w-full h-full" />
            <button
              type="button"
              onClick={() => removePhoto(p.id)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
            >
              x
            </button>
          </div>
        ))}
        {photos.length < maxPhotos && (
          <label className="w-24 h-24 border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:bg-slate-50">
            {uploading ? <span className="animate-pulse">...</span> : <span>+ Add</span>}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} disabled={uploading} />
          </label>
        )}
      </div>
    </div>
  );
}
