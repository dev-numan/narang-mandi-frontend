import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useMutation } from '@tanstack/react-query';
import { shopsApi } from '../api/index.js';
import { SITE_NAME } from '../constants/brand.js';
import { formatPrice } from '../utils/format.js';
import { useCart } from '../context/CartContext.jsx';

const EMPTY = { customerName: '', customerPhone: '', address: '', note: '' };

export default function CartPage() {
  const { cart, setQty, remove, clear, total } = useCart();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [placed, setPlaced] = useState(null); // the created order

  const mut = useMutation({
    mutationFn: (payload) => shopsApi.placeOrder(cart.shopSlug, payload),
    onSuccess: (res) => {
      setPlaced(res.data);
      clear();
    },
    onError: (err) => setError(err.message),
  });

  const submit = (e) => {
    e.preventDefault();
    setError('');
    mut.mutate({
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      address: form.address,
      note: form.note,
      items: cart.items.map((i) => ({ productId: i.productId, quantity: i.qty })),
    });
  };

  // Order confirmation screen
  if (placed) {
    return (
      <>
        <Helmet><title>{SITE_NAME} | آرڈر مکمل</title></Helmet>
        <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-3 text-5xl">✅</div>
          <h1 className="urdu mb-2 text-xl font-bold text-ink">آپ کا آرڈر موصول ہو گیا!</h1>
          <p className="urdu mb-4 text-sm text-gray-600">
            دکاندار جلد آپ سے رابطہ کرے گا۔ اپنا آرڈر نمبر محفوظ رکھیں۔
          </p>
          <div className="mb-5 rounded-xl border-2 border-dashed border-brand/40 bg-brand/5 p-4">
            <p className="urdu mb-1 text-sm font-semibold text-ink">آرڈر نمبر</p>
            <p dir="ltr" className="font-mono text-2xl font-bold tracking-widest text-brand">{placed.orderNumber}</p>
          </div>
          <div className="flex justify-center gap-3">
            <Link to="/orders/track" className="urdu rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
              آرڈر ٹریک کریں
            </Link>
            <Link to="/shops" className="urdu rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
              مزید خریداری
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <>
        <Helmet><title>{SITE_NAME} | ٹوکری</title></Helmet>
        <div className="rounded-xl bg-white py-16 text-center text-gray-400 shadow-sm">
          <div className="mb-2 text-4xl">🛒</div>
          <p className="urdu">آپ کی ٹوکری خالی ہے</p>
          <Link to="/shops" className="urdu mt-3 inline-block text-brand hover:underline">دکانیں دیکھیں →</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>{SITE_NAME} | ٹوکری</title></Helmet>

      <div className="mb-6 border-b-2 border-brand pb-3">
        <h1 className="urdu text-3xl font-bold text-ink">ٹوکری</h1>
        <p className="urdu mt-1 text-sm text-gray-500">
          دکان: <Link to={`/shops/${cart.shopSlug}`} className="text-brand hover:underline">{cart.shopName}</Link>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
            {cart.items.map((i) => (
              <div key={i.productId} className="flex items-center gap-3 p-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {i.image ? (
                    <img src={i.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl text-gray-300">📦</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="urdu line-clamp-1 font-semibold text-ink">{i.name}</p>
                  <p className="text-sm font-bold text-brand">{formatPrice(i.price)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setQty(i.productId, i.qty - 1)} className="h-7 w-7 rounded-lg border border-gray-300 font-bold hover:bg-gray-50">−</button>
                  <span dir="ltr" className="w-8 text-center text-sm font-semibold">{i.qty}</span>
                  <button onClick={() => setQty(i.productId, i.qty + 1)} disabled={i.qty >= i.stock} className="h-7 w-7 rounded-lg border border-gray-300 font-bold hover:bg-gray-50 disabled:opacity-40">+</button>
                </div>
                <button onClick={() => remove(i.productId)} className="urdu shrink-0 text-xs text-red-500 hover:underline">
                  ہٹائیں
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Checkout */}
        <div className="lg:col-span-1">
          <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="urdu mb-3 text-lg font-bold text-ink">آرڈر کی تفصیلات</h2>
            {error && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="urdu text-sm text-gray-600">کل رقم</span>
              <span className="text-lg font-bold text-brand">{formatPrice(total)}</span>
            </div>

            <div className="space-y-3">
              <input dir="rtl" required placeholder="آپ کا نام *" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand" />
              <input dir="ltr" required placeholder="فون نمبر *" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              <textarea dir="rtl" required rows={2} placeholder="ڈیلیوری ایڈریس *" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand" />
              <textarea dir="rtl" rows={2} placeholder="اضافی ہدایات (اختیاری)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand" />
            </div>

            <p className="urdu mt-3 text-xs text-gray-400">ادائیگی: ڈیلیوری پر نقد (کیش آن ڈیلیوری)</p>

            <button type="submit" disabled={mut.isPending} className="urdu mt-4 w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
              {mut.isPending ? 'آرڈر بھیجا جا رہا ہے…' : 'آرڈر کی تصدیق کریں'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
