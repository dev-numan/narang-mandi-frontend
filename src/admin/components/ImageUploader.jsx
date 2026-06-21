import { useState, useRef } from 'react';
import { uploadApi } from '../../api/index.js';

export default function ImageUploader({ value, onChange, label = 'Cover image', hint }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const url = await uploadApi.image(file);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="mb-2 text-xs text-gray-400">{hint}</p>}
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex h-28 w-44 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
          {value ? (
            <img src={value} alt="preview" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-gray-400">No image</span>
          )}
        </div>
        <div className="min-w-0 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="block text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:text-white hover:file:bg-brand-dark"
          />
          {uploading && <p className="text-sm text-brand">Uploading…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-sm text-red-600 hover:underline"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
