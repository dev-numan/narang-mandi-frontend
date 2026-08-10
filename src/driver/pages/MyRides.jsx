import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { driverApi } from '../../api/index.js';
import { formatPrice } from '../../utils/format.js';
import Loader, { EmptyState, ErrorState } from '../../components/Loader.jsx';

const STATUS = {
  assigned: { label: 'جاری', cls: 'bg-green-100 text-green-700' },
  completed: { label: 'مکمل', cls: 'bg-gray-200 text-gray-700' },
  cancelled: { label: 'منسوخ', cls: 'bg-red-100 text-red-700' },
};

export default function DriverMyRides() {
  const qc = useQueryClient();
  const { data: rides, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['driver', 'mine'],
    queryFn: () => driverApi.myRides(),
    refetchInterval: 30000,
  });

  const complete = useMutation({
    mutationFn: (id) => driverApi.complete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['driver'] }),
  });

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!rides?.length) return <EmptyState label="ابھی کوئی سواری نہیں ملی" />;

  return (
    <div className="grid gap-3 p-4">
      {rides.map((r) => {
        const s = STATUS[r.status] || STATUS.assigned;
        return (
          <div key={r._id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className={`urdu rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}>
                {s.label}
              </span>
              <span className="font-bold text-brand">{formatPrice(r.agreedPrice)}</span>
            </div>
            <p className="urdu text-sm text-gray-700">
              <span className="text-gray-400">سے: </span>
              {r.pickupText}
            </p>
            <p className="urdu text-sm text-gray-700">
              <span className="text-gray-400">تک: </span>
              {r.dropoffText}
            </p>

            {/* Contact details appear only once this driver has won the ride. */}
            {r.customerName && (
              <div className="mt-2 rounded-lg bg-gray-50 p-2">
                <p className="urdu text-sm font-semibold text-ink">{r.customerName}</p>
                {r.customerPhone && (
                  <a href={`tel:${r.customerPhone}`} dir="ltr" className="text-sm text-brand">
                    {r.customerPhone}
                  </a>
                )}
              </div>
            )}

            {r.status === 'assigned' && (
              <button
                onClick={() => complete.mutate(r._id)}
                disabled={complete.isPending}
                className="urdu mt-3 w-full rounded-lg bg-ink py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                سفر مکمل ہوا
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
