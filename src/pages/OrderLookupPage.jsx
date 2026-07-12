import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useMutation } from '@tanstack/react-query';
import { shopsApi } from '../api/index.js';
import { SITE_NAME } from '../constants/brand.js';
import { formatPrice, formatUrduDate } from '../utils/format.js';

const STATUS_LABEL = {
  pending: { label: 'زیرِ التوا', cls: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'تیاری میں', cls: 'bg-blue-100 text-blue-800' },
  fulfilled: { label: 'مکمل', cls: 'bg-green-100 text-green-800' },
  cancelled: { label: 'منسوخ', cls: 'bg-red-100 text-red-700' },
};

function StatusBadge({ status }) {
  const s = STATUS_LABEL[status] || STATUS_LABEL.pending;
  return <span className={`urdu rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>{s.label}</span>;
}

export default function OrderLookupPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const mut = useMutation({
    mutationFn: (payload) => shopsApi.lookupOrder(payload),
    onError: (err) => setError(err.message),
  });

  const submit = (e) => {
    e.preventDefault();
    setError('');
    mut.mutate({ orderNumber: orderNumber.replace(/\D/g, '').slice(0, 8), phone: phone.trim() });
  };

  const order = mut.data;

  return (
    <>
      <Helmet><title>{SITE_NAME} | آرڈر ٹریک کریں</title></Helmet>

      <div className="mb-6 border-b-2 border-brand pb-3">
        <h1 className="urdu text-3xl font-bold text-ink">آرڈر ٹریک کریں</h1>
        <p className="urdu mt-1 text-sm text-gray-500">اپنا آرڈر نمبر اور فون نمبر درج کریں</p>
      </div>

      <form onSubmit={submit} className="mx-auto max-w-md space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        {error && <div className="urdu rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <input dir="ltr" inputMode="numeric" maxLength={8} required placeholder="آرڈر نمبر" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value.replace(/\D/g, '').slice(0, 8))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center font-mono text-lg tracking-widest outline-none focus:border-brand" />
        <input dir="ltr" required placeholder="فون نمبر" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
        <button type="submit" disabled={mut.isPending} className="urdu w-full rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
          {mut.isPending ? 'تلاش…' : 'آرڈر تلاش کریں'}
        </button>
      </form>

      {order && (
        <div className="mx-auto mt-6 max-w-md rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <p dir="ltr" className="font-mono text-lg font-bold text-brand">#{order.orderNumber}</p>
              <p className="urdu text-xs text-gray-400">{formatUrduDate(order.createdAt)}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
          {order.shop && (
            <p className="urdu mb-2 text-sm text-gray-600">
              دکان: <Link to={`/shops/${order.shop.slug}`} className="text-brand hover:underline">{order.shop.name}</Link>
            </p>
          )}
          <ul className="mb-3 space-y-1">
            {order.items?.map((it) => (
              <li key={it._id} className="urdu flex items-center justify-between text-sm">
                <span className="line-clamp-1">{it.productName} × {it.quantity}</span>
                <span className="shrink-0 text-gray-600">{formatPrice(it.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="urdu flex items-center justify-between border-t border-gray-100 pt-2 text-sm font-bold">
            <span>کل رقم</span>
            <span className="text-brand">{formatPrice(order.total)}</span>
          </div>
        </div>
      )}
    </>
  );
}
