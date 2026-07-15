import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { shopsApi } from '../api/index.js';
import { SITE_NAME } from '../constants/brand.js';
import Seo from '../components/Seo.jsx';
import Loader, { EmptyState, ErrorState } from '../components/Loader.jsx';

function ShopCard({ shop }) {
  return (
    <Link
      to={`/shops/${shop.slug}`}
      className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-brand hover:shadow-md"
    >
      <div className="relative h-28 bg-gray-100">
        {shop.coverImage ? (
          <img src={shop.coverImage} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-gray-300">🏪</div>
        )}
        {shop.logo && (
          <img
            src={shop.logo}
            alt={shop.name}
            className="absolute -bottom-6 right-4 h-14 w-14 rounded-full border-2 border-white bg-white object-cover shadow"
          />
        )}
      </div>
      <div className="p-3 pt-8">
        <h3 className="urdu mb-1 line-clamp-1 font-bold text-ink">{shop.name}</h3>
        {shop.description && (
          <p className="urdu line-clamp-2 text-xs text-gray-500">{shop.description}</p>
        )}
        <div className="urdu mt-2 flex items-center justify-between text-xs text-gray-400">
          <span>{shop.productCount || 0} پروڈکٹس</span>
          {shop.address && <span className="line-clamp-1">📍 {shop.address}</span>}
        </div>
      </div>
    </Link>
  );
}

export default function ShopsPage() {
  const [search, setSearch] = useState('');

  const { data: shops = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['shops', search],
    queryFn: () => shopsApi.list({ ...(search ? { search } : {}) }),
  });

  return (
    <>
      <Seo
        title={`دکانیں — ${SITE_NAME}`}
        socialTitle="نارنگ منڈی کی دکانیں"
        description="نارنگ منڈی کی مقامی دکانیں — آن لائن خریداری اور ڈیلیوری۔"
        path="/shops"
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b-2 border-brand pb-3">
        <div>
          <h1 className="urdu text-3xl font-bold text-ink">دکانیں</h1>
          <p className="urdu mt-1 text-sm text-gray-500">اپنی پسندیدہ دکان منتخب کریں اور آرڈر کریں</p>
        </div>
        <Link
          to="/orders/track"
          className="urdu rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          آرڈر ٹریک کریں
        </Link>
      </div>

      <div className="mb-5">
        <input
          dir="rtl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 دکان تلاش کریں…"
          className="urdu w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-brand"
        />
      </div>

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : shops.length === 0 ? (
        <EmptyState label="ابھی کوئی دکان دستیاب نہیں" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => (
            <ShopCard key={shop._id} shop={shop} />
          ))}
        </div>
      )}
    </>
  );
}
