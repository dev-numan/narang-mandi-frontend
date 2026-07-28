import { useEffect, useRef, useState } from 'react';

/**
 * Custom dropdown (not native <select>).
 * options: [{ value, label }]
 */
export default function CustomSelect({
  value = '',
  options = [],
  onChange,
  placeholder = 'Select…',
  disabled = false,
  dir = 'ltr',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  optionClassName = '',
  labelClassName = '',
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = options.find((o) => String(o.value) === String(value));

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`} dir={dir}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none transition hover:border-brand focus:border-brand disabled:cursor-not-allowed disabled:opacity-50 ${
          dir === 'rtl' ? 'text-right' : 'text-left'
        } ${buttonClassName}`}
      >
        <span
          className={`min-w-0 flex-1 truncate ${selected ? 'text-ink' : 'text-gray-400'} ${labelClassName}`}
          dir={selected ? 'auto' : undefined}
        >
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-gray-400 transition ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className={`absolute left-0 right-0 z-30 mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg ${menuClassName}`}
        >
          {options.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <li key={String(opt.value)} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setOpen(false);
                    onChange?.(opt.value);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2.5 transition ${
                    dir === 'rtl' ? 'text-right' : 'text-left'
                  } ${isSelected ? 'bg-brand/10 font-semibold text-brand' : 'text-ink hover:bg-gray-50'} ${optionClassName}`}
                >
                  <span className={`min-w-0 flex-1 truncate ${labelClassName}`} dir="auto">
                    {opt.label}
                  </span>
                  {isSelected && (
                    <svg className="h-4 w-4 shrink-0 text-brand" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
