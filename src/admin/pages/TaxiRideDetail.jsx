import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminTaxiApi } from '../../api/index.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Loader, { ErrorState } from '../../components/Loader.jsx';
import {
  pktDateTime,
  pktTime,
  duration,
  gap,
  money,
  displayPhone,
  waNumber,
  isExpired,
  StatusPill,
} from '../taxiUtils.jsx';

/// Plain-language names for the append-only event log.
const EVENT_LABELS = {
  ride_created: 'Ride requested',
  bid_placed: 'Bid placed',
  bid_revised: 'Bid revised',
  bid_withdrawn: 'Bid withdrawn',
  bid_accepted: 'Bid accepted',
  ride_completed: 'Ride completed',
  ride_cancelled: 'Ride cancelled',
};

const NOTIF_LABELS = {
  ride_new: 'New ride → drivers',
  ride_bid: 'Bid received → customer',
  ride_assigned: 'Ride assigned',
  ride_bid_rejected: 'Bid rejected → driver',
  ride_cancelled: 'Ride cancelled → driver',
};

export default function TaxiRideDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [confirm, setConfirm] = useState(null);

  const { data: ride, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'taxi', 'ride', id],
    queryFn: () => adminTaxiApi.ride(id),
  });

  const statusMut = useMutation({
    mutationFn: (status) => adminTaxiApi.setRideStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'taxi'] });
      setConfirm(null);
    },
  });

  if (isLoading) return <Loader label="Loading ride…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const expired = isExpired(ride);
  const wa = waNumber(ride.customerPhone);
  const canClose = ride.status === 'open' || ride.status === 'assigned';

  return (
    <div>
      <div className="mb-6">
        <Link to="/admin/taxi/rides" className="text-sm text-gray-500 hover:text-brand">
          ← All rides
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-mono text-2xl font-bold text-ink" dir="ltr">
                {ride.rideCode}
              </h1>
              <StatusPill status={ride.status} expired={expired} />
            </div>
            <p className="urdu mt-1 text-lg leading-[2] text-gray-700">
              {ride.pickupText} <span className="text-gray-400">←</span> {ride.dropoffText}
            </p>
          </div>
          {canClose && (
            <div className="flex gap-2">
              <button
                onClick={() => setConfirm('completed')}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                Mark completed
              </button>
              <button
                onClick={() => setConfirm('cancelled')}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                Cancel ride
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Customer">
          <Field label="Name" value={ride.customerName || '—'} />
          <Field label="Phone" value={displayPhone(ride.customerPhone)} ltr />
          {wa && (
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100"
            >
              Message on WhatsApp
            </a>
          )}
          {/* A ride with no device token could only ever be reached on WhatsApp,
              which matters when reading why a customer never responded. */}
          <p className="mt-3 text-xs text-gray-500">
            App installed: <b>{ride.deviceToken === undefined ? 'unknown' : 'see delivery log'}</b>
          </p>
        </Card>

        <Card title="Trip">
          <Field label="Requested for" value={ride.whenText || '—'} urdu />
          <Field label="Requested at" value={pktDateTime(ride.createdAt)} />
          <Field label="Expires" value={pktDateTime(ride.expiresAt)} />
          {ride.note && <Field label="Note" value={ride.note} urdu />}
        </Card>

        <Card title="Outcome">
          <Field label="Bids" value={ride.bids?.length ?? ride.bidCount ?? 0} />
          <Field label="Agreed fare" value={ride.agreedPrice ? money(ride.agreedPrice) : '—'} ltr />
          <Field label="Driver" value={ride.driver?.name || 'Not assigned'} />
          {ride.status === 'cancelled' && (
            <Field
              label="Cancelled by"
              value={ride.cancelledBy === 'system' ? 'Timed out (no action)' : ride.cancelledBy || '—'}
            />
          )}
          {ride.cancelReason && <Field label="Reason" value={ride.cancelReason} urdu />}
        </Card>
      </div>

      <Bids ride={ride} />
      <Timeline ride={ride} />

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm === 'cancelled' ? 'Cancel this ride?' : 'Mark ride completed?'}
        message={
          confirm === 'cancelled'
            ? 'The assigned driver is notified and every active bid is rejected. This cannot be undone.'
            : 'This closes the ride as completed. This cannot be undone.'
        }
        confirmLabel={confirm === 'cancelled' ? 'Cancel ride' : 'Mark completed'}
        cancelLabel="Back"
        danger={confirm === 'cancelled'}
        loading={statusMut.isPending}
        onConfirm={() => statusMut.mutate(confirm)}
        onCancel={() => setConfirm(null)}
      />
      {statusMut.isError && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{statusMut.error.message}</p>
      )}
    </div>
  );
}

