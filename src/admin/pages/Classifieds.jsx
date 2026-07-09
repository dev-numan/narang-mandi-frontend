import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classifiedsApi } from '../../api/index.js';
import { formatPrice } from '../../utils/format.js';
import DataTable from '../components/DataTable.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import MultiImageUploader from '../../components/MultiImageUploader.jsx';
import Loader, { ErrorState } from '../../components/Loader.jsx';

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: '', label: 'All' },
];

const EMPTY = {
  title: '',
  categoryId: '',
  description: '',
  price: '',
  negotiable: false,
  location: '',
  contactName: '',
  phone: '',
  images: [],
  isSold: false,
  status: 'approved',
};

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-gray-200 text-gray-600',
};

export default function Classifieds() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('pending');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [toDelete, setToDelete] = useState(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const { data: categories = [] } = useQuery({
    queryKey: ['classified-categories', 'admin'],
    queryFn: () => classifiedsApi.categories(),
  });

  const { data: listings = [], isLoading, isError, error: queryError, refetch } = useQuery({
    queryKey: ['admin-classifieds', tab],
    queryFn: () => classifiedsApi.adminList(tab ? { status: tab } : {}),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-classifieds'] });
    qc.invalidateQueries({ queryKey: ['classifieds'] });
    qc.invalidateQueries({ queryKey: ['classified-categories'] });
  };

  const saveMut = useMutation({
    mutationFn: ({ id, payload }) => (id ? classifiedsApi.update(id, payload) : classifiedsApi.create(payload)),
    onSuccess: () => {
      invalidate();
      setModal(null);
    },
    onError: (err) => setError(err.message),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => classifiedsApi.setStatus(id, status),
    onSuccess: invalidate,
    onError: (err) => setActionError(err.message),
  });

  const removeMut = useMutation({
    mutationFn: (id) => classifiedsApi.remove(id),
    onSuccess: () => {
      invalidate();
      setToDelete(null);
    },
    onError: (err) => {
      setToDelete(null);
      setActionError(err.message);
    },
  });

  const open = (item) => {
    setError('');
    if (item) {
      setForm({
        title: item.title,
        categoryId: item.category?._id || '',
        description: item.description || '',
        price: item.price ?? '',
        negotiable: !!item.negotiable,
        location: item.location || '',
        contactName: item.contactName || '',
        phone: item.phone || '',
        images: item.images || [],
        isSold: !!item.isSold,
        status: item.status,
      });
      setModal({ id: item._id });
    } else {
      setForm(EMPTY);
      setModal({ id: null });
    }
  };

  const submit = (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      ...form,
      categoryId: form.categoryId || null,
      price: form.price === '' ? null : Number(form.price),
    };
    saveMut.mutate({ id: modal.id, payload });
  };

  const columns = [
    { key: 'title', header: 'Title', render: (r) => <span className="urdu font-medium">{r.title}</span> },
    { key: 'category', header: 'Category', render: (r) => <span className="urdu">{r.category?.name || '—'}</span> },
    { key: 'price', header: 'Price', render: (r) => (r.price != null ? formatPrice(r.price) : '—') },
    { key: 'saleCode', header: 'Code', render: (r) => <span className="font-mono text-xs">{r.saleCode || '—'}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <div className="flex items-center gap-1">
          <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_BADGE[r.status]}`}>{r.status}</span>
          {r.isSold && <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-white">sold</span>}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap gap-2">
          {r.status !== 'approved' && (
            <button onClick={() => statusMut.mutate({ id: r._id, status: 'approved' })} className="rounded border border-green-300 px-2 py-1 text-xs text-green-700 hover:bg-green-50">✓ Approve</button>
          )}
          {r.status !== 'rejected' && (
            <button onClick={() => statusMut.mutate({ id: r._id, status: 'rejected' })} className="rounded border border-amber-300 px-2 py-1 text-xs text-amber-700 hover:bg-amber-50">✕ Reject</button>
          )}
          <button onClick={() => open(r)} className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50">Edit</button>
          <button onClick={() => setToDelete(r)} className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Classifieds</h1>
        <button onClick={() => open(null)} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">+ New Listing</button>
      </div>

      <div className="mb-4 flex gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${tab === t.key ? 'bg-brand text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>{t.label}</button>
        ))}
      </div>

      {actionError && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{actionError}</div>}

      {isLoading ? (
        <Loader label="Loading…" />
      ) : isError ? (
        <ErrorState error={queryError} onRetry={refetch} />
      ) : (
        <DataTable columns={columns} rows={listings} empty="No listings in this view" />
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={submit} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-ink">{modal.id ? 'Edit Listing' : 'New Listing'}</h3>
            {error && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
            <div className="space-y-3">
              <input dir="rtl" required placeholder="عنوان (title)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand" />
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand">
                <option value="">— Category —</option>
                {categories.map((c) => (<option key={c._id} value={c._id}>{c.icon} {c.name}</option>))}
              </select>
              <div className="flex items-center gap-3">
                <input type="number" min="0" dir="ltr" placeholder="Price (Rs)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
                <label className="urdu flex shrink-0 items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" checked={form.negotiable} onChange={(e) => setForm({ ...form, negotiable: e.target.checked })} className="h-4 w-4 accent-brand" />
                  قابلِ گفتگو
                </label>
              </div>
              <textarea dir="rtl" rows={3} placeholder="تفصیل (description)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand" />
              <input dir="rtl" placeholder="علاقہ (location)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              <div className="flex gap-3">
                <input dir="rtl" placeholder="نام (contact name)" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
                <input dir="ltr" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
              <MultiImageUploader value={form.images} onChange={(images) => setForm({ ...form, images })} uploadFn={classifiedsApi.uploadImage} max={5} label="Images" />
              <div className="flex items-center gap-4">
                <label className="block text-sm">
                  Status:
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="ml-2 rounded-lg border border-gray-300 px-2 py-1 text-sm">
                    <option value="pending">pending</option>
                    <option value="approved">approved</option>
                    <option value="rejected">rejected</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isSold} onChange={(e) => setForm({ ...form, isSold: e.target.checked })} className="h-4 w-4 accent-brand" />
                  Sold
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setModal(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saveMut.isPending} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">{saveMut.isPending ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete listing?"
        message={toDelete ? `“${toDelete.title}” will be removed.` : ''}
        loading={removeMut.isPending}
        onConfirm={() => removeMut.mutate(toDelete._id)}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
