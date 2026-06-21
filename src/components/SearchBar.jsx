import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar({ onSubmit, autoFocus = false }) {
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    navigate(`/search?q=${encodeURIComponent(term)}`);
    if (onSubmit) onSubmit(term); // optional after-callback (e.g. close panel)
  };

  return (
    <form onSubmit={submit} className="flex w-full items-center gap-2">
      <input
        type="search"
        value={q}
        autoFocus={autoFocus}
        onChange={(e) => setQ(e.target.value)}
        placeholder="خبریں تلاش کریں..."
        className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-right outline-none focus:border-brand"
      />
      <button
        type="submit"
        className="flex-shrink-0 rounded-full bg-brand px-4 py-2 text-sm text-white hover:bg-brand-dark"
      >
        تلاش
      </button>
    </form>
  );
}
