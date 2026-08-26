import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminTaxiApi } from '../../api/index.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Loader, { ErrorState } from '../../components/Loader.jsx';
import { pktDateTime, displayPhone, waNumber } from '../taxiUtils.jsx';

const SORTS = [
  { key: 'bids', label: 'Most bids' },
  { key: 'wins', label: 'Most wins' },
  { key: 'newest', label: 'Newest' },
  { key: 'incomplete', label: 'Needs attention' },
];

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  phone: '',
  whatsapp: '',
  vehicleType: '',
  vehicleNumber: '',
  isVerified: false,
};

export default function TaxiDrivers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('bids');
  const [lightbox, setLightbox] = useState(null);
  const [form, setForm] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [newPassword, setNewPassword] = useState(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'taxi', 'drivers'],
    queryFn: () => adminTaxiApi.drivers(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'taxi'] });

  const verifyMut = useMutation({
    mutationFn: ({ id, isVerified }) => adminTaxiApi.updateDriver(id, { isVerified }),
    onSuccess: invalidate,
  });
  const activeMut = useMutation({
    mutationFn: ({ id, isActive }) => adminTaxiApi.setDriverStatus(id, isActive),
    onSuccess: invalidate,
  });
  const passwordMut = useMutation({
    mutationFn: (id) => adminTaxiApi.resetDriverPassword(id),
    onSuccess: (res, id) => {
      const d = (data || []).find((x) => x._id === id);
      setNewPassword({ name: d?.name, email: d?.email, password: res.password });
      setConfirm(null);
    },
  });
  const createMut = useMutation({
    mutationFn: (payload) => adminTaxiApi.createDriver(payload),
    onSuccess: () => {
      invalidate();
      setForm(null);
    },
  });

  const drivers = data || [];

  // Same phone on two logins means double notifications and two bids on one
  // ride, since the per-ride unique key is on driver id, not on the person.
  const duplicatePhones = useMemo(() => {
    const seen = {};
    drivers.forEach((d) => {
      const key = String(d.phone || '').replace(/\D/g, '');
      if (key) seen[key] = (seen[key] || 0) + 1;
    });
    return new Set(Object.entries(seen).filter(([, n]) => n > 1).map(([k]) => k));
  }, [drivers]);

  const flagsFor = (d) => {
    const flags = [];
    if (!(d.photo || '').trim()) flags.push('no photo');
    if (!(d.vehicleType || '').trim()) flags.push('no vehicle type');
    if (!(d.vehicleNumber || '').trim()) flags.push('no vehicle number');
    if (!d.deviceTokenCount) flags.push('app not installed');
    if (duplicatePhones.has(String(d.phone || '').replace(/\D/g, ''))) flags.push('duplicate phone');
    return flags;
  };

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = drivers.filter(
      (d) =>
        !q ||
        [d.name, d.email, d.phone, d.vehicleNumber, d.vehicleType]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
    );
    const sorted = [...rows];
    if (sort === 'bids') sorted.sort((a, b) => (b.bidCount || 0) - (a.bidCount || 0));
    else if (sort === 'wins') sorted.sort((a, b) => (b.wins || 0) - (a.wins || 0));
    else if (sort === 'newest') sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sort === 'incomplete') sorted.sort((a, b) => flagsFor(b).length - flagsFor(a).length);
    return sorted;
  }, [drivers, search, sort, duplicatePhones]);

  const active = drivers.filter((d) => d.isActive).length;
  const withPhoto = drivers.filter((d) => d.isActive && (d.photo || '').trim()).length;
  const reachable = drivers.filter((d) => d.isActive && d.deviceTokenCount).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Drivers</h1>
          <p className="text-sm text-gray-500">
            {drivers.length} total · {active} active · {withPhoto} with a photo · {reachable} reachable by push
          </p>
        </div>
        <button
          onClick={() => setForm(EMPTY_FORM)}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + Add driver
        </button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, phone or vehicle…"
          className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-brand focus:outline-none"
        />
        {SORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSort(s.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              sort === s.key ? 'bg-brand text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loader label="Loading drivers…" />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {visible.map((d) => (
            <DriverCard
              key={d._id}
              driver={d}
              flags={flagsFor(d)}
              onPhoto={() => setLightbox(d)}
              onVerify={() => verifyMut.mutate({ id: d._id, isVerified: !d.isVerified })}
              onActive={() => activeMut.mutate({ id: d._id, isActive: !d.isActive })}
              onPassword={() => setConfirm(d)}
              busy={verifyMut.isPending || activeMut.isPending}
            />
          ))}
          {visible.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-gray-400">No drivers match.</p>
          )}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="max-h-full max-w-lg overflow-auto text-center" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.photo} alt="" className="mx-auto max-h-[75vh] rounded-lg" />
            <p className="mt-3 text-sm text-white">
              {lightbox.name} · {lightbox.vehicleType || 'no vehicle type'} {lightbox.vehicleNumber}
            </p>
            <button onClick={() => setLightbox(null)} className="mt-3 text-xs text-gray-300 underline">
              Close
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Reset password?"
        message={`A new password is generated for ${confirm?.name}. Their current password stops working immediately, and the new one is shown only once.`}
        confirmLabel="Reset password"
        cancelLabel="Back"
        danger={false}
        loading={passwordMut.isPending}
        onConfirm={() => passwordMut.mutate(confirm._id)}
        onCancel={() => setConfirm(null)}
      />

      {newPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-ink">New password</h3>
            <p className="mt-1 text-sm text-gray-600">
              Read this out to {newPassword.name}. It cannot be shown again.
            </p>
            <dl className="mt-4 space-y-2 rounded-lg bg-gray-50 p-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Email</dt>
                <dd className="font-mono text-ink" dir="ltr">
                  {newPassword.email}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Password</dt>
                <dd className="font-mono text-lg font-bold text-ink" dir="ltr">
                  {newPassword.password}
                </dd>
              </div>
            </dl>
            <button
              onClick={() => setNewPassword(null)}
              className="mt-5 w-full rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {form && (
        <DriverForm
          form={form}
          setForm={setForm}
          onSubmit={() => createMut.mutate(form)}
          loading={createMut.isPending}
          error={createMut.error}
        />
      )}
    </div>
  );
}

