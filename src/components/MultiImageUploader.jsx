import { useState, useRef, useEffect, useCallback } from 'react';

// Multi-image uploader. Uploads each picked file via `uploadFn(file) => Promise<url>`
// and stores an array of URLs. Supports click-to-pick and Ctrl+V / Cmd+V paste.
export default function MultiImageUploader({
  value = [],
  onChange,
  uploadFn,
  max = 5,
  label = 'تصاویر',
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [pasteHint, setPasteHint] = useState(false);
  const inputRef = useRef(null);
  const zoneRef = useRef(null);
  const valueRef = useRef(value);
  const uploadingRef = useRef(uploading);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  useEffect(() => {
    uploadingRef.current = uploading;
  }, [uploading]);

  const uploadFiles = useCallback(
    async (fileList) => {
      const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
      if (!files.length) return;
      if (uploadingRef.current) return;

      setError('');
      const current = valueRef.current;
      const room = max - current.length;
      if (room <= 0) {
        setError(`زیادہ سے زیادہ ${max} تصاویر`);
        return;
      }

      setUploading(true);
      try {
        const urls = [];
        for (const file of files.slice(0, room)) {
          // eslint-disable-next-line no-await-in-loop
          urls.push(await uploadFn(file));
        }
        onChange([...current, ...urls]);
      } catch (err) {
        setError(err.message || 'Upload failed');
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [max, onChange, uploadFn],
  );

  const handleFiles = (e) => {
    uploadFiles(e.target.files);
  };

  // Ctrl+V / Cmd+V — if clipboard has images, upload them (plain text paste into inputs is unchanged).
  useEffect(() => {
    const onPaste = (e) => {
      const files = e.clipboardData?.files;
      if (!files?.length) return;
      const images = Array.from(files).filter((f) => f.type.startsWith('image/'));
      if (!images.length) return;
      e.preventDefault();
      uploadFiles(images);
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [uploadFiles]);

  const removeAt = (i) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div
      ref={zoneRef}
      tabIndex={0}
      onFocus={() => setPasteHint(true)}
      onBlur={() => setPasteHint(false)}
      onClick={() => zoneRef.current?.focus()}
      className="rounded-lg outline-none focus-within:ring-2 focus-within:ring-brand/30"
    >
      {label && <label className="urdu mb-1 block text-sm font-medium text-gray-700">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {value.map((url, i) => (
          <div key={url + i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeAt(i);
              }}
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
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
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
      <p className="urdu mt-1 text-xs text-gray-400">
        {value.length}/{max} تصاویر
        <span className="mx-1 text-gray-300">·</span>
        <span className={pasteHint ? 'text-brand' : ''}>Ctrl+V سے پیسٹ کریں</span>
      </p>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
