import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../../api/index.js';
import DataTable from '../components/DataTable.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Loader, { ErrorState } from '../../components/Loader.jsx';

const EMPTY = { name: '', slug: '', description: '', order: 0, isActive: true };

export default function Categories() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null); // null | {category}
  const [form, setForm] = useState(EMPTY);
  const [toDelete, setToDelete] = useState(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const {
    data: categories = [],
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => categoriesApi.list(true),
  });

  const saveMut = useMutation({
    mutationFn: ({ id, payload }) =>
      id ? categoriesApi.update(id, payload) : categoriesApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      close();
    },
    onError: (err) => setError(err.message),
  });

  const removeMut = useMutation({
    mutationFn: (id) => categoriesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      setToDelete(null);
    },
    onError: (err) => {
      setToDelete(null);
      setActionError(err.message);
    },
  });

  const open = (category) => {
    setError('');
    if (category) {
      setForm({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        order: category.order || 0,
        isActive: category.isActive,
      });
      setModal({ id: category._id });
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
      payload: { ...form, order: Number(form.order) || 0 },
    });
  };

  const columns = [
    { key: 'name', header: 'Name', render: (r) => <span className="urdu font-medium">{r.name}</span> },
    { key: 'slug', header: 'Slug' },
    { key: 'order', header: 'Order' },
    {
      key: 'isActive',
      header: 'Active',
      render: (r) =>
        r.isActive ? (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Yes</span>
        ) : (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">No</span>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
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
        <h1 className="text-2xl font-bold text-ink">Categories</h1>
        <button
          onClick={() => open(null)}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + New Category
        </button>
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{actionError}</div>
      )}

      {isLoading ? (
        <Loader label="Loading…" />
      ) : isError ? (
        <ErrorState error={queryError} onRetry={refetch} />
      ) : (
        <DataTable columns={columns} rows={categories} empty="No categories yet" />
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={submit} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-ink">
              {modal.id ? 'Edit Category' : 'New Category'}
            </h3>
            {error && (
              <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}
            <div className="space-y-3">
              <input
                dir="rtl"
                required
                placeholder="نام (Urdu name)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="urdu w-full rounded-lg border border-gray-300 pl-3 pr-4 py-2 outline-none focus:border-brand"
              />
              <input
                placeholder="slug (e.g. politics)"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <input
                dir="rtl"
                placeholder="تفصیل (description)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="urdu w-full rounded-lg border border-gray-300 pl-3 pr-4 py-2 outline-none focus:border-brand"
              />
              <div className="flex items-center gap-4">
                <label className="text-sm">
                  Order:
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                    className="ml-2 w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 accent-brand"
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={close}
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
        title="Delete category?"
        message={toDelete ? `“${toDelete.name}” will be removed.` : ''}
        loading={removeMut.isPending}
        onConfirm={() => removeMut.mutate(toDelete._id)}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
