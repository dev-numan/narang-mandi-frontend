import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';
import { categoriesApi } from '../api/index.js';

// How many links to show inline on desktop before collapsing the rest into a
// "مزید" (More) dropdown. Keeps the bar on one tidy row instead of scrolling.
const VISIBLE_COUNT = 7;

export default function CategoryNav() {
  const [open, setOpen] = useState(false); // mobile hamburger menu
  const [moreOpen, setMoreOpen] = useState(false); // desktop "more" dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });

  const items = [
    { to: '/', label: 'صفحۂ اول', end: true },
    { to: '/places', label: 'مشہور مقامات' },
    { to: '/community', label: 'کمیونٹی چیٹ' },
    { to: '/trains', label: 'ٹرین اوقات' },
    { to: '/classifieds', label: 'اشتہارات' },
    ...categories.map((c) => ({ to: `/category/${c.slug}`, label: c.name, key: c._id })),
  ];

  const visibleItems = items.slice(0, VISIBLE_COUNT);
  const overflowItems = items.slice(VISIBLE_COUNT);

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

        {/* Mobile: collapsible vertical menu (shows every item) */}
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

        {/* Desktop: first N items inline, the rest under a "مزید" dropdown */}
        <div className="hidden md:block">
          <ul className="flex items-center gap-1 whitespace-nowrap py-1 text-base">
            {visibleItems.map((it) => (
              <li key={it.key || it.to}>
                <NavLink to={it.to} end={it.end} className={linkClass}>
                  {it.label}
                </NavLink>
              </li>
            ))}

            {overflowItems.length > 0 && (
              <li className="relative">
                <button
                  onClick={() => setMoreOpen((o) => !o)}
                  aria-haspopup="true"
                  aria-expanded={moreOpen}
                  className={`flex items-center gap-1 rounded px-3 py-2 transition hover:bg-gray-100 ${
                    moreOpen ? 'bg-gray-100 font-bold text-brand' : 'text-ink'
                  }`}
                >
                  <span>مزید</span>
                  <span className="text-xs leading-none">▾</span>
                </button>

                {moreOpen && (
                  <>
                    {/* Invisible backdrop so clicking anywhere closes the menu */}
                    <button
                      aria-hidden="true"
                      tabIndex={-1}
                      onClick={() => setMoreOpen(false)}
                      className="fixed inset-0 z-10 cursor-default"
                    />
                    <ul className="absolute right-0 top-full z-20 mt-1 max-h-96 w-56 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                      {overflowItems.map((it) => (
                        <li key={it.key || it.to}>
                          <NavLink
                            to={it.to}
                            end={it.end}
                            onClick={() => setMoreOpen(false)}
                            className={linkClass}
                          >
                            {it.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
