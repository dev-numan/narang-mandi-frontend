import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopAdminApi } from '../../api/index.js';
import DataTable from '../../admin/components/DataTable.jsx';
import ConfirmDialog from '../../admin/components/ConfirmDialog.jsx';
import Loader, { ErrorState } from '../../components/Loader.jsx';

const EMPTY = { name: '', nameEn: '', order: 0, isActive: true };

export default function ShopCategories() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [toDelete, setToDelete] = useState(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const { data: categories = [], isLoading, isError, error: queryError, refetch } = useQuery({
    queryKey: ['shop-admin', 'categories'],
    queryFn: () => shopAdminApi.categories(),
  });

  const saveMut = useMutation({
    mutationFn: ({ id, payload }) =>
      id ? shopAdminApi.updateCategory(id, payload) : shopAdminApi.createCategory(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shop-admin', 'categories'] });
      close();
    },
    onError: (err) => setError(err.message),
  });

  const removeMut = useMutation({
    mutationFn: (id) => shopAdminApi.removeCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shop-admin', 'categories'] });
      setToDelete(null);
    },
    onError: (err) => {
      setToDelete(null);
      setActionError(err.message);
    },
  });

  const open = (c) => {
    setError('');
    if (c) {
      setForm({ name: c.name, nameEn: c.nameEn || '', order: c.order || 0, isActive: c.isActive });
      setModal({ id: c._id });
    } else {
      setForm(EMPTY);
      setModal({ id: null });
    }
  };
  const close = () => setModal(null);

  const submit = (e) => {
    e.preventDefault();
    setError('');
    saveMut.mutate({ id: modal.id, payload: { ...form, order: Number(form.order) || 0 } });
  };

  const columns = [
    { key: 'name', header: 'نام', render: (r) => <span className="urdu font-medium">{r.name}</span> },
    { key: 'nameEn', header: 'English' },
    { key: 'productCount', header: 'پروڈکٹس', render: (r) => r.productCount ?? 0 },
    {
      key: 'isActive',
      header: 'فعال',
      render: (r) =>
        r.isActive ? (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Yes</span>
        ) : (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">No</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex gap-2">
          <button onClick={() => open(r)} className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50">ترمیم</button>
          <button onClick={() => setToDelete(r)} className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50">حذف</button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="urdu text-2xl font-bold text-ink">زمرہ جات</h1>
        <button onClick={() => open(null)} className="urdu rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          + نیا زمرہ
        </button>
      </div>

      {actionError && <div className="urdu mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{actionError}</div>}

      {isLoading ? (
        <Loader label="Loading…" />
      ) : isError ? (
        <ErrorState error={queryError} onRetry={refetch} />
      ) : (
        <DataTable columns={columns} rows={categories} empty="ابھی کوئی زمرہ نہیں" />
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={submit} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="urdu mb-4 text-lg font-bold text-ink">{modal.id ? 'زمرہ ترمیم کریں' : 'نیا زمرہ'}</h3>
            {error && <div className="urdu mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
            <div className="space-y-3">
              <input dir="rtl" required placeholder="نام (اردو)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand" />
              <input placeholder="English name (optional)" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              <div className="flex items-center gap-4">
                <label className="urdu text-sm">
                  ترتیب:
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className="ml-2 w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm" />
                </label>
                <label className="urdu flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 accent-brand" />
                  فعال
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={close} className="urdu rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">منسوخ</button>
              <button type="submit" disabled={saveMut.isPending} className="urdu rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
                {saveMut.isPending ? 'محفوظ…' : 'محفوظ کریں'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="زمرہ حذف کریں؟"
        message={toDelete ? `"${toDelete.name}" حذف ہو جائے گا۔` : ''}
        confirmLabel="حذف کریں"
        cancelLabel="منسوخ"
        loading={removeMut.isPending}
        onConfirm={() => removeMut.mutate(toDelete._id)}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
