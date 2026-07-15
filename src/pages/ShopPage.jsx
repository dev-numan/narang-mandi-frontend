import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { shopsApi } from '../api/index.js';
import { SITE_NAME } from '../constants/brand.js';
import Seo from '../components/Seo.jsx';
import { formatPrice } from '../utils/format.js';
import { useCart } from '../context/CartContext.jsx';
import Loader, { EmptyState, ErrorState } from '../components/Loader.jsx';
import CartBar from '../components/CartBar.jsx';

function ProductCard({ shop, product }) {
  const { add, replaceShop } = useCart();
  const outOfStock = product.stock <= 0;

  const handleAdd = (e) => {
    e.preventDefault();
    if (outOfStock) return;
    const ok = add(shop, product, 1);
    if (!ok) {
      const move = window.confirm(
        'آپ کی ٹوکری میں کسی اور دکان کا سامان موجود ہے۔ کیا آپ اسے ہٹا کر یہ پروڈکٹ شامل کرنا چاہتے ہیں؟'
      );
      if (move) replaceShop(shop, product, 1);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-brand hover:shadow-md">
      <Link to={`/shops/${shop.slug}/product/${product.slug}`} className="block">
        <div className="relative h-40 bg-gray-100">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl text-gray-300">📦</div>
          )}
          {outOfStock && (
            <span className="urdu absolute inset-x-0 bottom-0 bg-black/60 py-1 text-center text-xs text-white">
              اسٹاک ختم
            </span>
          )}
        </div>
        <div className="p-3 pb-0">
          <h3 className="urdu mb-1 line-clamp-2 font-bold text-ink">{product.name}</h3>
          <div className="mb-1 text-sm font-bold text-brand">{formatPrice(product.price)}</div>
        </div>
      </Link>
      <div className="flex flex-1 flex-col justify-end p-3 pt-1">
        <div className="urdu mb-2 text-xs text-gray-400">
          {outOfStock ? 'دستیاب نہیں' : `اسٹاک: ${product.stock}`}
        </div>
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="urdu w-full rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
        >
          ٹوکری میں ڈالیں
        </button>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const { shopSlug } = useParams();
  const [activeCat, setActiveCat] = useState('');
  const [search, setSearch] = useState('');

  const { data: shop, isLoading: shopLoading, isError } = useQuery({
    queryKey: ['shop', shopSlug],
    queryFn: () => shopsApi.get(shopSlug),
  });

  const { data: products = [], isLoading: prodLoading } = useQuery({
    queryKey: ['shop-products', shopSlug, activeCat, search],
    queryFn: () =>
      shopsApi.products(shopSlug, {
        ...(activeCat ? { category: activeCat } : {}),
        ...(search ? { search } : {}),
      }),
    enabled: !!shop,
  });

  if (shopLoading) return <Loader />;
  if (isError || !shop) {
    return (
      <div className="rounded-xl bg-white py-16 text-center text-gray-400 shadow-sm">
        <p className="urdu">یہ دکان موجود نہیں</p>
        <Link to="/shops" className="urdu mt-2 inline-block text-brand hover:underline">
          ← تمام دکانیں
        </Link>
      </div>
    );
  }

  const categories = shop.categories || [];

  return (
    <>
      <Seo
        title={`${shop.name} — ${SITE_NAME}`}
        socialTitle={shop.name}
        description={shop.description || `${shop.name} — نارنگ منڈی کی دکان سے آن لائن خریداری کریں۔`}
        path={`/shops/${shop.slug}`}
        image={shop.coverImage || shop.logo || undefined}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Store',
          name: shop.name,
          description: shop.description || undefined,
          image: shop.logo || shop.coverImage || undefined,
          telephone: shop.phone || undefined,
          address: shop.address || undefined,
        }}
      />

      <div className="mb-3">
        <Link to="/shops" className="urdu text-sm text-brand hover:underline">← تمام دکانیں</Link>
      </div>

      {/* Shop header */}
      <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="relative h-36 bg-gray-100">
          {shop.coverImage ? (
            <img src={shop.coverImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl text-gray-300">🏪</div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4 p-4">
          {shop.logo && (
            <img src={shop.logo} alt={shop.name} className="-mt-12 h-20 w-20 rounded-full border-2 border-white bg-white object-cover shadow" />
          )}
          <div className="flex-1">
            <h1 className="urdu text-2xl font-bold text-ink">{shop.name}</h1>
            {shop.description && <p className="urdu mt-1 text-sm text-gray-500">{shop.description}</p>}
            <div className="urdu mt-1 flex flex-wrap gap-3 text-xs text-gray-400">
              {shop.address && <span>📍 {shop.address}</span>}
              {shop.phone && <a href={`tel:${shop.phone}`} dir="ltr" className="hover:text-brand">📞 {shop.phone}</a>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="mb-5">
            <input
              dir="rtl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 پروڈکٹ تلاش کریں…"
              className="urdu w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-brand"
            />
          </div>

          {prodLoading ? (
            <Loader />
          ) : products.length === 0 ? (
            <EmptyState label="اس دکان میں کوئی پروڈکٹ دستیاب نہیں" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p._id} shop={shop} product={p} />
              ))}
            </div>
          )}
        </div>

        <aside className="lg:order-first lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="urdu mb-3 border-b pb-2 text-lg font-bold text-ink">زمرہ جات</h2>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setActiveCat('')}
                  className={`urdu w-full rounded-lg px-3 py-2 text-right text-sm transition ${activeCat === '' ? 'bg-brand text-white' : 'hover:bg-gray-100'}`}
                >
                  تمام پروڈکٹس
                </button>
              </li>
              {categories.map((c) => (
                <li key={c._id}>
                  <button
                    onClick={() => setActiveCat(c.slug)}
                    className={`urdu flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${activeCat === c.slug ? 'bg-brand text-white' : 'hover:bg-gray-100'}`}
                  >
                    <span>{c.name}</span>
                    <span className={`rounded-full px-1.5 text-xs ${activeCat === c.slug ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                      {c.productCount || 0}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <CartBar />
    </>
  );
}
