import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shopAdminApi } from '../../api/index.js';
import DataTable from '../../admin/components/DataTable.jsx';
import Loader, { ErrorState } from '../../components/Loader.jsx';
import { formatDateNumeric, formatPrice } from '../../utils/format.js';
import { useShopLang } from '../ShopLangContext.jsx';
import { SHOP_TABLE_TYPO } from '../shopTypo.js';
import OrderStatusDropdown, {
  ORDER_STATUS_CLS,
  orderStatusLabel,
} from '../components/OrderStatusDropdown.jsx';

export default function ShopOrders() {
  const { t, textClass } = useShopLang();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState('');
  const [actionError, setActionError] = useState('');

  const TABS = [
    { key: '', label: t('tabAll') },
    { key: 'pending', label: t('pending') },
    { key: 'processing', label: t('processing') },
    { key: 'fulfilled', label: t('fulfilled') },
    { key: 'cancelled', label: t('cancelled') },
  ];

  const { data: orders = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['shop-admin', 'orders', tab],
    queryFn: () => shopAdminApi.orders({ ...(tab ? { status: tab } : {}) }),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => shopAdminApi.setOrderStatus(id, status),
    onSuccess: () => {
      setActionError('');
      qc.invalidateQueries({ queryKey: ['shop-admin', 'orders'] });
      qc.invalidateQueries({ queryKey: ['shop-admin', 'stats'] });
    },
    onError: (err) => setActionError(err.message),
  });

  const columns = [
    {
      key: 'orderNumber',
      header: t('colOrder'),
      className: 'whitespace-nowrap',
      render: (r) => (
        <span dir="ltr" className="font-mono font-bold text-brand">
          #{r.orderNumber}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: t('colDate'),
      className: 'whitespace-nowrap',
      render: (r) => (
        <span dir="ltr" className="typo-shop-order-meta whitespace-nowrap text-gray-500">
          {formatDateNumeric(r.createdAt)}
        </span>
      ),
    },
    {
      key: 'customerName',
      header: t('colName'),
      render: (r) => <span className="urdu-content font-semibold text-ink">{r.customerName}</span>,
    },
    {
      key: 'customerPhone',
      header: t('phone'),
      className: 'whitespace-nowrap',
      render: (r) => (
        <a
          href={`tel:${r.customerPhone}`}
          dir="ltr"
          className="font-medium text-brand"
          onClick={(e) => e.stopPropagation()}
        >
          {r.customerPhone}
        </a>
      ),
    },
    {
      key: 'address',
      header: t('colAddress'),
      render: (r) => (
        <div className="max-w-[14rem]">
          <p className="urdu-content typo-shop-order-meta text-gray-600">📍 {r.address}</p>
          {r.note && <p className="urdu-content typo-shop-order-meta mt-0.5 text-gray-400">📝 {r.note}</p>}
        </div>
      ),
    },
    {
      key: 'total',
      header: t('colTotal'),
      className: 'whitespace-nowrap',
      render: (r) => <span className="font-bold text-brand">{formatPrice(r.total)}</span>,
    },
    {
      key: 'status',
      header: t('colStatus'),
      render: (r) => {
        const statusKey = r.status || 'pending';
        return (
          <span
            className={`${textClass} typo-shop-order-badge inline-block rounded-full px-2.5 py-0.5 font-semibold ${ORDER_STATUS_CLS[statusKey] || ORDER_STATUS_CLS.pending}`}
          >
            {orderStatusLabel(t, statusKey)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: t('colActions'),
      stopRowClick: true,
      render: (r) => (
        <OrderStatusDropdown
          value={r.status || 'pending'}
          disabled={statusMut.isPending}
          t={t}
          textClass={textClass}
          onChange={(status) => statusMut.mutate({ id: r._id, status })}
        />
      ),
    },
  ];

  return (
    <div>
      <h1 className={`${textClass} typo-shop-page-title mb-4 font-bold text-ink`}>{t('ordersTitle')}</h1>

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className={`${textClass} typo-shop-tab rounded-full px-4 py-1.5 transition ${
              tab === tabItem.key ? 'bg-brand text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {actionError && (
        <div className={`${textClass} typo-shop-alert mb-4 rounded-lg bg-red-50 px-4 py-2 text-red-700`}>
          {actionError}
        </div>
      )}

      {isLoading ? (
        <Loader label="Loading…" />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <DataTable
          columns={columns}
          rows={orders}
          empty={t('emptyOrders')}
          pageSize={10}
          typo={SHOP_TABLE_TYPO}
          onRowClick={(row) => navigate(`/shop/admin/orders/${row._id}`)}
          labels={{
            prev: t('pagePrev'),
            next: t('pageNext'),
            showing: (from, to, total) => t('pageShowing', from, to, total),
          }}
        />
      )}
    </div>
  );
}
