import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopAdminApi, uploadApi } from '../../api/index.js';
import DataTable from '../../admin/components/DataTable.jsx';
import ConfirmDialog from '../../admin/components/ConfirmDialog.jsx';
import MultiImageUploader from '../../components/MultiImageUploader.jsx';
import Loader, { ErrorState } from '../../components/Loader.jsx';
import { formatPrice } from '../../utils/format.js';

const EMPTY = { name: '', categoryId: '', description: '', price: 0, stock: 0, images: [], isActive: true };

export default function ShopProducts() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [toDelete, setToDelete] = useState(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const { data: products = [], isLoading, isError, error: queryError, refetch } = useQuery({
    queryKey: ['shop-admin', 'products'],
    queryFn: () => shopAdminApi.products(),
  });
  const { data: categories = [] } = useQuery({
    queryKey: ['shop-admin', 'categories'],
    queryFn: () => shopAdminApi.categories(),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['shop-admin', 'products'] });
    qc.invalidateQueries({ queryKey: ['shop-admin', 'categories'] });
    qc.invalidateQueries({ queryKey: ['shop-admin', 'stats'] });
  };

  const saveMut = useMutation({
    mutationFn: ({ id, payload }) =>
      id ? shopAdminApi.updateProduct(id, payload) : shopAdminApi.createProduct(payload),
    onSuccess: () => {
      invalidate();
      close();
    },
    onError: (err) => setError(err.message),
  });

  const removeMut = useMutation({
    mutationFn: (id) => shopAdminApi.removeProduct(id),
    onSuccess: () => {
      invalidate();
      setToDelete(null);
    },
    onError: (err) => {
      setToDelete(null);
      setActionError(err.message);
    },
  });

  const open = (p) => {
    setError('');
    if (p) {
      setForm({
        name: p.name,
        categoryId: p.category?._id || '',
        description: p.description || '',
        price: p.price || 0,
        stock: p.stock || 0,
        images: p.images || [],
        isActive: p.isActive,
      });
      setModal({ id: p._id });
    } else {
      setForm(EMPTY);
      setModal({ id: null });
    }
  };
  const close = () => setModal(null);

  const submit = (e) => {
    e.preventDefault();
    setError('');
    saveMut.mutate({
      id: modal.id,
      payload: {
        ...form,
        categoryId: form.categoryId || null,
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
      },
    });
  };

  const columns = [
    {
      key: 'name',
      header: 'پروڈکٹ',
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-gray-100">
            {r.images?.[0] ? <img src={r.images[0]} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-gray-300">📦</span>}
          </div>
          <span className="urdu font-medium">{r.name}</span>
        </div>
      ),
    },
    { key: 'category', header: 'زمرہ', render: (r) => <span className="urdu">{r.category?.name || '—'}</span> },
    { key: 'price', header: 'قیمت', render: (r) => formatPrice(r.price) },
    {
      key: 'stock',
      header: 'اسٹاک',
      render: (r) => <span className={r.stock <= 3 ? 'font-semibold text-orange-600' : ''}>{r.stock}</span>,
    },
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
        <h1 className="urdu text-2xl font-bold text-ink">پروڈکٹس</h1>
        <button onClick={() => open(null)} className="urdu rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          + نئی پروڈکٹ
        </button>
      </div>

      {actionError && <div className="urdu mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{actionError}</div>}

      {isLoading ? (
        <Loader label="Loading…" />
      ) : isError ? (
        <ErrorState error={queryError} onRetry={refetch} />
      ) : (
        <DataTable columns={columns} rows={products} empty="ابھی کوئی پروڈکٹ نہیں" />
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={submit} className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h3 className="urdu mb-4 text-lg font-bold text-ink">{modal.id ? 'پروڈکٹ ترمیم کریں' : 'نئی پروڈکٹ'}</h3>
            {error && <div className="urdu mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
            <div className="space-y-3">
              <input dir="rtl" required placeholder="پروڈکٹ کا نام *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand" />
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand">
                <option value="">زمرہ منتخب کریں (اختیاری)</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <div className="flex gap-3">
                <label className="urdu flex-1 text-sm text-gray-600">
                  قیمت (Rs)
                  <input type="number" min="0" dir="ltr" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
                </label>
                <label className="urdu flex-1 text-sm text-gray-600">
                  اسٹاک (تعداد)
                  <input type="number" min="0" dir="ltr" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
                </label>
              </div>
              <textarea dir="rtl" rows={3} placeholder="تفصیل (اختیاری)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="urdu w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand" />
              <MultiImageUploader value={form.images} onChange={(images) => setForm({ ...form, images })} uploadFn={uploadApi.image} max={5} label="تصاویر" />
              <label className="urdu flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 accent-brand" />
                دکان پر دکھائیں (فعال)
              </label>
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
        title="پروڈکٹ حذف کریں؟"
        message={toDelete ? `"${toDelete.name}" حذف ہو جائے گی۔` : ''}
        confirmLabel="حذف کریں"
        cancelLabel="منسوخ"
        loading={removeMut.isPending}
        onConfirm={() => removeMut.mutate(toDelete._id)}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
