import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { placesApi } from '../../api/index.js';
import DataTable from '../components/DataTable.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Loader, { ErrorState } from '../../components/Loader.jsx';

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: '', label: 'All' },
];

const EMPTY = {
  name: '',
  categoryId: '',
  address: '',
  phone: '',
  googleMapsUrl: '',
  hours: '',
  status: 'approved',
};

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-gray-200 text-gray-600',
};

export default function Places() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('pending');
  const [modal, setModal] = useState(null); // null | { id }
  const [form, setForm] = useState(EMPTY);
  const [toDelete, setToDelete] = useState(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const { data: categories = [] } = useQuery({
    queryKey: ['place-categories', 'admin'],
    queryFn: () => placesApi.categories(),
  });

  const {
    data: places = [],
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['admin-places', tab],
    queryFn: () => placesApi.adminList(tab ? { status: tab } : {}),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-places'] });
    qc.invalidateQueries({ queryKey: ['places'] });
    qc.invalidateQueries({ queryKey: ['place-categories'] });
  };

  const saveMut = useMutation({
    mutationFn: ({ id, payload }) =>
      id ? placesApi.update(id, payload) : placesApi.create(payload),
    onSuccess: () => {
      invalidate();
      setModal(null);
    },
    onError: (err) => setError(err.message),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => placesApi.setStatus(id, status),
    onSuccess: invalidate,
    onError: (err) => setActionError(err.message),
  });

  const removeMut = useMutation({
    mutationFn: (id) => placesApi.remove(id),
    onSuccess: () => {
      invalidate();
      setToDelete(null);
    },
    onError: (err) => {
      setToDelete(null);
      setActionError(err.message);
    },
  });

  const open = (place) => {
    setError('');
    if (place) {
      setForm({
        name: place.name,
        categoryId: place.category?._id || '',
        address: place.address || '',
        phone: place.phone || '',
        googleMapsUrl: place.googleMapsUrl || '',
        hours: place.hours || '',
        status: place.status,
      });
      setModal({ id: place._id });
    } else {
      setForm(EMPTY);
      setModal({ id: null });
    }
  };

  const submit = (e) => {
    e.preventDefault();
    setError('');
    const payload = { ...form, categoryId: form.categoryId || null };
    saveMut.mutate({ id: modal.id, payload });
  };

  const columns = [
    { key: 'name', header: 'Name', render: (r) => <span className="urdu font-medium">{r.name}</span> },
    { key: 'category', header: 'Category', render: (r) => <span className="urdu">{r.category?.name || '—'}</span> },
    { key: 'address', header: 'Address', render: (r) => <span className="text-xs text-gray-500">{r.address || '—'}</span> },
    {
      key: 'map',
      header: 'Map',
      render: (r) =>
        r.googleMapsUrl ? (
          <a href={r.googleMapsUrl} target="_blank" rel="noreferrer" className="text-xs text-brand hover:underline">
            View
          </a>
        ) : (
          '—'
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_BADGE[r.status]}`}>{r.status}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap gap-2">
          {r.status !== 'approved' && (
            <button
              onClick={() => statusMut.mutate({ id: r._id, status: 'approved' })}
              className="rounded border border-green-300 px-2 py-1 text-xs text-green-700 hover:bg-green-50"
            >
              ✓ Approve
            </button>
          )}
          {r.status !== 'rejected' && (
            <button
              onClick={() => statusMut.mutate({ id: r._id, status: 'rejected' })}
              className="rounded border border-amber-300 px-2 py-1 text-xs text-amber-700 hover:bg-amber-50"
            >
              ✕ Reject
            </button>
          )}
          <button
            onClick={() => open(r)}
            className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            onClick={() => setToDelete(r)}
            className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Places</h1>
        <button
          onClick={() => open(null)}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + New Place
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              tab === t.key ? 'bg-brand text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{actionError}</div>
      )}

      {isLoading ? (
        <Loader label="Loading…" />
      ) : isError ? (
        <ErrorState error={queryError} onRetry={refetch} />
      ) : (
        <DataTable columns={columns} rows={places} empty="No places in this view" />
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={submit} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-ink">{modal.id ? 'Edit Place' : 'New Place'}</h3>
            {error && (
              <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}
            <div className="space-y-3">
              <input
                dir="rtl"
                required
                placeholder="نام (place name)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
              />
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
              >
                <option value="">— Category —</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
              <input
                dir="rtl"
                placeholder="پتہ (address)"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <input
                dir="ltr"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <input
                dir="ltr"
                type="url"
                placeholder="Google Maps link (https://...)"
                value={form.googleMapsUrl}
                onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <input
                dir="rtl"
                placeholder="اوقات (hours)"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
                className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <label className="block text-sm">
                Status:
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="ml-2 rounded-lg border border-gray-300 px-2 py-1 text-sm"
                >
                  <option value="pending">pending</option>
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                </select>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveMut.isPending}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
              >
                {saveMut.isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete place?"
        message={toDelete ? `“${toDelete.name}” will be removed.` : ''}
        loading={removeMut.isPending}
        onConfirm={() => removeMut.mutate(toDelete._id)}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
