import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainsApi } from '../../api/index.js';
import DataTable from '../components/DataTable.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Loader, { ErrorState } from '../../components/Loader.jsx';

const EMPTY = {
  name: '',
  nameEn: '',
  trainType: '',
  upRoute: '',
  upNumber: '',
  upArrival: '',
  upDeparture: '',
  downRoute: '',
  downNumber: '',
  downArrival: '',
  downDeparture: '',
  classes: '',
  order: 0,
  isActive: true,
};

const field =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand';

export default function Trains() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null); // null | { id }
  const [form, setForm] = useState(EMPTY);
  const [toDelete, setToDelete] = useState(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const {
    data: trains = [],
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['trains', 'all'],
    queryFn: () => trainsApi.list(true),
  });

  const saveMut = useMutation({
    mutationFn: ({ id, payload }) => (id ? trainsApi.update(id, payload) : trainsApi.create(payload)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trains'] });
      setModal(null);
    },
    onError: (err) => setError(err.message),
  });

  const removeMut = useMutation({
    mutationFn: (id) => trainsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trains'] });
      setToDelete(null);
    },
    onError: (err) => {
      setToDelete(null);
      setActionError(err.message);
    },
  });

  const open = (t) => {
    setError('');
    setForm(t ? { ...EMPTY, ...t } : EMPTY);
    setModal({ id: t?._id || null });
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setError('');
    saveMut.mutate({ id: modal.id, payload: { ...form, order: Number(form.order) || 0 } });
  };

  const columns = [
    { key: 'name', header: 'Train', render: (r) => <span className="urdu font-medium">{r.name}</span> },
    { key: 'trainType', header: 'Type', render: (r) => <span className="urdu">{r.trainType}</span> },
    {
      key: 'up',
      header: 'Up (Arr/Dep)',
      render: (r) => <span dir="ltr">{r.upArrival} / {r.upDeparture}</span>,
    },
    {
      key: 'down',
      header: 'Down (Arr/Dep)',
      render: (r) => <span dir="ltr">{r.downArrival} / {r.downDeparture}</span>,
    },
    { key: 'order', header: 'Order' },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          <button onClick={() => open(r)} className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50">
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
        <h1 className="text-2xl font-bold text-ink">Train Timings</h1>
        <button
          onClick={() => open(null)}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + New Train
        </button>
      </div>

      {actionError && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{actionError}</div>}

      {isLoading ? (
        <Loader label="Loading…" />
      ) : isError ? (
        <ErrorState error={queryError} onRetry={refetch} />
      ) : (
        <DataTable columns={columns} rows={trains} empty="No trains yet" />
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={submit} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-ink">{modal.id ? 'Edit Train' : 'New Train'}</h3>
            {error && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

            <div className="space-y-3">
              <input dir="rtl" required placeholder="ٹرین کا نام (Urdu)" value={form.name} onChange={set('name')} className={`urdu ${field}`} />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Name (English)" value={form.nameEn} onChange={set('nameEn')} className={field} />
                <input dir="rtl" placeholder="قسم (Express/Passenger)" value={form.trainType} onChange={set('trainType')} className={`urdu ${field}`} />
              </div>
              <input dir="rtl" placeholder="کلاسز (classes)" value={form.classes} onChange={set('classes')} className={`urdu ${field}`} />

              <fieldset className="rounded-lg border border-gray-200 p-3">
                <legend className="px-1 text-sm font-semibold text-gray-600">Up direction</legend>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input dir="rtl" placeholder="روٹ (route)" value={form.upRoute} onChange={set('upRoute')} className={`urdu ${field}`} />
                    <input placeholder="Train no. (e.g. 9 Up)" value={form.upNumber} onChange={set('upNumber')} className={field} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Arrival (HH:MM)" value={form.upArrival} onChange={set('upArrival')} className={field} dir="ltr" />
                    <input placeholder="Departure (HH:MM)" value={form.upDeparture} onChange={set('upDeparture')} className={field} dir="ltr" />
                  </div>
                </div>
              </fieldset>

              <fieldset className="rounded-lg border border-gray-200 p-3">
                <legend className="px-1 text-sm font-semibold text-gray-600">Down direction</legend>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input dir="rtl" placeholder="روٹ (route)" value={form.downRoute} onChange={set('downRoute')} className={`urdu ${field}`} />
                    <input placeholder="Train no. (e.g. 10 Down)" value={form.downNumber} onChange={set('downNumber')} className={field} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Arrival (HH:MM)" value={form.downArrival} onChange={set('downArrival')} className={field} dir="ltr" />
                    <input placeholder="Departure (HH:MM)" value={form.downDeparture} onChange={set('downDeparture')} className={field} dir="ltr" />
                  </div>
                </div>
              </fieldset>

              <label className="block text-sm">
                Order:
                <input type="number" value={form.order} onChange={set('order')} className="ml-2 w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm" />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setModal(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={saveMut.isPending} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
                {saveMut.isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete train?"
        message={toDelete ? `“${toDelete.name}” will be removed.` : ''}
        loading={removeMut.isPending}
        onConfirm={() => removeMut.mutate(toDelete._id)}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
