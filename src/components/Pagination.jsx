import { toUrduNumber } from '../utils/format.js';

export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="rounded border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-gray-50"
      >
        پچھلا
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`rounded px-3 py-1.5 text-sm ${
            p === page ? 'bg-brand text-white' : 'border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {toUrduNumber(p)}
        </button>
      ))}
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="rounded border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-gray-50"
      >
        اگلا
      </button>
    </div>
  );
}
