import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { articlesApi, categoriesApi } from '../api/index.js';
import { toUrduNumber } from '../utils/format.js';
import WeatherWidget from './WeatherWidget.jsx';

export default function Sidebar() {
  const { data: trending = [] } = useQuery({
    queryKey: ['trending'],
    queryFn: articlesApi.trending,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });

  return (
    <aside className="space-y-6">
      <WeatherWidget />

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="typo-sidebar-heading mb-3 border-b-2 border-brand pb-2 font-bold text-ink">
          مقبول خبریں
        </h3>
        <ol className="space-y-3">
          {trending.map((a, i) => (
            <li key={a._id} className="flex gap-3">
              <span className="typo-sidebar-item flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand/10 font-bold text-brand">
                {toUrduNumber(i + 1)}
              </span>
              <Link
                to={`/article/${a.slug}`}
                className="typo-sidebar-item clamp-2 font-semibold leading-loose text-ink hover:text-brand"
              >
                {a.title}
              </Link>
            </li>
          ))}
          {trending.length === 0 && (
            <li className="typo-sidebar-item text-gray-400">کوئی خبر نہیں</li>
          )}
        </ol>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="typo-sidebar-heading mb-3 border-b-2 border-brand pb-2 font-bold text-ink">
          زمرہ جات
        </h3>
        <ul className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <li key={c._id}>
              <Link
                to={`/category/${c.slug}`}
                className="typo-sidebar-item inline-block rounded-full bg-gray-100 px-3 py-1 text-ink hover:bg-brand hover:text-white"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
