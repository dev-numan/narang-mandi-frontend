import { useQuery } from '@tanstack/react-query';
import { shopAdminApi } from '../../api/index.js';
import StatCard from '../../admin/components/StatCard.jsx';
import Loader, { ErrorState } from '../../components/Loader.jsx';
import { formatPrice } from '../../utils/format.js';

export default function ShopDashboard() {
  const { data: shop } = useQuery({ queryKey: ['shop-admin', 'shop'], queryFn: () => shopAdminApi.shop() });
  const { data: stats, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['shop-admin', 'stats'],
    queryFn: () => shopAdminApi.stats(),
  });

  if (isLoading) return <Loader label="Loading…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div>
      <h1 className="urdu mb-1 text-2xl font-bold text-ink">ڈیش بورڈ</h1>
      {shop && <p className="urdu mb-6 text-sm text-gray-500">{shop.name}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="کل آرڈرز" value={stats.totalOrders} icon="🧾" />
        <StatCard label="زیرِ التوا" value={stats.pending} icon="⏳" accent="bg-yellow-500" />
        <StatCard label="تیاری میں" value={stats.processing} icon="🔧" accent="bg-blue-500" />
        <StatCard label="مکمل" value={stats.fulfilled} icon="✅" accent="bg-green-600" />
        <StatCard label="پروڈکٹس" value={stats.productCount} icon="📦" accent="bg-ink" />
        <StatCard label="کم اسٹاک" value={stats.lowStock} icon="⚠️" accent="bg-orange-500" />
        <StatCard label="آمدنی (مکمل آرڈرز)" value={formatPrice(stats.revenue)} icon="💰" accent="bg-green-700" />
        <StatCard label="منسوخ" value={stats.cancelled} icon="✖️" accent="bg-red-500" />
      </div>
    </div>
  );
}
