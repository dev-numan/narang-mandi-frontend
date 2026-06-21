import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';
import { categoriesApi } from '../api/index.js';

export default function CategoryNav() {
  const [open, setOpen] = useState(false);
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });

  const items = [
    { to: '/', label: 'صفحۂ اول', end: true },
    ...categories.map((c) => ({ to: `/category/${c.slug}`, label: c.name, key: c._id })),
  ];

  const linkClass = ({ isActive }) =>
    `block rounded px-3 py-2 transition hover:bg-gray-100 ${
      isActive ? 'font-bold text-brand' : 'text-ink'
    }`;

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        {/* Mobile: hamburger toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="مینو"
          aria-expanded={open}
          className="flex w-full items-center justify-between py-3 text-base font-bold text-ink md:hidden"
        >
          <span>زمرہ جات</span>
          <span className="text-2xl leading-none">{open ? '✕' : '☰'}</span>
        </button>

        {/* Mobile: collapsible vertical menu */}
        {open && (
          <ul className="flex flex-col gap-1 pb-3 text-base md:hidden">
            {items.map((it) => (
              <li key={it.key || it.to}>
                <NavLink to={it.to} end={it.end} onClick={() => setOpen(false)} className={linkClass}>
                  {it.label}
                </NavLink>
              </li>
            ))}
          </ul>
        )}

        {/* Desktop: horizontal scrollable row */}
        <div className="hidden overflow-x-auto md:block">
          <ul className="flex items-center gap-1 whitespace-nowrap py-1 text-base">
            {items.map((it) => (
              <li key={it.key || it.to}>
                <NavLink to={it.to} end={it.end} className={linkClass}>
                  {it.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
