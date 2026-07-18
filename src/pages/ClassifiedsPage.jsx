import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classifiedsApi } from '../api/index.js';
import { SITE_NAME } from '../constants/brand.js';
import Seo from '../components/Seo.jsx';
import { formatPrice } from '../utils/format.js';
import MultiImageUploader from '../components/MultiImageUploader.jsx';
import SoldStampOverlay from '../components/SoldStampOverlay.jsx';
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
  const waNumber = (item.phone || '').replace(/[^\d]/g, '').replace(/^0/, '92');

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-brand hover:shadow-md">
      <Link to={`/classifieds/${item.slug}`} className="block">
        <div className="relative h-40 bg-gray-100">
          {img ? (
            <img src={img} alt={item.title} className="h-full w-full object-cover" />
          ) : (
            <div className="urdu flex h-full items-center justify-center text-gray-300">
              {item.category?.icon || '🏷️'}
            </div>
          )}
          {item.isSold && <SoldStampOverlay />}
        </div>
        <div className="p-3 pb-0">
          <h3 className="urdu mb-1 line-clamp-1 font-bold text-ink">{item.title}</h3>
          <div className="mb-2">
            <PriceTag price={item.price} negotiable={item.negotiable} />
          </div>
        </div>
      </Link>
      <div className="flex flex-1 flex-col px-3 pb-3">
        {item.phone && (
          <div className="mb-2 flex items-center justify-between gap-2 border-t border-gray-100 pt-2">
            {item.isSold ? (
              <span dir="ltr" className="select-none text-sm font-semibold text-gray-400 blur-[4px]">
                📞 {item.phone}
              </span>
            ) : (
              <>
                <a
                  href={`tel:${item.phone}`}
                  dir="ltr"
                  className="text-sm font-semibold text-ink hover:text-brand"
                >
                  📞 {item.phone}
                </a>
                {waNumber && (
                  <a
                    href={`https://wa.me/${waNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </a>
                )}
              </>
            )}
          </div>
        )}
        <div className="urdu mt-auto text-xs text-gray-400">
          <span>{item.category?.name}</span>
        </div>
        {item.location && <p className="urdu mt-1 text-xs text-gray-400">📍 {item.location}</p>}
      </div>
    </div>
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
  const [saleCode, setSaleCode] = useState('');
  const [copied, setCopied] = useState(false);

  const mut = useMutation({
    mutationFn: (payload) => classifiedsApi.submit(payload),
    onSuccess: (res) => {
      setDone(res.message || 'شکریہ! آپ کا اشتہار موصول ہو گیا۔');
      setSaleCode(res.data?.saleCode || '');
    },
    onError: (err) => setError(err.message),
  });

  const copyCode = async () => {
    if (!saleCode) return;
    const text = `کوڈ: ${saleCode}\nفون: ${form.phone}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

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
            <p className="urdu mb-4 text-gray-700">{done}</p>
            {saleCode && (
              <div className="mb-5 rounded-xl border-2 border-dashed border-brand/40 bg-brand/5 p-4">
                <p className="urdu mb-2 text-sm font-semibold text-ink">آپ کا خصوصی کوڈ</p>
                <p className="urdu mb-3 text-xs text-gray-600">
                  یہ کوڈ اور اپنا فون نمبر ({form.phone}) محفوظ رکھیں۔ فروخت کے بعد دونوں درج کر کے اشتہار فروخت شدہ قرار دیں۔
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="rounded-lg bg-white px-4 py-2 font-mono text-xl font-bold tracking-widest text-brand" dir="ltr">
                    {saleCode}
                  </span>
                  <button
                    type="button"
                    onClick={copyCode}
                    className="urdu rounded-lg border border-brand px-3 py-2 text-sm font-semibold text-brand hover:bg-brand/10"
                  >
                    {copied ? 'کاپی ہو گیا ✓' : 'کاپی کریں'}
                  </button>
                </div>
              </div>
            )}
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

function MarkSoldCard({ onSuccess }) {
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const mut = useMutation({
    mutationFn: (payload) => classifiedsApi.markSold(payload),
    onSuccess: (res) => {
      setMessage(res.message || 'آپ کی چیز فروخت شدہ قرار دے دی گئی ہے۔');
      setError('');
      setCode('');
      setPhone('');
      onSuccess?.();
    },
    onError: (err) => {
      setError(err.message);
      setMessage('');
    },
  });

  const submit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const trimmed = code.replace(/\D/g, '').slice(0, 8);
    if (trimmed.length < 6) {
      setError('براہِ کرم درست کوڈ درج کریں');
      return;
    }
    if (!phone.trim()) {
      setError('براہِ کرم وہی فون نمبر درج کریں جو اشتہار میں دیا تھا');
      return;
    }
    mut.mutate({ saleCode: trimmed, phone: phone.trim() });
  };

  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
      <h2 className="urdu mb-1 text-lg font-bold text-ink">چیز فروخت ہو گئی؟</h2>
      <p className="urdu mb-3 text-xs text-gray-500">
        اشتہار دیتے وقت ملنے والا کوڈ اور وہی فون نمبر درج کریں — اشتہار فروخت شدہ ہو جائے گا۔
      </p>
      <form onSubmit={submit} className="space-y-2">
        <input
          dir="ltr"
          inputMode="numeric"
          maxLength={8}
          placeholder="کوڈ"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center font-mono text-lg tracking-widest outline-none focus:border-brand"
        />
        <input
          dir="ltr"
          required
          placeholder="فون نمبر (اشتہار والا)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
        />
        {error && <p className="urdu text-xs text-red-600">{error}</p>}
        {message && <p className="urdu text-xs text-green-700">{message}</p>}
        <button
          type="submit"
          disabled={mut.isPending || code.length < 6 || !phone.trim()}
          className="urdu w-full rounded-lg bg-gray-800 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-60"
        >
          {mut.isPending ? 'تصدیق ہو رہی ہے…' : 'فروخت شدہ قرار دیں'}
        </button>
      </form>
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
      <Seo
        title={`${SITE_NAME} | اشتہارات`}
        description="نارنگ منڈی کے مقامی اشتہارات — خرید و فروخت، نوکریاں، گاڑیاں"
        path="/classifieds"
      />

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
          <MarkSoldCard onSuccess={() => qc.invalidateQueries({ queryKey: ['classifieds'] })} />
        </aside>
      </div>

      {showAdd && <PostAdModal categories={categories} onClose={closeAdd} />}
    </>
  );
}
