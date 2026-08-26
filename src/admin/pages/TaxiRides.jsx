import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminTaxiApi } from '../../api/index.js';
import DataTable from '../components/DataTable.jsx';
import Loader, { ErrorState } from '../../components/Loader.jsx';
import { pktDateTime, ago, money, displayPhone, isExpired, StatusPill } from '../taxiUtils.jsx';

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function TaxiRides() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'taxi', 'rides', status, page],
    queryFn: () => adminTaxiApi.rides({ page, limit: 20, ...(status ? { status } : {}) }),
  });

  const rides = data?.data || [];

  const columns = [
    {
      key: 'rideCode',
      header: 'Code',
      render: (r) => (
        <span className="font-mono text-xs text-gray-600" dir="ltr">
          {r.rideCode}
        </span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (r) => (
        <div>
          <p className="font-medium text-ink">{r.customerName || '—'}</p>
          <p className="text-xs text-gray-500" dir="ltr">
            {displayPhone(r.customerPhone)}
          </p>
        </div>
      ),
    },
    {
      key: 'route',
      header: 'Route',
      render: (r) => (
        <div className="urdu max-w-[16rem] truncate leading-[2]" title={`${r.pickupText} ← ${r.dropoffText}`}>
          {r.pickupText} <span className="text-gray-400">←</span> {r.dropoffText}
        </div>
      ),
    },
    {
      key: 'whenText',
      header: 'For',
      render: (r) => <span className="urdu text-xs leading-[2]">{r.whenText || '—'}</span>,
    },
    {
      key: 'bidCount',
      header: 'Bids',
      render: (r) => (
        <span className={r.bidCount ? 'font-semibold text-sky-700' : 'text-gray-400'}>{r.bidCount}</span>
      ),
    },
    {
      key: 'agreedPrice',
      header: 'Agreed',
      render: (r) => (
        <span dir="ltr" className={r.agreedPrice ? 'font-semibold text-ink' : 'text-gray-400'}>
          {r.agreedPrice ? money(r.agreedPrice) : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <div className="space-y-1">
          <StatusPill status={r.status} expired={isExpired(r)} />
          {/* An admin reading a cancellation needs to know whether a person did
              it or the TTL did — they mean opposite things. */}
          {r.status === 'cancelled' && r.cancelledBy && (
            <p className="text-[11px] text-gray-500">
              {r.cancelledBy === 'system' ? 'timed out' : `by ${r.cancelledBy}`}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Requested',
      render: (r) => (
        <div>
          <p className="text-xs text-ink">{pktDateTime(r.createdAt)}</p>
          <p className="text-[11px] text-gray-400">{ago(r.createdAt)} ago</p>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Rides</h1>
          {data?.total != null && (
            <p className="text-sm text-gray-500">
              {data.total} ride{data.total === 1 ? '' : 's'}
              {status ? ` · ${status}` : ''}
            </p>
          )}
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setStatus(f.key);
              setPage(1);
            }}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
              status === f.key ? 'bg-brand text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loader label="Loading rides…" />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <>
          {/* pageSize={0} because the server already paginated this page — letting
              DataTable slice again would hide rows behind a second pager. */}
          <DataTable
            columns={columns}
            rows={rides}
            pageSize={0}
            empty="No rides in this view"
            onRowClick={(r) => navigate(`/admin/taxi/rides/${r._id}`)}
          />

          {data?.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
