import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { driverApi } from '../../api/index.js';
import { ensureAuth } from '../../api/socket.js';
import { formatPrice } from '../../utils/format.js';
import Loader, { EmptyState, ErrorState } from '../../components/Loader.jsx';

/**
 * The bidding board.
 *
 * Rival prices are deliberately absent — a driver sees how many others bid, not
 * what they bid, so the board does not turn into a race to the bottom.
 */
export default function DriverOpenRides() {
  const qc = useQueryClient();
  const queryKey = ['driver', 'open'];

  const { data: rides, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: driverApi.openRides,
    refetchInterval: 25000,
  });

  useEffect(() => {
    // Cycles the connection if it was opened before this driver logged in;
    // the server reads identity from the handshake, which runs only once.
    const socket = ensureAuth();
    const join = () => {
      socket.emit('drivers:join');
      // Also the driver's own room, which is where the outcome of their bid
      // arrives. The Android panel hears the same thing over push; a driver in
      // a browser has only this.
      socket.emit('driver:join');
    };
    join();
    const refresh = () => qc.invalidateQueries({ queryKey });
    // A won or lost bid changes both boards, so refresh everything driver-side.
    const outcome = () => qc.invalidateQueries({ queryKey: ['driver'] });
    socket.on('board:new', refresh);
    socket.on('board:assigned', refresh);
    socket.on('board:cancelled', refresh);
    socket.on('bid:accepted', outcome);
    socket.on('bid:rejected', outcome);
    socket.on('connect', join);
    return () => {
      socket.off('board:new', refresh);
      socket.off('board:assigned', refresh);
      socket.off('board:cancelled', refresh);
      socket.off('bid:accepted', outcome);
      socket.off('bid:rejected', outcome);
      socket.off('connect', join);
    };
  }, [qc]);

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!rides?.length) return <EmptyState label="ابھی کوئی سواری نہیں" />;

  return (
    <div className="grid gap-3 p-4">
      {rides.map((r) => (
        <RideCard key={r._id} ride={r} onChanged={() => qc.invalidateQueries({ queryKey })} />
      ))}
    </div>
  );
}

function RideCard({ ride, onChanged }) {
  const [price, setPrice] = useState(ride.myBid ? String(ride.myBid.price) : '');
  const [error, setError] = useState('');

  const bid = useMutation({
    mutationFn: () => driverApi.bid(ride._id, { price: Number(price) }),
    onSuccess: onChanged,
    onError: (err) => setError(err.message),
  });

  const withdraw = useMutation({
    mutationFn: () => driverApi.withdraw(ride._id),
    onSuccess: onChanged,
    onError: (err) => setError(err.message),
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="urdu text-sm text-gray-700">
        <span className="text-gray-400">سے: </span>
        {ride.pickupText}
      </p>
      <p className="urdu text-sm text-gray-700">
        <span className="text-gray-400">تک: </span>
        {ride.dropoffText}
      </p>
      {ride.whenText && <p className="urdu mt-1 text-xs text-gray-500">کب: {ride.whenText}</p>}
      {ride.note && <p className="urdu mt-1 text-xs text-gray-500">{ride.note}</p>}

      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
        <span className="urdu">{ride.bidCount} پیشکشیں</span>
        {ride.myBid && (
          <span className="urdu rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">
            آپ کی: {formatPrice(ride.myBid.price)}
          </span>
        )}
      </div>

      {error && <p className="urdu mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-3 flex gap-2">
        <input
          dir="ltr"
          inputMode="numeric"
          placeholder="کرایہ"
          value={price}
          onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))}
          className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-center outline-none focus:border-brand"
        />
        <button
          onClick={() => {
            setError('');
            bid.mutate();
          }}
          disabled={bid.isPending || !price}
          className="urdu flex-1 rounded-lg bg-brand py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {ride.myBid ? 'قیمت بدلیں' : 'پیشکش بھیجیں'}
        </button>
        {ride.myBid && (
          <button
            onClick={() => {
              setError('');
              withdraw.mutate();
            }}
            disabled={withdraw.isPending}
            className="urdu rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 disabled:opacity-50"
          >
            واپس
          </button>
        )}
      </div>
    </div>
  );
}
