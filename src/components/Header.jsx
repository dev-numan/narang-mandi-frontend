import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../api/index.js';
import { SITE_NAME, SITE_NAME_URDU } from '../constants/brand.js';
import SearchBar from './SearchBar.jsx';
import WeatherWidget from './WeatherWidget.jsx';

function SocialIcons({ links }) {
  if (!links) return null;
  const items = [
    ['facebook', 'فیس بک', links.facebook],
    ['youtube', 'یوٹیوب', links.youtube],
    ['twitter', 'ٹوئٹر', links.twitter],
    ['whatsapp', 'واٹس ایپ', links.whatsapp],
  ].filter(([, , url]) => url);
  return (
    <div className="hidden items-center gap-3 text-sm text-gray-500 md:flex">
      {items.map(([key, label, url]) => (
        <a key={key} href={url} target="_blank" rel="noreferrer" className="hover:text-brand">
          {label}
        </a>
      ))}
    </div>
  );
}

export default function Header() {
  const [showSearch, setShowSearch] = useState(false);
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get });
  const tagline = settings?.tagline || `${SITE_NAME_URDU} — آپ کے شہر کی تازہ ترین خبریں`;

  const today = new Date().toLocaleDateString('ur-PK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:py-4">
        <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          {settings?.logo ? (
            <img src={settings.logo} alt={SITE_NAME} className="h-10 w-auto flex-shrink-0 sm:h-12" />
          ) : (
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand text-lg font-bold leading-none text-white sm:h-12 sm:w-12 sm:text-xl">
              ن
            </span>
          )}
          <div className="min-w-0">
            <h1 className="whitespace-nowrap pb-1 text-lg font-bold leading-[1.9] text-brand sm:text-2xl">{SITE_NAME}</h1>
            <p className="mt-1 truncate pb-1 text-xs leading-[1.9] text-gray-500">{tagline}</p>
          </div>
        </Link>

        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4">
          <WeatherWidget variant="compact" />
          <SocialIcons links={settings?.socialLinks} />
          <span className="hidden text-xs text-gray-400 lg:block">{today}</span>
          <button
            onClick={() => setShowSearch((s) => !s)}
            aria-label="تلاش"
            className="flex-shrink-0 whitespace-nowrap rounded-full border border-gray-300 px-5 py-2 text-sm hover:bg-gray-50 sm:px-6"
          >
            🔍 تلاش
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="border-t border-gray-100 bg-gray-50 py-3">
          <div className="mx-auto max-w-3xl px-4">
            <SearchBar autoFocus onSubmit={() => setShowSearch(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
