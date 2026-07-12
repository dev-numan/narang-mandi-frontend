import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopAdminApi } from '../../api/index.js';
import Loader, { EmptyState, ErrorState } from '../../components/Loader.jsx';
import { formatPrice, formatUrduDate } from '../../utils/format.js';

const TABS = [
  { key: '', label: 'تمام' },
  { key: 'pending', label: 'زیرِ التوا' },
  { key: 'processing', label: 'تیاری میں' },
  { key: 'fulfilled', label: 'مکمل' },
  { key: 'cancelled', label: 'منسوخ' },
];

const STATUS = {
  pending: { label: 'زیرِ التوا', cls: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'تیاری میں', cls: 'bg-blue-100 text-blue-800' },
  fulfilled: { label: 'مکمل', cls: 'bg-green-100 text-green-800' },
  cancelled: { label: 'منسوخ', cls: 'bg-red-100 text-red-700' },
};

// Which status a shopkeeper can move an order to next.
const NEXT_ACTIONS = {
  pending: [
    { to: 'processing', label: 'تیاری شروع کریں', cls: 'bg-blue-600 hover:bg-blue-700' },
    { to: 'cancelled', label: 'منسوخ کریں', cls: 'bg-red-600 hover:bg-red-700' },
  ],
  processing: [
    { to: 'fulfilled', label: 'مکمل کریں', cls: 'bg-green-600 hover:bg-green-700' },
    { to: 'cancelled', label: 'منسوخ کریں', cls: 'bg-red-600 hover:bg-red-700' },
  ],
  fulfilled: [],
  cancelled: [],
};

function OrderCard({ order, onSetStatus, pending }) {
  const s = STATUS[order.status] || STATUS.pending;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <span dir="ltr" className="font-mono font-bold text-brand">#{order.orderNumber}</span>
          <span className="urdu mr-2 text-xs text-gray-400">{formatUrduDate(order.createdAt)}</span>
        </div>
        <span className={`urdu rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>{s.label}</span>
      </div>

      <div className="urdu mb-2 text-sm text-gray-700">
        <p className="font-semibold">{order.customerName} · <a href={`tel:${order.customerPhone}`} dir="ltr" className="text-brand">{order.customerPhone}</a></p>
        <p className="text-xs text-gray-500">📍 {order.address}</p>
        {order.note && <p className="mt-1 text-xs text-gray-400">📝 {order.note}</p>}
      </div>

      <ul className="mb-3 divide-y divide-gray-50 border-y border-gray-100 py-1">
        {order.items?.map((it) => (
          <li key={it._id} className="urdu flex items-center justify-between py-1 text-sm">
            <span className="line-clamp-1">{it.productName} × {it.quantity}</span>
            <span className="shrink-0 text-gray-600">{formatPrice(it.lineTotal)}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between">
        <span className="urdu text-sm font-bold">کل: <span className="text-brand">{formatPrice(order.total)}</span></span>
        <div className="flex gap-2">
          {(NEXT_ACTIONS[order.status] || []).map((a) => (
            <button
              key={a.to}
              disabled={pending}
              onClick={() => onSetStatus(order._id, a.to)}
              className={`urdu rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 ${a.cls}`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ShopOrders() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('');
  const [actionError, setActionError] = useState('');

  const { data: orders = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['shop-admin', 'orders', tab],
    queryFn: () => shopAdminApi.orders({ ...(tab ? { status: tab } : {}) }),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => shopAdminApi.setOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shop-admin', 'orders'] });
      qc.invalidateQueries({ queryKey: ['shop-admin', 'stats'] });
    },
    onError: (err) => setActionError(err.message),
  });

  return (
    <div>
      <h1 className="urdu mb-4 text-2xl font-bold text-ink">آرڈرز</h1>

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`urdu rounded-full px-4 py-1.5 text-sm transition ${tab === t.key ? 'bg-brand text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {actionError && <div className="urdu mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{actionError}</div>}

      {isLoading ? (
        <Loader label="Loading…" />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : orders.length === 0 ? (
        <EmptyState label="کوئی آرڈر نہیں" />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {orders.map((o) => (
            <OrderCard key={o._id} order={o} pending={statusMut.isPending} onSetStatus={(id, status) => statusMut.mutate({ id, status })} />
          ))}
        </div>
      )}
    </div>
  );
}
