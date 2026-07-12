import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { classifiedsApi } from '../api/index.js';
import { SITE_NAME } from '../constants/brand.js';
import { formatPrice, timeAgoUrdu } from '../utils/format.js';
import Loader from '../components/Loader.jsx';
import SoldStampOverlay from '../components/SoldStampOverlay.jsx';

export default function ClassifiedPage() {
  const { slug } = useParams();
  const [active, setActive] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['classified', slug],
    queryFn: () => classifiedsApi.get(slug),
  });

  if (isLoading) return <Loader />;
  if (isError || !data) {
    return (
      <div className="rounded-xl bg-white py-16 text-center text-gray-400 shadow-sm">
        <p className="urdu">یہ اشتہار موجود نہیں</p>
        <Link to="/classifieds" className="urdu mt-2 inline-block text-brand hover:underline">
          ← تمام اشتہارات
        </Link>
      </div>
    );
  }

  const item = data;
  const images = item.images?.length ? item.images : [];
  const waNumber = (item.phone || '').replace(/[^\d]/g, '').replace(/^0/, '92');

  return (
    <>
      <Helmet>
        <title>{SITE_NAME} | {item.title} — اشتہارات</title>
        <meta property="og:site_name" content={SITE_NAME} />
      </Helmet>

      <div className="mb-3">
        <Link to="/classifieds" className="urdu text-sm text-brand hover:underline">← تمام اشتہارات</Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* gallery */}
        <div>
          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
            {images.length ? (
              <img src={images[active]} alt={item.title} className="h-80 w-full object-contain" />
            ) : (
              <div className="urdu flex h-80 items-center justify-center text-5xl text-gray-300">
                {item.category?.icon || '🏷️'}
              </div>
            )}
            {item.isSold && <SoldStampOverlay />}
          </div>
          {images.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {images.map((url, i) => (
                <button
                  key={url + i}
                  onClick={() => setActive(i)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${i === active ? 'border-brand' : 'border-transparent'}`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  {item.isSold && <SoldStampOverlay />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* details */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            {item.category && (
              <span className="urdu rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">
                {item.category.icon} {item.category.name}
              </span>
            )}
            <span className="urdu text-xs text-gray-400">{timeAgoUrdu(item.createdAt)}</span>
          </div>

          <h1 className="urdu mb-2 text-2xl font-bold text-ink">{item.title}</h1>

          <div className="mb-4">
            {item.price != null ? (
              <span className="text-2xl font-bold text-brand">
                {formatPrice(item.price)}
                {item.negotiable && <span className="urdu mr-2 text-sm font-normal text-gray-400">قابلِ گفتگو</span>}
              </span>
            ) : (
              <span className="urdu text-gray-500">قیمت کے لیے رابطہ کریں</span>
            )}
          </div>

          {item.location && <p className="urdu mb-3 text-sm text-gray-600">📍 {item.location}</p>}

          {item.description && (
            <p className="urdu mb-4 whitespace-pre-wrap leading-relaxed text-gray-700">{item.description}</p>
          )}

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="urdu mb-2 text-sm font-bold text-ink">رابطہ</h2>
            {item.isSold ? (
              <p className="urdu text-sm text-gray-500">یہ چیز فروخت ہو چکی ہے — رابطے کی تفصیلات دستیاب نہیں۔</p>
            ) : (
              <>
                {item.contactName && <p className="urdu mb-2 text-sm text-gray-600">{item.contactName}</p>}
                {item.phone && (
                  <div className="flex flex-wrap gap-2">
                    <a href={`tel:${item.phone}`} dir="ltr" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
                      📞 {item.phone}
                    </a>
                    {waNumber && (
                      <a
                        href={`https://wa.me/${waNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
