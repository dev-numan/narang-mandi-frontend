import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminShopsApi } from '../../api/index.js';
import DataTable from '../components/DataTable.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import ImageUploader from '../components/ImageUploader.jsx';
import Loader, { ErrorState } from '../../components/Loader.jsx';

const EMPTY = {
  name: '',
  description: '',
  logo: '',
  coverImage: '',
  phone: '',
  whatsapp: '',
  address: '',
  ownerName: '',
  ownerEmail: '',
  ownerPassword: '',
};

export default function Shops() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null); // null | { id }
  const [form, setForm] = useState(EMPTY);
  const [toDelete, setToDelete] = useState(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const { data: shops = [], isLoading, isError, error: queryError, refetch } = useQuery({
    queryKey: ['admin', 'shops'],
    queryFn: () => adminShopsApi.list(),
  });

  const saveMut = useMutation({
    mutationFn: ({ id, payload }) =>
      id ? adminShopsApi.update(id, payload) : adminShopsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'shops'] });
      close();
    },
    onError: (err) => setError(err.message),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, isActive }) => adminShopsApi.setStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'shops'] }),
    onError: (err) => setActionError(err.message),
  });

  const removeMut = useMutation({
    mutationFn: (id) => adminShopsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'shops'] });
      setToDelete(null);
    },
    onError: (err) => {
      setToDelete(null);
      setActionError(err.message);
    },
  });

  const isEdit = !!modal?.id;

  const open = (shop) => {
    setError('');
    if (shop) {
      setForm({
        ...EMPTY,
        name: shop.name,
        description: shop.description || '',
        logo: shop.logo || '',
        coverImage: shop.coverImage || '',
        phone: shop.phone || '',
        whatsapp: shop.whatsapp || '',
        address: shop.address || '',
      });
      setModal({ id: shop._id });
    } else {
      setForm(EMPTY);
      setModal({ id: null });
    }
  };
  const close = () => setModal(null);

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (isEdit) {
      const { ownerName, ownerEmail, ownerPassword, ...shopData } = form;
      saveMut.mutate({ id: modal.id, payload: shopData });
    } else {
      saveMut.mutate({ id: null, payload: form });
    }
  };

  const columns = [
    { key: 'name', header: 'دکان', render: (r) => (
      <div>
        <Link to={`/shops/${r.slug}`} target="_blank" className="urdu font-medium text-brand hover:underline">{r.name}</Link>
        <p className="urdu text-xs text-gray-400">{r.owner?.name} · {r.owner?.email}</p>
      </div>
    ) },
    { key: 'productCount', header: 'Products', render: (r) => r.productCount ?? 0 },
    { key: 'orderCount', header: 'Orders', render: (r) => r.orderCount ?? 0 },
    {
      key: 'isActive',
      header: 'Status',
      render: (r) => (
        <button
          onClick={() => statusMut.mutate({ id: r._id, isActive: !r.isActive })}
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}
        >
          {r.isActive ? 'Active' : 'Suspended'}
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          <button onClick={() => open(r)} className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50">Edit</button>
          <button onClick={() => setToDelete(r)} className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Dukanen (Shops)</h1>
        <button onClick={() => open(null)} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          + New Shop
        </button>
      </div>

      {actionError && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{actionError}</div>}

      {isLoading ? (
        <Loader label="Loading…" />
      ) : isError ? (
        <ErrorState error={queryError} onRetry={refetch} />
      ) : (
        <DataTable columns={columns} rows={shops} empty="No shops yet" />
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={submit} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-ink">{isEdit ? 'Edit Shop' : 'New Shop'}</h3>
            {error && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

            <div className="space-y-3">
              <input dir="rtl" required placeholder="دکان کا نام (Shop name) *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand" />
              <textarea dir="rtl" rows={2} placeholder="تفصیل (description)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand" />
              <div className="flex gap-3">
                <input dir="ltr" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
                <input dir="ltr" placeholder="WhatsApp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
              <input dir="rtl" placeholder="پتہ (address)" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              <ImageUploader value={form.logo} onChange={(logo) => setForm({ ...form, logo })} label="Logo" />
              <ImageUploader value={form.coverImage} onChange={(coverImage) => setForm({ ...form, coverImage })} label="Cover image" />

              {!isEdit && (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
                  <p className="mb-2 text-sm font-semibold text-ink">Shopkeeper login credentials</p>
                  <div className="space-y-3">
                    <input dir="rtl" required placeholder="دکاندار کا نام (Owner name) *" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand" />
                    <input type="email" required placeholder="Email *" value={form.ownerEmail} onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
                    <input type="text" required placeholder="Password (min 6) *" value={form.ownerPassword} onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
                  </div>
                  <p className="mt-2 text-xs text-gray-400">The shopkeeper signs in at /shop/admin with these.</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={close} className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saveMut.isPending} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
                {saveMut.isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete shop?"
        message={toDelete ? `"${toDelete.name}" and its owner account will be removed. Shops with existing orders can't be deleted — suspend them instead.` : ''}
        loading={removeMut.isPending}
        onConfirm={() => removeMut.mutate(toDelete._id)}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
