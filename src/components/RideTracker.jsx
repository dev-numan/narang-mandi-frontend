import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taxiApi } from '../api/index.js';
import { getSocket } from '../api/socket.js';
import { formatPrice } from '../utils/format.js';
import Loader from '../components/Loader.jsx';
import DriverFallbackList from './DriverFallbackList.jsx';

/// Matches BID_WINDOW_MS on the server, which also refuses the driver list
/// until it has passed.
const BID_WINDOW_MS = 4 * 60 * 1000;

const mmss = (ms) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

const STATUS = {
  open: { label: 'پیشکشوں کا انتظار', cls: 'bg-blue-100 text-blue-700' },
  assigned: { label: 'ڈرائیور طے ہو گیا', cls: 'bg-green-100 text-green-700' },
  completed: { label: 'مکمل', cls: 'bg-gray-200 text-gray-700' },
  cancelled: { label: 'منسوخ', cls: 'bg-red-100 text-red-700' },
};

/**
 * The customer's live view of one ride.
 *
 * Bids arrive over the socket room named by the ride's access token — the room
 * name is the credential, since a guest has no login to authenticate with. The
 * poll underneath is the safety net for a dropped socket.
 */
export default function RideTracker({ rideCode, phone }) {
  const qc = useQueryClient();
  const queryKey = ['ride', rideCode];
  const [error, setError] = useState('');

  const { data: ride, isLoading } = useQuery({
    queryKey,
    queryFn: () => taxiApi.lookup(rideCode, phone),
    refetchInterval: 20000,
  });

  const accessToken = ride?.accessToken;

  // Derived from the ride's createdAt rather than counted down locally, so a
  // reload — or a phone that slept — still shows the true remaining time.
  const deadline = useMemo(
    () => (ride?.createdAt ? Date.parse(ride.createdAt) + BID_WINDOW_MS : 0),
    [ride?.createdAt]
  );
  const [now, setNow] = useState(() => Date.now());
  const waiting = ride?.status === 'open' && deadline > now;

  useEffect(() => {
    if (!waiting) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [waiting]);

  // Only fetched once the window has closed; the server would answer 425 before
  // that anyway.
  const { data: fallbackDrivers } = useQuery({
    queryKey: ['ride', rideCode, 'drivers'],
    queryFn: () => taxiApi.drivers(rideCode, phone),
    enabled: ride?.status === 'open' && !waiting,
    staleTime: 60000,
  });

  useEffect(() => {
    if (!accessToken) return undefined;
    const socket = getSocket();
    const join = () => socket.emit('ride:join', accessToken);
    join();
    // Any ride event just invalidates — the payloads are intentionally thin, and
    // a refetch is cheap next to getting the merge wrong.
    const refresh = () => qc.invalidateQueries({ queryKey });
    socket.on('ride:bid', refresh);
    socket.on('ride:bid-withdrawn', refresh);
    socket.on('ride:assigned', refresh);
    socket.on('ride:cancelled', refresh);
    socket.on('ride:completed', refresh);
    socket.on('connect', join);
    return () => {
      socket.off('ride:bid', refresh);
      socket.off('ride:bid-withdrawn', refresh);
      socket.off('ride:assigned', refresh);
      socket.off('ride:cancelled', refresh);
      socket.off('ride:completed', refresh);
      socket.off('connect', join);
    };
  }, [accessToken, qc, rideCode]);

  const accept = useMutation({
    mutationFn: (bidId) => taxiApi.accept(rideCode, phone, bidId),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
    onError: (err) => setError(err.message),
  });

  const cancel = useMutation({
    mutationFn: () => taxiApi.cancel(rideCode, phone),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
    onError: (err) => setError(err.message),
  });

  if (isLoading) return <Loader />;
  if (!ride) return null;

  const status = STATUS[ride.status] || STATUS.open;
  const bids = ride.bids || [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className={`urdu typo-taxi-badge rounded-full px-3 py-1.5 font-semibold ${status.cls}`}>
          {status.label}
        </span>
        <span dir="ltr" className="typo-taxi-card-meta font-mono text-gray-500">
          {ride.rideCode}
        </span>
      </div>

      <p className="urdu typo-taxi-card-meta mb-1 text-gray-700">
        <span className="text-gray-400">کہاں سے: </span>
        {ride.pickupText}
      </p>
      <p className="urdu typo-taxi-card-meta mb-3 text-gray-700">
        <span className="text-gray-400">کہاں تک: </span>
        {ride.dropoffText}
      </p>

      {error && <p className="urdu typo-taxi-error mb-3 text-red-600">{error}</p>}

      {ride.status === 'open' && (
        <>
          {waiting && (
            <div className="mb-3 flex items-center gap-3 rounded-lg bg-blue-50 p-3">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
              <div className="min-w-0">
                <p className="urdu typo-taxi-card-title font-semibold text-blue-900">
                  ڈرائیوروں کو اطلاع بھیج دی گئی ہے
                </p>
                <p className="urdu typo-taxi-card-meta text-blue-700">
                  جواب کا انتظار — <span dir="ltr">{mmss(deadline - now)}</span>
                </p>
              </div>
            </div>
          )}

          <p className="urdu typo-taxi-section-title mb-2 font-semibold text-ink">
            {bids.length ? `${bids.length} پیشکشیں` : 'ابھی کوئی پیشکش نہیں آئی'}
          </p>
          <div className="grid gap-2">
            {bids.map((b) => (
              <div
                key={b._id}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3"
              >
                <div className="min-w-0">
                  <p className="urdu typo-taxi-card-title truncate font-semibold text-ink">
                    {b.driver?.name || 'ڈرائیور'}
                  </p>
                  <p className="urdu typo-taxi-card-meta text-gray-500">
                    {[b.driver?.vehicleType, b.driver?.vehicleNumber].filter(Boolean).join(' · ') || '—'}
                    {b.etaMinutes ? ` · ${b.etaMinutes} منٹ` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="typo-taxi-price font-bold text-brand">{formatPrice(b.price)}</span>
                  <button
                    onClick={() => accept.mutate(b._id)}
                    disabled={accept.isPending}
                    className="urdu typo-taxi-card-meta rounded-lg bg-brand px-4 py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
                  >
                    منتخب کریں
                  </button>
                </div>
              </div>
            ))}
          </div>
          {!waiting && (
            <DriverFallbackList drivers={fallbackDrivers} hadBids={bids.length > 0} />
          )}

          <button
            onClick={() => cancel.mutate()}
            disabled={cancel.isPending}
            className="urdu typo-taxi-hint mt-4 py-2 text-red-600 hover:underline disabled:opacity-50"
          >
            درخواست منسوخ کریں
          </button>
        </>
      )}

      {ride.status === 'assigned' && ride.driver && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <p className="urdu typo-taxi-card-title font-semibold text-green-900">{ride.driver.name}</p>
          <p className="urdu typo-taxi-card-meta text-green-800">
            {[ride.driver.vehicleType, ride.driver.vehicleNumber].filter(Boolean).join(' · ')}
          </p>
          <p className="urdu typo-taxi-card-meta mt-1 text-green-800">
            کرایہ: <span className="typo-taxi-price font-bold">{formatPrice(ride.agreedPrice)}</span>
          </p>
          {ride.driver.phone && (
            <a
              href={`tel:${ride.driver.phone}`}
              dir="ltr"
              className="typo-taxi-button mt-3 inline-block rounded-lg bg-green-700 px-5 py-3 font-semibold text-white"
            >
              {ride.driver.phone}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
