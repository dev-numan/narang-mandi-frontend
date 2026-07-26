import { useQuery } from '@tanstack/react-query';
import { trainsApi } from '../api/index.js';
import { FEATURES, featureSeoTitle } from '../constants/features.js';
import Seo from '../components/Seo.jsx';
import { toAmPm } from '../utils/format.js';
import Loader, { EmptyState } from '../components/Loader.jsx';

function DirectionBlock({ label, route, number, arrival, departure }) {
  return (
    <div className="flex-1 rounded-lg bg-gray-50 p-3">
      <div className="urdu mb-2 flex items-center justify-between">
        <span className="typo-train-direction font-bold text-ink">{label}</span>
        {number && (
          <span className="typo-train-badge rounded bg-gray-200 px-1.5 py-0.5 text-gray-600">
            {number}
          </span>
        )}
      </div>
      {route && <p className="urdu typo-train-route mb-2 text-gray-500">{route}</p>}
      <div className="flex gap-2">
        <div className="flex-1 rounded-md bg-white p-2 text-center shadow-sm">
          <div className="urdu typo-train-time-label text-gray-400">آمد</div>
          <div className="typo-train-time font-bold text-ink" dir="ltr">
            {arrival ? toAmPm(arrival) : '—'}
          </div>
        </div>
        <div className="flex-1 rounded-md bg-white p-2 text-center shadow-sm">
          <div className="urdu typo-train-time-label text-gray-400">روانگی</div>
          <div className="typo-train-time font-bold text-brand" dir="ltr">
            {departure ? toAmPm(departure) : '—'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrainsPage() {
  const { data: trains = [], isLoading } = useQuery({
    queryKey: ['trains'],
    queryFn: () => trainsApi.list(),
  });

  return (
    <>
      <Seo
        title={featureSeoTitle(FEATURES.trains)}
        description={FEATURES.trains.description}
        path="/trains"
      />

      <div className="mb-6 border-b-2 border-brand pb-3">
        <h1 className="typo-train-page-title font-bold text-ink" dir="ltr">
          🚆 {FEATURES.trains.title}
        </h1>
        <p className="urdu typo-train-page-desc mt-1 text-gray-500">{FEATURES.trains.description}</p>
      </div>

      {isLoading ? (
        <Loader />
      ) : trains.length === 0 ? (
        <EmptyState label="ٹرین کے اوقات دستیاب نہیں" />
      ) : (
        <div className="space-y-4">
          {trains.map((t) => (
            <div key={t._id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
                <div>
                  <h2 className="urdu typo-train-name font-bold text-ink">{t.name}</h2>
                  {t.nameEn && (
                    <p className="typo-train-name-en text-gray-400" dir="ltr">
                      {t.nameEn}
                    </p>
                  )}
                </div>
                <div className="urdu flex items-center gap-2">
                  {t.trainType && (
                    <span className="typo-train-badge rounded-full bg-brand/10 px-2 py-0.5 text-brand">
                      {t.trainType}
                    </span>
                  )}
                  {t.classes && <span className="typo-train-badge text-gray-500">{t.classes}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <DirectionBlock
                  label="اپ (Up)"
                  route={t.upRoute}
                  number={t.upNumber}
                  arrival={t.upArrival}
                  departure={t.upDeparture}
                />
                <DirectionBlock
                  label="ڈاؤن (Down)"
                  route={t.downRoute}
                  number={t.downNumber}
                  arrival={t.downArrival}
                  departure={t.downDeparture}
                />
              </div>
            </div>
          ))}

          <p className="urdu typo-train-note rounded-lg bg-amber-50 px-4 py-2 text-center text-amber-700">
            نوٹ: یہ اوقات پاکستان ریلوے کے سمر ٹائم ٹیبل (15 اپریل تا 14 اکتوبر) کے مطابق ہیں۔ سفر سے پہلے تصدیق کر لیں۔
          </p>
        </div>
      )}
    </>
  );
}
