import { Link } from 'react-router-dom';
import { formatUrduDate } from '../utils/format.js';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="50%" font-size="28" fill="#9ca3af" text-anchor="middle" dominant-baseline="middle" font-family="serif">Narang Mandi</text></svg>'
  );

export default function ArticleCard({ article, variant = 'default' }) {
  if (!article) return null;
  const img = article.coverImage || PLACEHOLDER;

  if (variant === 'horizontal') {
    return (
      <Link
        to={`/article/${article.slug}`}
        className="group flex gap-3 rounded-lg bg-white p-2 shadow-sm transition hover:shadow-md"
      >
        <img
          src={img}
          alt={article.title}
          loading="lazy"
          className="h-20 w-24 flex-shrink-0 rounded-md object-cover"
        />
        <div className="min-w-0">
          <h3 className="clamp-2 text-base font-semibold leading-loose text-ink group-hover:text-brand">
            {article.title}
          </h3>
          <p className="mt-1 text-xs text-gray-500">{formatUrduDate(article.publishedAt)}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/article/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={img}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-3">
        {article.category?.name && (
          <span className="mb-1 text-xs font-semibold text-brand">{article.category.name}</span>
        )}
        <h3 className="clamp-2 text-lg font-bold leading-loose text-ink group-hover:text-brand">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="clamp-2 mt-1 text-sm leading-loose text-gray-600">{article.excerpt}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-gray-400">
          <span>{formatUrduDate(article.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
