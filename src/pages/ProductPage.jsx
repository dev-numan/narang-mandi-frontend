import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { shopsApi } from '../api/index.js';
import { SITE_NAME } from '../constants/brand.js';
import { formatPrice } from '../utils/format.js';
import { useCart } from '../context/CartContext.jsx';
import Loader from '../components/Loader.jsx';
import CartBar from '../components/CartBar.jsx';

export default function ProductPage() {
  const { shopSlug, productSlug } = useParams();
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const { add, replaceShop } = useCart();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', shopSlug, productSlug],
    queryFn: () => shopsApi.product(shopSlug, productSlug),
  });

  if (isLoading) return <Loader />;
  if (isError || !product) {
    return (
      <div className="rounded-xl bg-white py-16 text-center text-gray-400 shadow-sm">
        <p className="urdu">یہ پروڈکٹ موجود نہیں</p>
        <Link to={`/shops/${shopSlug}`} className="urdu mt-2 inline-block text-brand hover:underline">
          ← دکان پر واپس جائیں
        </Link>
      </div>
    );
  }

  const shop = product.shop;
  const images = product.images?.length ? product.images : [];
  const outOfStock = product.stock <= 0;

  const doAdd = (goToCart) => {
    if (outOfStock) return;
    const ok = add(shop, product, qty);
    if (!ok) {
      const move = window.confirm(
        'آپ کی ٹوکری میں کسی اور دکان کا سامان موجود ہے۔ کیا آپ اسے ہٹا کر یہ پروڈکٹ شامل کرنا چاہتے ہیں؟'
      );
      if (move) replaceShop(shop, product, qty);
      else return;
    }
    if (goToCart) navigate('/cart');
  };

  return (
    <>
      <Helmet>
        <title>{SITE_NAME} | {product.name}</title>
        <meta property="og:site_name" content={SITE_NAME} />
      </Helmet>

      <div className="mb-3">
        <Link to={`/shops/${shopSlug}`} className="urdu text-sm text-brand hover:underline">
          ← {shop?.name || 'دکان'}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* gallery */}
        <div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
            {images.length ? (
              <img src={images[active]} alt={product.name} className="h-80 w-full object-contain" />
            ) : (
              <div className="flex h-80 items-center justify-center text-6xl text-gray-300">📦</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {images.map((url, i) => (
                <button
                  key={url + i}
                  onClick={() => setActive(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${i === active ? 'border-brand' : 'border-transparent'}`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* details */}
        <div>
          {product.category && (
            <span className="urdu mb-2 inline-block rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">
              {product.category.name}
            </span>
          )}
          <h1 className="urdu mb-2 text-2xl font-bold text-ink">{product.name}</h1>
          <div className="mb-3 text-2xl font-bold text-brand">{formatPrice(product.price)}</div>

          <p className={`urdu mb-4 text-sm ${outOfStock ? 'text-red-600' : 'text-gray-500'}`}>
            {outOfStock ? 'اسٹاک ختم ہو گیا ہے' : `اسٹاک میں دستیاب: ${product.stock}`}
          </p>

          {product.description && (
            <p className="urdu mb-4 whitespace-pre-wrap leading-relaxed text-gray-700">{product.description}</p>
          )}

          {!outOfStock && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="urdu text-sm text-gray-600">تعداد:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="h-8 w-8 rounded-lg border border-gray-300 text-lg font-bold hover:bg-gray-50"
                  >
                    −
                  </button>
                  <span dir="ltr" className="w-10 text-center font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    className="h-8 w-8 rounded-lg border border-gray-300 text-lg font-bold hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => doAdd(false)}
                  className="urdu flex-1 rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand/10"
                >
                  ٹوکری میں ڈالیں
                </button>
                <button
                  onClick={() => doAdd(true)}
                  className="urdu flex-1 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  ابھی آرڈر کریں
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CartBar />
    </>
  );
}
