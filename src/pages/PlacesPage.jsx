import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { placesApi } from '../api/index.js';
import Loader, { EmptyState } from '../components/Loader.jsx';

function Stars({ rating, count }) {
  if (rating == null) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-600">
      <span>★ {rating.toFixed(1)}</span>
      {count != null && <span className="text-gray-400">({count})</span>}
    </span>
  );
}

function PlaceCard({ place }) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="mb-1 flex items-start justify-between gap-2">
        <h3 className="urdu text-lg font-bold leading-tight text-ink">{place.name}</h3>
        {place.category?.icon && <span className="text-xl">{place.category.icon}</span>}
      </div>
      {place.category && (
        <span className="urdu mb-2 inline-block w-fit rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">
          {place.category.name}
        </span>
      )}
      {place.address && <p className="mb-1 text-sm text-gray-600">{place.address}</p>}
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
        {place.phone && (
          <a href={`tel:${place.phone}`} dir="ltr" className="hover:text-brand">
            📞 {place.phone}
          </a>
        )}
        <Stars rating={place.rating} count={place.ratingCount} />
      </div>
      {place.hours && <p className="mb-3 text-xs text-gray-400">🕒 {place.hours}</p>}
      <div className="mt-auto">
        {place.googleMapsUrl && (
          <a
            href={place.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            📍 گوگل میپ پر دیکھیں
          </a>
        )}
      </div>
    </div>
  );
}

const EMPTY_FORM = { name: '', categoryId: '', googleMapsUrl: '', address: '', phone: '', submittedBy: '' };

function AddPlaceModal({ categories, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  const mut = useMutation({
    mutationFn: (payload) => placesApi.submit(payload),
    onSuccess: (res) => setDone(res.message || 'شکریہ! آپ کی تجویز موصول ہو گئی۔'),
    onError: (err) => setError(err.message),
  });

  const submit = (e) => {
    e.preventDefault();
    setError('');
    mut.mutate(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        {done ? (
          <div className="text-center">
            <div className="mb-3 text-4xl">✅</div>
            <p className="urdu mb-5 text-gray-700">{done}</p>
            <button
              onClick={onClose}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              بند کریں
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h3 className="urdu mb-1 text-lg font-bold text-ink">نیا مقام تجویز کریں</h3>
            <p className="urdu mb-4 text-xs text-gray-500">
              آپ کی تجویز ایڈمن کی منظوری کے بعد ویب سائٹ پر شائع کر دی جائے گی۔
            </p>
            {error && (
              <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}
            <div className="space-y-3">
              <input
                dir="rtl"
                required
                placeholder="مقام کا نام *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
              />
              <select
                required
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
              >
                <option value="">زمرہ منتخب کریں *</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
              <input
                dir="ltr"
                required
                type="url"
                placeholder="Google Maps link *  (https://...)"
                value={form.googleMapsUrl}
                onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <input
                dir="rtl"
                placeholder="پتہ (اختیاری)"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <input
                dir="ltr"
                placeholder="فون نمبر (اختیاری)"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </div>
            <p className="urdu mt-3 text-xs text-gray-400">
              گوگل میپ لنک حاصل کرنے کا طریقہ: گوگل میپ پر مقام تلاش کریں → Share → Copy link
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="urdu rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              >
                منسوخ کریں
              </button>
              <button
                type="submit"
                disabled={mut.isPending}
                className="urdu rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
              >
                {mut.isPending ? 'بھیجا جا رہا ہے…' : 'تجویز بھیجیں'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function PlacesPage() {
  const qc = useQueryClient();
  const [activeCat, setActiveCat] = useState(''); // '' = all
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['place-categories'],
    queryFn: () => placesApi.categories(),
  });

  const { data: places = [], isLoading } = useQuery({
    queryKey: ['places', activeCat, search],
    queryFn: () =>
      placesApi.list({
        ...(activeCat ? { category: activeCat } : {}),
        ...(search ? { search } : {}),
      }),
  });

  const closeAdd = () => {
    setShowAdd(false);
    qc.invalidateQueries({ queryKey: ['places'] });
  };

  return (
    <>
      <Helmet>
        <title>Narang Mandi | مشہور مقامات</title>
        <meta name="description" content="نارنگ منڈی کے مشہور مقامات، بازار، دکانیں اور خدمات کی فہرست" />
      </Helmet>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b-2 border-brand pb-3">
        <div>
          <h1 className="urdu text-3xl font-bold text-ink">مشہور مقامات</h1>
          <p className="urdu mt-1 text-sm text-gray-500">نارنگ منڈی کے بازار، دکانیں اور خدمات</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="urdu rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + نیا مقام شامل کریں
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="mb-5">
            <input
              dir="rtl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 مقام یا پتہ تلاش کریں…"
              className="urdu w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-brand"
            />
          </div>

          {isLoading ? (
            <Loader />
          ) : places.length === 0 ? (
            <EmptyState label="کوئی جگہ دستیاب نہیں" />
          ) : (
            <>
              <p className="urdu mb-3 text-sm text-gray-500">{places.length} مقامات</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {places.map((p) => (
                  <PlaceCard key={p._id} place={p} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Categories sidebar */}
        <aside className="lg:col-span-1 lg:order-first">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="urdu mb-3 border-b pb-2 text-lg font-bold text-ink">زمرہ جات</h2>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setActiveCat('')}
                  className={`urdu flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                    activeCat === '' ? 'bg-brand text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <span>تمام مقامات</span>
                </button>
              </li>
              {categories.map((c) => (
                <li key={c._id}>
                  <button
                    onClick={() => setActiveCat(c.slug)}
                    className={`urdu flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                      activeCat === c.slug ? 'bg-brand text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    <span>
                      {c.icon} {c.name}
                    </span>
                    <span
                      className={`rounded-full px-1.5 text-xs ${
                        activeCat === c.slug ? 'bg-white/20' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {c.placeCount}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {showAdd && <AddPlaceModal categories={categories} onClose={closeAdd} />}
    </>
  );
}
