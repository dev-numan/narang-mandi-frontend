import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classifiedsApi } from '../api/index.js';
import { formatPrice, timeAgoUrdu } from '../utils/format.js';
import MultiImageUploader from '../components/MultiImageUploader.jsx';
import Loader, { EmptyState } from '../components/Loader.jsx';

function PriceTag({ price, negotiable }) {
  if (price == null) {
    return <span className="urdu text-sm text-gray-500">رابطہ کریں</span>;
  }
  return (
    <span className="text-sm font-bold text-brand">
      {formatPrice(price)}
      {negotiable && <span className="urdu mr-1 text-xs font-normal text-gray-400"> · قابلِ گفتگو</span>}
    </span>
  );
}

function ListingCard({ item }) {
  const img = item.images?.[0];
  return (
    <Link
      to={`/classifieds/${item.slug}`}
      className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-brand hover:shadow-md"
    >
      <div className="relative h-40 bg-gray-100">
        {img ? (
          <img src={img} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="urdu flex h-full items-center justify-center text-gray-300">
            {item.category?.icon || '🏷️'}
          </div>
        )}
        {item.isSold && (
          <span className="urdu absolute right-2 top-2 rounded-full bg-gray-800/80 px-2 py-0.5 text-xs text-white">
            فروخت ہو گیا
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="urdu mb-1 line-clamp-1 font-bold text-ink">{item.title}</h3>
        <div className="mb-2">
          <PriceTag price={item.price} negotiable={item.negotiable} />
        </div>
        <div className="urdu mt-auto flex items-center justify-between text-xs text-gray-400">
          <span>{item.category?.name}</span>
          <span>{timeAgoUrdu(item.createdAt)}</span>
        </div>
        {item.location && <p className="urdu mt-1 text-xs text-gray-400">📍 {item.location}</p>}
      </div>
    </Link>
  );
}

const EMPTY = {
  title: '',
  categoryId: '',
  price: '',
  negotiable: false,
  description: '',
  location: '',
  contactName: '',
  phone: '',
  images: [],
};

function PostAdModal({ categories, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  const mut = useMutation({
    mutationFn: (payload) => classifiedsApi.submit(payload),
    onSuccess: (res) => setDone(res.message || 'شکریہ! آپ کا اشتہار موصول ہو گیا۔'),
    onError: (err) => setError(err.message),
  });

  const submit = (e) => {
    e.preventDefault();
    setError('');
    mut.mutate({
      ...form,
      price: form.price === '' ? null : Number(form.price),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        {done ? (
          <div className="text-center">
            <div className="mb-3 text-4xl">✅</div>
            <p className="urdu mb-5 text-gray-700">{done}</p>
            <button onClick={onClose} className="urdu rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
              بند کریں
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h3 className="urdu mb-1 text-lg font-bold text-ink">نیا اشتہار دیں</h3>
            <p className="urdu mb-4 text-xs text-gray-500">آپ کا اشتہار ایڈمن کی منظوری کے بعد شائع کیا جائے گا۔</p>
            {error && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
            <div className="space-y-3">
              <input dir="rtl" required placeholder="عنوان *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand" />
              <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand">
                <option value="">زمرہ منتخب کریں *</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.icon} {c.name}</option>
                ))}
              </select>
              <div className="flex items-center gap-3">
                <input type="number" min="0" dir="ltr" placeholder="قیمت (Rs)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
                <label className="urdu flex shrink-0 items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" checked={form.negotiable} onChange={(e) => setForm({ ...form, negotiable: e.target.checked })} className="h-4 w-4 accent-brand" />
                  قابلِ گفتگو
                </label>
              </div>
              <textarea dir="rtl" rows={3} placeholder="تفصیل (اختیاری)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand" />
              <input dir="rtl" placeholder="علاقہ (اختیاری)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              <div className="flex gap-3">
                <input dir="rtl" placeholder="آپ کا نام (اختیاری)" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
                <input dir="ltr" required placeholder="فون نمبر *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
              <MultiImageUploader value={form.images} onChange={(images) => setForm({ ...form, images })} uploadFn={classifiedsApi.uploadImage} max={5} />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="urdu rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">منسوخ کریں</button>
              <button type="submit" disabled={mut.isPending} className="urdu rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
                {mut.isPending ? 'بھیجا جا رہا ہے…' : 'اشتہار شائع کریں'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ClassifiedsPage() {
  const qc = useQueryClient();
  const [activeCat, setActiveCat] = useState('');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['classified-categories'],
    queryFn: () => classifiedsApi.categories(),
  });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['classifieds', activeCat, search],
    queryFn: () =>
      classifiedsApi.list({
        ...(activeCat ? { category: activeCat } : {}),
        ...(search ? { search } : {}),
      }),
  });

  const closeAdd = () => {
    setShowAdd(false);
    qc.invalidateQueries({ queryKey: ['classifieds'] });
  };

  return (
    <>
      <Helmet>
        <title>اشتہارات — نارنگ منڈی</title>
        <meta name="description" content="نارنگ منڈی کے مقامی اشتہارات — خرید و فروخت، نوکریاں، گاڑیاں" />
      </Helmet>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b-2 border-brand pb-3">
        <div>
          <h1 className="urdu text-3xl font-bold text-ink">اشتہارات</h1>
          <p className="urdu mt-1 text-sm text-gray-500">خرید و فروخت، نوکریاں اور گاڑیاں — نارنگ منڈی</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="urdu rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          + نیا اشتہار دیں
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="mb-5">
            <input dir="rtl" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 اشتہار تلاش کریں…" className="urdu w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-brand" />
          </div>

          {isLoading ? (
            <Loader />
          ) : listings.length === 0 ? (
            <EmptyState label="کوئی اشتہار دستیاب نہیں — پہلا اشتہار آپ دیں!" />
          ) : (
            <>
              <p className="urdu mb-3 text-sm text-gray-500">{listings.length} اشتہارات</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((item) => (
                  <ListingCard key={item._id} item={item} />
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="lg:col-span-1 lg:order-first">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="urdu mb-3 border-b pb-2 text-lg font-bold text-ink">زمرہ جات</h2>
            <ul className="space-y-1">
              <li>
                <button onClick={() => setActiveCat('')} className={`urdu w-full rounded-lg px-3 py-2 text-right text-sm transition ${activeCat === '' ? 'bg-brand text-white' : 'hover:bg-gray-100'}`}>
                  تمام اشتہارات
                </button>
              </li>
              {categories.map((c) => (
                <li key={c._id}>
                  <button onClick={() => setActiveCat(c.slug)} className={`urdu flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${activeCat === c.slug ? 'bg-brand text-white' : 'hover:bg-gray-100'}`}>
                    <span>{c.icon} {c.name}</span>
                    <span className={`rounded-full px-1.5 text-xs ${activeCat === c.slug ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>{c.listingCount}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {showAdd && <PostAdModal categories={categories} onClose={closeAdd} />}
    </>
  );
}