function DriverCard({ driver: d, flags, onPhoto, onVerify, onActive, onPassword, busy }) {
  const wa = waNumber(d.whatsapp || d.phone);
  return (
    <div className={`rounded-xl bg-white p-4 shadow-sm ${d.isActive ? '' : 'opacity-60'}`}>
      <div className="flex gap-4">
        {d.photo ? (
          <button onClick={onPhoto} className="shrink-0">
            <img src={d.photo} alt="" className="h-20 w-20 rounded-lg object-cover hover:opacity-90" />
          </button>
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-2xl text-gray-300">
            🚗
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-ink">{d.name}</h3>
            {d.isVerified && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
                verified
              </span>
            )}
            {!d.isActive && (
              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                suspended
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500" dir="ltr">
            {displayPhone(d.phone)}
          </p>
          <p className="urdu text-xs leading-[2] text-gray-500">
            {d.vehicleType || <span className="font-sans italic text-gray-400">no vehicle type</span>}
            {d.vehicleNumber ? <span className="font-sans"> · {d.vehicleNumber}</span> : ''}
          </p>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
            <span>
              <b className="text-ink">{d.bidCount || 0}</b> bids
            </span>
            <span>
              <b className="text-ink">{d.wins || 0}</b> won
            </span>
            <span>
              <b className="text-ink">{d.completedRides || 0}</b> completed
            </span>
            <span className="text-gray-400">joined {pktDateTime(d.createdAt).split(',')[0]}</span>
          </div>

          {flags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {flags.map((f) => (
                <span key={f} className="rounded bg-amber-50 px-1.5 py-0.5 text-[11px] text-amber-800">
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
        <button
          onClick={onVerify}
          disabled={busy}
          className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-50"
        >
          {d.isVerified ? 'Unverify' : 'Verify'}
        </button>
        <button
          onClick={onActive}
          disabled={busy}
          className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-50"
        >
          {d.isActive ? 'Suspend' : 'Activate'}
        </button>
        <button
          onClick={onPassword}
          className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
        >
          Reset password
        </button>
        {wa && (
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noreferrer"
            className="rounded border border-green-300 px-2 py-1 text-xs text-green-700 hover:bg-green-50"
          >
            WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

function DriverForm({ form, setForm, onSubmit, loading, error }) {
  const set = (k) => (e) =>
    setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-full w-full max-w-md overflow-auto rounded-xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-bold text-ink">Add driver</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-3"
        >
          <Input label="Name" value={form.name} onChange={set('name')} required />
          <Input label="Email" type="email" value={form.email} onChange={set('email')} required />
          <Input label="Password" value={form.password} onChange={set('password')} required minLength={6} />
          <Input label="Phone" value={form.phone} onChange={set('phone')} placeholder="03001234567" />
          <Input label="WhatsApp" value={form.whatsapp} onChange={set('whatsapp')} placeholder="03001234567" />
          <Input label="Vehicle type" value={form.vehicleType} onChange={set('vehicleType')} placeholder="کار / رکشہ" />
          <Input label="Vehicle number" value={form.vehicleNumber} onChange={set('vehicleNumber')} />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.isVerified} onChange={set('isVerified')} />
            Mark as verified
          </label>

          {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error.message}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setForm(null)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {loading ? 'Creating…' : 'Create driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      <input
        {...props}
        className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-brand focus:outline-none"
      />
    </label>
  );
}
