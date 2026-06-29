import { useState, useRef } from 'react';

// Multi-image uploader. Uploads each picked file via `uploadFn(file) => Promise<url>`
// and stores an array of URLs. Used by the public ad form and the admin editor.
export default function MultiImageUploader({
  value = [],
  onChange,
  uploadFn,
  max = 5,
  label = 'تصاویر',
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setError('');
    const room = max - value.length;
    if (room <= 0) {
      setError(`زیادہ سے زیادہ ${max} تصاویر`);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setUploading(true);
    try {
      const urls = [];
      for (const file of files.slice(0, room)) {
        // eslint-disable-next-line no-await-in-loop
        urls.push(await uploadFn(file));
      }
      onChange([...value, ...urls]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAt = (i) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div>
      {label && <label className="urdu mb-1 block text-sm font-medium text-gray-700">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {value.map((url, i) => (
          <div key={url + i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-black/60 text-xs text-white hover:bg-red-600"
              aria-label="remove"
            >
              ✕
            </button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:border-brand hover:text-brand disabled:opacity-60"
          >
            {uploading ? (
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-90" fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6V2z" />
              </svg>
            ) : (
              <>
                <span className="text-xl leading-none">+</span>
                <span className="text-[10px]">تصویر</span>
              </>
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />
      <p className="urdu mt-1 text-xs text-gray-400">{value.length}/{max} تصاویر</p>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
