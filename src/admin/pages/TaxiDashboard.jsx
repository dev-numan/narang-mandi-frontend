import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminTaxiApi } from '../../api/index.js';
import { getSocket, ensureAuth } from '../../api/socket.js';
import StatCard from '../components/StatCard.jsx';
import { DailyBars, Funnel, StatusBar } from '../components/TaxiChart.jsx';
import Loader, { ErrorState } from '../../components/Loader.jsx';
import { money, ago, duration } from '../taxiUtils.jsx';

const RANGES = [
  { key: 7, label: '7 days' },
  { key: 30, label: '30 days' },
  { key: 90, label: '90 days' },
];

export default function TaxiDashboard() {
  const [days, setDays] = useState(7);
  const queryClient = useQueryClient();

  const statsQuery = useQuery({
    queryKey: ['admin', 'taxi', 'stats', days],
    queryFn: () => adminTaxiApi.stats({ days }),
  });
  const driversQuery = useQuery({
    queryKey: ['admin', 'taxi', 'drivers'],
    queryFn: () => adminTaxiApi.drivers(),
  });
  const openQuery = useQuery({
    queryKey: ['admin', 'taxi', 'rides', 'open'],
    queryFn: () => adminTaxiApi.rides({ status: 'open', limit: 50 }),
  });

  // The admin is already allowed into the drivers board (see lib/socket.js), so
  // live updates need no new server plumbing. The events carry only a ride id —
  // everything shown here is re-fetched through the authenticated API.
  useEffect(() => {
    const socket = ensureAuth();
    const join = () => socket.emit('drivers:join');
    join();
    socket.on('connect', join);

    const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin', 'taxi'] });
    const events = ['board:new', 'board:assigned', 'board:completed', 'board:cancelled'];
    events.forEach((e) => socket.on(e, refresh));

    return () => {
      socket.off('connect', join);
      events.forEach((e) => socket.off(e, refresh));
    };
  }, [queryClient]);

  const loading = statsQuery.isLoading || driversQuery.isLoading;
  const isError = statsQuery.isError || driversQuery.isError;
  const retry = () => {
    statsQuery.refetch();
    driversQuery.refetch();
    openQuery.refetch();
  };

  const s = statsQuery.data;
  const drivers = driversQuery.data || [];
  const openRides = openQuery.data?.data || [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Taxi</h1>
          <p className="text-sm text-gray-500">
            Live ride activity, driver performance and delivery health
            {getSocket().connected ? (
              <span className="ml-2 inline-flex items-center gap-1 text-green-600">
                <i className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" /> live
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/taxi/drivers"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-gray-50"
          >
            Drivers
          </Link>
          <Link
            to="/admin/taxi/rides"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            All rides
          </Link>
        </div>
      </div>

      {loading ? (
        <Loader label="Loading…" />
      ) : isError ? (
        <ErrorState error={statsQuery.error || driversQuery.error} onRetry={retry} />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Rides today" value={s.today.rides} icon="🚕" accent="bg-brand" />
            <StatCard label="Bids today" value={s.today.bids} icon="💰" accent="bg-sky-600" />
            <StatCard label="Open right now" value={s.openNow} icon="⏳" accent="bg-amber-500" />
            <StatCard label="Completed today" value={s.today.completed} icon="✅" accent="bg-green-600" />
            <StatCard label="Active drivers" value={s.drivers.active} icon="🧑‍✈️" accent="bg-purple-600" />
            <StatCard
              label="Reachable drivers"
              value={`${s.drivers.reachable}/${s.drivers.active}`}
              icon="📲"
              accent={s.drivers.reachable < s.drivers.active / 2 ? 'bg-red-600' : 'bg-slate-600'}
            />
          </div>

          <Attention stats={s} drivers={drivers} openRides={openRides} />

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink">Activity</h2>
            <div className="flex gap-2">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setDays(r.key)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
                    days === r.key ? 'bg-brand text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
            <DailyBars series={s.series} />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Panel title="Conversion funnel" hint={`Last ${s.days} days`}>
              <Funnel
                stages={[
                  { label: 'Rides requested', value: s.window.rides, fill: '#b91c1c' },
                  { label: 'Received a bid', value: s.window.ridesWithBids, fill: '#0284c7' },
                  { label: 'Driver assigned', value: s.window.assigned + s.window.completed, fill: '#7c3aed' },
                  { label: 'Completed', value: s.window.completed, fill: '#16a34a' },
                ]}
              />
              {s.window.ridesWithoutBids > 0 && (
                <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                  <b>{s.window.ridesWithoutBids}</b> of {s.window.rides} rides got no bid at all.
                </p>
              )}
            </Panel>

            <Panel title="Ride outcomes" hint={`Last ${s.days} days`}>
              <StatusBar
                segments={[
                  { label: 'Completed', value: s.window.completed, fill: '#16a34a' },
                  { label: 'Open', value: s.window.open, fill: '#0284c7' },
                  { label: 'Assigned', value: s.window.assigned, fill: '#f59e0b' },
                  { label: 'Cancelled by customer', value: s.cancellations.customer || 0, fill: '#6b7280' },
                  { label: 'Expired (no action)', value: s.cancellations.system || 0, fill: '#d1d5db' },
                ]}
              />
              {/* The raw "cancelled" count conflates two different failures, so
                  the split is spelled out rather than left to the legend. */}
              {(s.cancellations.system || 0) > 0 && (
                <p className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                  <b>{s.cancellations.system}</b> rides were never answered and timed out on their own —
                  these are not customer cancellations.
                </p>
              )}
            </Panel>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Panel title="Bid prices" hint={`${s.window.bids} bids from ${s.window.biddingDrivers} drivers`}>
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Metric label="Lowest" value={money(s.prices.min)} />
                <Metric label="Median" value={money(s.prices.median)} />
                <Metric label="Highest" value={money(s.prices.max)} />
                <Metric label="Avg agreed" value={money(s.prices.avgAgreed)} />
              </dl>
            </Panel>
            <NotificationHealth stats={s} />
          </div>

          <div className="mb-6">
            <WhatsAppCost stats={s} />
          </div>

          {openRides.length > 0 && <OpenRides rides={openRides} />}
        </>
      )}
    </div>
  );
}

/**
 * The things an admin should look at right now.
 *
 * Every row here is a defect the raw tables cannot show on their own: a driver
 * nobody can reach, a profile that passed verification with nothing in it, a
 * ride about to expire on top of a bid the customer never answered.
 */
function Attention({ stats, drivers, openRides }) {
  const active = drivers.filter((d) => d.isActive);
  const unreachable = active.filter((d) => !d.deviceTokenCount);
  const noPhoto = active.filter((d) => !(d.photo || '').trim());
  const verifiedThin = active.filter((d) => d.isVerified && !(d.vehicleType || '').trim() && !(d.photo || '').trim());

  // Same person, two logins: they get every notification twice and can bid twice
  // on one ride, because the per-ride unique key sees two different driver ids.
  const byPhone = {};
  active.forEach((d) => {
    const key = String(d.phone || '').replace(/\D/g, '');
    if (key) (byPhone[key] ||= []).push(d);
  });
  const duplicates = Object.values(byPhone).filter((g) => g.length > 1);

  const expiringSoon = openRides.filter((r) => {
    if (!r.expiresAt) return false;
    const left = new Date(r.expiresAt) - Date.now();
    return left > 0 && left < 2 * 60 * 60 * 1000 && r.bidCount > 0;
  });

  const failed = stats.notifications
    .filter((n) => n.status === 'failed')
    .reduce((sum, n) => sum + n.count, 0);

  const items = [
    expiringSoon.length && {
      tone: 'red',
      label: `${expiringSoon.length} ride(s) expiring within 2h with an unanswered bid`,
      to: '/admin/taxi/rides',
    },
    failed && {
      tone: 'red',
      label: `${failed} notifications failed to send in the last ${stats.days} days`,
      detail: stats.recentErrors[0]?.error?.slice(0, 160),
    },
    unreachable.length && {
      tone: 'amber',
      label: `${unreachable.length} active driver(s) have no app installed — push cannot reach them`,
      to: '/admin/taxi/drivers',
    },
    noPhoto.length && {
      tone: 'amber',
      label: `${noPhoto.length} active driver(s) have no vehicle photo`,
      to: '/admin/taxi/drivers',
    },
    stats.drivers.noVehicleType && {
      tone: 'amber',
      label: `${stats.drivers.noVehicleType} active driver(s) never set a vehicle type`,
      to: '/admin/taxi/drivers',
    },
    verifiedThin.length && {
      tone: 'red',
      label: `${verifiedThin.length} driver(s) are verified with no photo and no vehicle type`,
      to: '/admin/taxi/drivers',
    },
    duplicates.length && {
      tone: 'amber',
      label: `${duplicates.length} phone number(s) have more than one driver account`,
      detail: duplicates.map((g) => g.map((d) => d.name).join(' + ')).join(' · '),
      to: '/admin/taxi/drivers',
    },
  ].filter(Boolean);

  if (!items.length) {
    return (
      <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        ✅ Nothing needs attention right now.
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-ink">Needs attention</h2>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li
            key={i}
            className={`rounded-lg border p-3 text-sm ${
              it.tone === 'red' ? 'border-red-200 bg-red-50 text-red-800' : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>{it.label}</span>
              {it.to && (
                <Link to={it.to} className="shrink-0 font-semibold underline">
                  View
                </Link>
              )}
            </div>
            {it.detail && <p className="mt-1 break-words font-mono text-xs opacity-75">{it.detail}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

/// Delivery health per channel. A channel failing here means drivers or
/// customers are simply never told, which looks identical to disinterest.
function NotificationHealth({ stats }) {
  const byChannel = {};
  stats.notifications.forEach((n) => {
    const c = (byChannel[n.channel] ||= { sent: 0, failed: 0, skipped: 0 });
    c[n.status] = (c[n.status] || 0) + n.count;
  });
  const channels = Object.entries(byChannel);

  return (
    <Panel title="Notification delivery" hint={`Last ${stats.days} days`}>
      {channels.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">Nothing sent in this period</p>
      ) : (
        <div className="space-y-3">
          {channels.map(([channel, c]) => {
            const total = c.sent + c.failed + c.skipped;
            return (
              <div key={channel}>
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span className="font-medium capitalize text-ink">{channel}</span>
                  <span className="text-xs text-gray-500">
                    {c.sent} sent · {c.failed} failed · {c.skipped} skipped
                  </span>
                </div>
                <div className="flex h-2 overflow-hidden rounded-full bg-gray-100">
                  <div style={{ width: `${(c.sent / total) * 100}%`, background: '#16a34a' }} />
                  <div style={{ width: `${(c.failed / total) * 100}%`, background: '#dc2626' }} />
                  <div style={{ width: `${(c.skipped / total) * 100}%`, background: '#d1d5db' }} />
                </div>
              </div>
            );
          })}
          {stats.recentErrors.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Recent errors</p>
              {stats.recentErrors.slice(0, 3).map((e, i) => (
                <p key={i} className="break-words rounded-lg bg-red-50 p-2 font-mono text-[11px] text-red-800">
                  <b className="capitalize">{e.channel}</b> · {e.event} — {String(e.error).slice(0, 200)}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}

/**
 * What WhatsApp is costing.
 *
 * Meta's API reports message counts but never prices, so this is derived from
 * our own delivery log and priced with published rates — an estimate to size the
 * spend against, not a bill. The real invoice lives in Meta's billing console.
 */
function WhatsAppCost({ stats }) {
  const b = stats.billing;
  const perDay = b.estimatedUsd / stats.days;

  return (
    <Panel title="WhatsApp cost" hint={`Last ${stats.days} days · estimated`}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Metric label="Est. spend" value={`$${b.estimatedUsd.toFixed(3)}`} />
        <Metric label="Conversations" value={b.conversations} />
        <Metric label="Messages accepted" value={b.messagesAccepted} />
        <Metric label="Failed (free)" value={b.failedFree} />
      </div>

      <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-4 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>
            Utility conversations <span className="text-gray-400">@ ${b.rates.utility}</span>
          </span>
          <b className="text-ink" dir="ltr">
            {b.utilityConversations} · ${(b.utilityConversations * b.rates.utility).toFixed(3)}
          </b>
        </div>
        <div className="flex justify-between">
          <span>
            Marketing conversations <span className="text-gray-400">@ ${b.rates.marketing}</span>
          </span>
          <b className="text-ink" dir="ltr">
            {b.marketingConversations} · ${(b.marketingConversations * b.rates.marketing).toFixed(3)}
          </b>
        </div>
        <div className="flex justify-between border-t border-gray-100 pt-1.5">
          <span>Projected monthly at this rate</span>
          <b className="text-ink" dir="ltr">
            ${(perDay * 30).toFixed(2)}
          </b>
        </div>
      </div>

      {b.marketingConversations > 0 && (
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
          Marketing-category templates cost roughly twice utility. Ride alerts are transactional and
          belong in utility — recategorising them halves this line.
        </p>
      )}

      <p className="mt-3 text-[11px] text-gray-400">
        Billing is per recipient per 24h, so repeated alerts to one driver in a day count once. Failed
        and skipped sends are never charged. Figures are estimates from our delivery log at published
        rates — Meta does not expose actual charges over the API.
      </p>
    </Panel>
  );
}

function OpenRides({ rides }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-ink">Open right now ({rides.length})</h2>
      <div className="space-y-2">
        {rides.map((r) => (
          <Link
            key={r._id}
            to={`/admin/taxi/rides/${r._id}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-3 text-sm hover:bg-gray-50"
          >
            <div className="min-w-0">
              <span className="font-mono text-xs text-gray-500" dir="ltr">
                {r.rideCode}
              </span>
              <p className="urdu truncate font-medium text-ink">
                {r.pickupText} ← {r.dropoffText}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4 text-xs">
              <span className={r.bidCount ? 'font-semibold text-sky-700' : 'text-gray-400'}>
                {r.bidCount} bid{r.bidCount === 1 ? '' : 's'}
              </span>
              <span className="text-gray-500">{ago(r.createdAt)} old</span>
              {r.expiresAt && (
                <span className="text-gray-500">
                  expires in {duration((new Date(r.expiresAt) - Date.now()) / 1000)}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Panel({ title, hint, children }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-lg font-bold text-ink" dir="ltr">
        {value}
      </dd>
    </div>
  );
}
