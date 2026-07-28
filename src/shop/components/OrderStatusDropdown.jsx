import { useEffect, useRef, useState } from 'react';

export const ORDER_STATUS_KEYS = ['pending', 'processing', 'fulfilled', 'cancelled'];

export const ORDER_STATUS_CLS = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  fulfilled: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_DOT = {
  pending: 'bg-yellow-500',
  processing: 'bg-blue-500',
  fulfilled: 'bg-green-600',
  cancelled: 'bg-red-500',
};

export function orderStatusLabel(t, key) {
  if (key === 'fulfilled') return t('fulfilled');
  if (key === 'processing') return t('processing');
  if (key === 'cancelled') return t('cancelled');
  return t('pending');
}

export default function OrderStatusDropdown({ value, disabled, onChange, t, textClass }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

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
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`${textClass} typo-shop-dropdown inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-medium text-ink shadow-sm transition hover:border-brand hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <span className={`h-2 w-2 rounded-full ${STATUS_DOT[value] || STATUS_DOT.pending}`} />
        {t('changeStatus')}
        <svg
          className={`h-3.5 w-3.5 text-gray-400 transition ${open ? 'rotate-180' : ''}`}
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
          aria-label={t('changeStatus')}
          className="absolute right-0 z-20 mt-1.5 min-w-[11rem] overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
        >
          {ORDER_STATUS_KEYS.map((key) => {
            const selected = key === value;
            return (
              <li key={key} role="option" aria-selected={selected}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setOpen(false);
                    if (key !== value) onChange(key);
                  }}
                  className={`${textClass} typo-shop-dropdown flex w-full items-center gap-2.5 px-3 py-2 text-left transition ${
                    selected ? 'bg-brand/10 font-semibold text-brand' : 'text-ink hover:bg-gray-50'
                  }`}
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[key]}`} />
                  <span className="flex-1">{orderStatusLabel(t, key)}</span>
                  {selected && (
                    <svg className="h-4 w-4 text-brand" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
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
