import { useState } from 'react';
import { NavLink } from 'react-router-dom';

/** Top nav — only these live features (nothing else). */
const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/places', label: 'Mashhoor Maqamat' },
  { to: '/community', label: 'Community Chat' },
  { to: '/trains', label: 'Train Auqaat' },
  { to: '/classifieds', label: 'Narang OLX' },
  { to: '/category/local', label: 'News' },
];

export default function CategoryNav() {
  const [open, setOpen] = useState(false);

  const pillClass = ({ isActive }) =>
    [
      'block rounded-full px-3.5 py-1.5 font-semibold transition-all duration-150',
      isActive
        ? 'bg-brand text-white shadow-sm hover:bg-brand-dark'
        : 'bg-gray-100 text-ink hover:bg-gray-200',
    ].join(' ');

  return (
    <nav className="border-b border-gray-200/80 bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-6xl px-4">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
          aria-expanded={open}
          className="typo-nav flex w-full items-center justify-between py-3 font-semibold text-ink md:hidden"
        >
          <span className="rounded-full bg-brand/10 px-3.5 py-1.5 text-brand">Menu</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xl leading-none text-ink">
            {open ? '✕' : '☰'}
          </span>
        </button>

        {open && (
          <ul className="typo-nav flex flex-col gap-2 pb-4 md:hidden">
            {NAV_ITEMS.map((it) => (
              <li key={it.to}>
                <NavLink
                  to={it.to}
                  end={it.end}
                  onClick={() => setOpen(false)}
                  className={pillClass}
                >
                  {it.label}
                </NavLink>
              </li>
            ))}
          </ul>
        )}

        <div className="hidden md:block">
          <ul className="typo-nav flex items-center justify-center gap-2 overflow-x-auto whitespace-nowrap py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {NAV_ITEMS.map((it) => (
              <li key={it.to}>
                <NavLink to={it.to} end={it.end} className={pillClass}>
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
