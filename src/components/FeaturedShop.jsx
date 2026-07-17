import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { shopsApi } from '../api/index.js';

// Highlights a featured shop on the home page. Defaults to a chosen slug, and
// falls back to the first active shop so it keeps working as shops are added.
const FEATURED_SLUG = 'hafeez-zarai-markaz';

export default function FeaturedShop() {
  const { data: shops = [], isLoading } = useQuery({
    queryKey: ['shops', 'home-featured'],
    queryFn: () => shopsApi.list(),
  });

  if (isLoading || !shops.length) return null;
  // Prefer the shop the admin marked as featured; fall back to a default slug, then the first shop.
  const shop = shops.find((s) => s.isFeatured) || shops.find((s) => s.slug === FEATURED_SLUG) || shops[0];

  return (
    <section className="mb-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="urdu text-xl font-bold text-ink">
          <span className="border-b-4 border-brand pb-1">نمایاں دکان</span>
        </h2>
        <Link to="/shops" className="urdu text-sm font-semibold text-brand hover:underline">
          تمام دکانیں ←
        </Link>
      </div>

      <Link
        to={`/shops/${shop.slug}`}
        className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-brand hover:shadow-lg"
      >
        <div className="relative h-40 bg-gray-100 sm:h-56">
          {shop.coverImage ? (
            <img
              src={shop.coverImage}
              alt={shop.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl text-gray-300">🏪</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <span className="urdu absolute right-3 top-3 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white shadow">
            ⭐ نمایاں دکان
          </span>
          <div className="absolute inset-x-3 bottom-3 flex items-end gap-3">
            {shop.logo && (
              <img
                src={shop.logo}
                alt={shop.name}
                className="h-16 w-16 shrink-0 rounded-xl border-2 border-white object-cover shadow-lg sm:h-20 sm:w-20"
              />
            )}
            <div className="min-w-0 pb-1">
              <h3 className="urdu text-xl font-bold text-white drop-shadow sm:text-2xl">{shop.name}</h3>
              <p className="urdu text-sm text-white/85">{shop.productCount || 0} پروڈکٹس دستیاب</p>
            </div>
          </div>
        </div>

        {shop.description && (
          <p className="urdu line-clamp-2 px-4 pt-4 text-sm leading-relaxed text-gray-600">
            {shop.description}
          </p>
        )}
        <div className="flex items-center justify-between gap-3 p-4">
          <span className="urdu line-clamp-1 text-sm text-gray-500">
            {shop.address ? `📍 ${shop.address}` : 'نارنگ منڈی'}
          </span>
          <span className="urdu shrink-0 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-brand-dark">
            دکان دیکھیں ←
          </span>
        </div>
      </Link>
    </section>
  );
}
