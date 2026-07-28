import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shopAdminApi } from '../../api/index.js';
import Loader, { ErrorState } from '../../components/Loader.jsx';
import { formatDateNumeric, formatPrice } from '../../utils/format.js';
import { useShopLang } from '../ShopLangContext.jsx';
import OrderStatusDropdown, {
  ORDER_STATUS_CLS,
  orderStatusLabel,
} from '../components/OrderStatusDropdown.jsx';

export default function ShopOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, textClass } = useShopLang();
  const qc = useQueryClient();
  const [actionError, setActionError] = useState('');

  const { data: order, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['shop-admin', 'order', id],
    queryFn: () => shopAdminApi.order(id),
    enabled: !!id,
  });

  const statusMut = useMutation({
    mutationFn: (status) => shopAdminApi.setOrderStatus(id, status),
    onSuccess: () => {
      setActionError('');
      qc.invalidateQueries({ queryKey: ['shop-admin', 'order', id] });
      qc.invalidateQueries({ queryKey: ['shop-admin', 'orders'] });
      qc.invalidateQueries({ queryKey: ['shop-admin', 'stats'] });
    },
    onError: (err) => setActionError(err.message),
  });

  if (isLoading) return <Loader label="Loading…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!order) return null;

  const statusKey = order.status || 'pending';

  return (
    <div className="mx-auto max-w-2xl">
      <button
        type="button"
        onClick={() => navigate('/shop/admin/orders')}
        className={`${textClass} typo-shop-button mb-5 inline-flex items-center gap-2 rounded-lg border-2 border-ink bg-white px-4 py-2.5 font-bold text-ink shadow-sm transition hover:bg-ink hover:text-white`}
      >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path
            fillRule="evenodd"
            d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
            clipRule="evenodd"
          />
        </svg>
        {t('back')}
      </button>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <p dir="ltr" className="font-mono text-xl font-bold text-brand">
              #{order.orderNumber}
            </p>
            <p dir="ltr" className="typo-shop-order-meta mt-1 text-gray-400">
              {formatDateNumeric(order.createdAt)}
            </p>
          </div>
          <span
            className={`${textClass} typo-shop-order-badge rounded-full px-3 py-1 font-semibold ${ORDER_STATUS_CLS[statusKey] || ORDER_STATUS_CLS.pending}`}
          >
            {orderStatusLabel(t, statusKey)}
          </span>
        </div>

        {actionError && (
          <div className={`${textClass} typo-shop-alert mb-4 rounded-lg bg-red-50 px-3 py-2 text-red-700`}>
            {actionError}
          </div>
        )}

        <div className="mb-5 space-y-2">
          <div>
            <p className={`${textClass} typo-shop-label text-gray-400`}>{t('colName')}</p>
            <p className="urdu-content typo-shop-order-body font-semibold text-ink">{order.customerName}</p>
          </div>
          <div>
            <p className={`${textClass} typo-shop-label text-gray-400`}>{t('phone')}</p>
            <a href={`tel:${order.customerPhone}`} dir="ltr" className="font-medium text-brand">
              {order.customerPhone}
            </a>
          </div>
          <div>
            <p className={`${textClass} typo-shop-label text-gray-400`}>{t('colAddress')}</p>
            <p className="urdu-content typo-shop-order-meta text-gray-700">📍 {order.address}</p>
          </div>
          {order.note && (
            <div>
              <p className={`${textClass} typo-shop-label text-gray-400`}>{t('colNote')}</p>
              <p className="urdu-content typo-shop-order-meta text-gray-500">📝 {order.note}</p>
            </div>
          )}
        </div>

        <h2 className={`${textClass} typo-shop-section-title mb-2 font-bold text-ink`}>{t('colItems')}</h2>
        <ul className="mb-4 divide-y divide-gray-50 rounded-lg border border-gray-100">
          {order.items?.map((it) => (
            <li key={it._id} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <span className="urdu-content typo-shop-order-body min-w-0" title={it.productName}>
                {it.productName} × {it.quantity}
              </span>
              <span className="shrink-0 font-medium text-gray-700" dir="ltr">
                {formatPrice(it.lineTotal)}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <span className={`${textClass} typo-shop-order-total font-bold`}>
            {t('total')}: <span className="text-brand">{formatPrice(order.total)}</span>
          </span>
          <OrderStatusDropdown
            value={statusKey}
            disabled={statusMut.isPending}
            t={t}
            textClass={textClass}
            onChange={(status) => statusMut.mutate(status)}
          />
        </div>
      </div>
    </div>
  );
}