/// Bids, ordered by when they arrived rather than by price, because the point
/// here is how fast drivers responded and how the price moved over time.
function Bids({ ride }) {
  const bids = useMemo(
    () => [...(ride.bids || [])].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    [ride.bids]
  );
  const best = Math.min(...bids.map((b) => b.price));

  if (!bids.length) {
    return (
      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-ink">Bids</h2>
        <p className="py-6 text-center text-sm text-gray-400">
          No driver bid on this ride.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-ink">Bids ({bids.length})</h2>
      <div className="space-y-3">
        {bids.map((b) => (
          <div
            key={b._id}
            className={`flex flex-wrap items-center gap-4 rounded-lg border p-3 ${
              b.status === 'accepted' ? 'border-green-300 bg-green-50' : 'border-gray-200'
            }`}
          >
            {b.driver?.photo ? (
              <img src={b.driver.photo} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg text-gray-400">
                🚗
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink">{b.driver?.name || '—'}</p>
              <p className="text-xs text-gray-500">
                <span dir="ltr">{displayPhone(b.driver?.phone)}</span>
                {b.driver?.vehicleType ? ` · ${b.driver.vehicleType}` : ''}
                {b.driver?.vehicleNumber ? ` · ${b.driver.vehicleNumber}` : ''}
              </p>
            </div>

            <div className="text-right">
              <p
                className={`text-lg font-bold ${b.price === best ? 'text-green-700' : 'text-ink'}`}
                dir="ltr"
              >
                {money(b.price)}
              </p>
              <p className="text-xs text-gray-500">
                {b.etaMinutes ? `${b.etaMinutes} min away` : 'no ETA given'}
              </p>
            </div>

            <div className="w-full border-t border-gray-100 pt-2 text-xs text-gray-500 sm:w-auto sm:border-0 sm:pt-0">
              {/* The gap between the request and the bid is the supply-side
                  responsiveness number — the one worth watching. */}
              <p>
                <b className="text-ink">+{gap(ride.createdAt, b.createdAt)}</b> after request
              </p>
              <p>
                {pktTime(b.createdAt)}
                {b.reviseCount > 0 && ` · revised ${b.reviseCount}×`}
              </p>
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
                  b.status === 'accepted'
                    ? 'bg-green-200 text-green-800'
                    : b.status === 'active'
                      ? 'bg-sky-100 text-sky-700'
                      : 'bg-gray-100 text-gray-500'
                }`}
              >
                {b.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Events and notification attempts merged into one ordered stream.
 *
 * Keeping them apart hides the thing that matters most: whether the customer was
 * actually told about a bid before they walked away. Interleaved, a failed
 * WhatsApp sits directly under the bid it failed to announce.
 */
function Timeline({ ride }) {
  const rows = useMemo(() => {
    const events = (ride.events || []).map((e) => ({
      at: e.createdAt,
      kind: 'event',
      title: EVENT_LABELS[e.type] || e.type,
      detail: [e.actor && `by ${e.actor}`, e.price ? money(e.price) : null].filter(Boolean).join(' · '),
    }));

    const notifs = (ride.notifications || []).map((n) => ({
      at: n.createdAt,
      kind: 'notif',
      status: n.status,
      title: `${NOTIF_LABELS[n.event] || n.event} · ${n.channel}`,
      detail: n.error || n.target || '',
    }));

    return [...events, ...notifs].sort((a, b) => new Date(a.at) - new Date(b.at));
  }, [ride.events, ride.notifications]);

  // The driver fan-out writes one row per driver per channel, which buries the
  // ride's own story under dozens of identical lines. They are folded into a
  // single summary and the detail stays available in the counts.
  const collapsed = [];
  for (const row of rows) {
    const prev = collapsed[collapsed.length - 1];
    if (prev && prev.kind === 'notif' && row.kind === 'notif' && prev.title === row.title && prev.status === row.status) {
      prev.count = (prev.count || 1) + 1;
      prev.at = row.at;
      continue;
    }
    collapsed.push({ ...row });
  }

  if (!collapsed.length) return null;

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-ink">Full log</h2>
      <ol className="space-y-0">
        {collapsed.map((r, i) => {
          const prev = collapsed[i - 1];
          return (
            <li key={i} className="flex gap-3 border-b border-gray-100 py-2.5 last:border-0">
              <div className="w-20 shrink-0 text-right">
                <p className="text-xs font-medium text-ink">{pktTime(r.at)}</p>
                <p className="text-[11px] text-gray-400">+{gap(ride.createdAt, r.at)}</p>
              </div>

              <div className="shrink-0 pt-1">
                <Dot row={r} />
              </div>

              <div className="min-w-0 flex-1">
                <p className={`text-sm ${r.kind === 'event' ? 'font-medium text-ink' : 'text-gray-600'}`}>
                  {r.title}
                  {r.count > 1 && <span className="ml-1 text-gray-400">×{r.count}</span>}
                  {r.kind === 'notif' && (
                    <span
                      className={`ml-2 rounded px-1.5 py-0.5 text-[11px] font-medium ${
                        r.status === 'sent'
                          ? 'bg-green-100 text-green-700'
                          : r.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {r.status}
                    </span>
                  )}
                </p>
                {r.detail && (
                  <p className={`break-words text-xs ${r.status === 'failed' ? 'font-mono text-red-600' : 'text-gray-500'}`}>
                    {String(r.detail).slice(0, 220)}
                  </p>
                )}
              </div>

              {prev && (
                <div className="hidden w-16 shrink-0 text-right text-[11px] text-gray-400 sm:block">
                  {gap(prev.at, r.at)}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-xs text-gray-400">
        Times are Pakistan time. “+” is elapsed since the ride was requested; the right column is the gap
        from the previous entry.
      </p>
    </div>
  );
}

function Dot({ row }) {
  const color =
    row.kind === 'event'
      ? 'bg-brand'
      : row.status === 'sent'
        ? 'bg-green-500'
        : row.status === 'failed'
          ? 'bg-red-500'
          : 'bg-gray-300';
  return <i className={`block h-2 w-2 rounded-full ${color}`} />;
}

function Card({ title, children }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">{title}</h2>
      <dl className="space-y-2">{children}</dl>
    </div>
  );
}

function Field({ label, value, ltr, urdu }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-xs text-gray-500">{label}</dt>
      <dd
        className={`text-right text-sm font-medium text-ink ${urdu ? 'urdu leading-[2]' : ''}`}
        dir={ltr ? 'ltr' : undefined}
      >
        {value}
      </dd>
    </div>
  );
}
