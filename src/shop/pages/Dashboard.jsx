import { useQuery } from '@tanstack/react-query';
import { shopAdminApi } from '../../api/index.js';
import StatCard from '../../admin/components/StatCard.jsx';
import Loader, { ErrorState } from '../../components/Loader.jsx';
import { formatPrice } from '../../utils/format.js';
import { useShopLang } from '../ShopLangContext.jsx';

export default function ShopDashboard() {
  const { t, textClass } = useShopLang();
  const { data: shop } = useQuery({ queryKey: ['shop-admin', 'shop'], queryFn: () => shopAdminApi.shop() });
  const { data: stats, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['shop-admin', 'stats'],
    queryFn: () => shopAdminApi.stats(),
  });

  if (isLoading) return <Loader label="Loading…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const statTypo = { labelClassName: `typo-shop-stat-label ${textClass}`, valueClassName: 'typo-shop-stat-value' };

  return (
    <div>
      <h1 className={`${textClass} typo-shop-page-title mb-1 font-bold text-ink`}>{t('dashboard')}</h1>
      {shop && <p className="urdu-content typo-shop-page-subtitle mb-6 text-gray-500">{shop.name}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('totalOrders')} value={stats.totalOrders} icon="🧾" {...statTypo} />
        <StatCard label={t('pending')} value={stats.pending} icon="⏳" accent="bg-yellow-500" {...statTypo} />
        <StatCard label={t('processing')} value={stats.processing} icon="🔧" accent="bg-blue-500" {...statTypo} />
        <StatCard label={t('fulfilled')} value={stats.fulfilled} icon="✅" accent="bg-green-600" {...statTypo} />
        <StatCard label={t('products')} value={stats.productCount} icon="📦" accent="bg-ink" {...statTypo} />
        <StatCard label={t('revenue')} value={formatPrice(stats.revenue)} icon="💰" accent="bg-green-700" {...statTypo} />
        <StatCard label={t('cancelled')} value={stats.cancelled} icon="✖️" accent="bg-red-500" {...statTypo} />
      </div>
    </div>
  );
}
