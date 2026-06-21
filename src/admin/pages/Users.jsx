import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import DataTable from '../components/DataTable.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Loader, { ErrorState } from '../../components/Loader.jsx';

const EMPTY = { name: '', email: '', password: '', role: 'editor' };

export default function Users() {
  const qc = useQueryClient();
  const { user: current } = useAuth();
  // modal: null | { mode: 'create' } | { mode: 'edit', id }
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [toDelete, setToDelete] = useState(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const {
    data: users = [],
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminApi.users,
  });

  const isEdit = modal?.mode === 'edit';

  const saveMut = useMutation({
    mutationFn: () => {
      if (isEdit) {
        const payload = { name: form.name, role: form.role };
        if (form.password) payload.password = form.password; // only if changing
        return adminApi.updateUser(modal.id, payload);
      }
      return adminApi.createUser(form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      setModal(null);
      setForm(EMPTY);
    },
    onError: (err) => setError(err.message),
  });

  const removeMut = useMutation({
    mutationFn: (id) => adminApi.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      setToDelete(null);
    },
    onError: (err) => {
      setToDelete(null);
      setActionError(err.message);
    },
  });

  const openCreate = () => {
    setError('');
    setForm(EMPTY);
    setModal({ mode: 'create' });
  };
  const openEdit = (u) => {
    setError('');
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setModal({ mode: 'edit', id: u._id });
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (r) => <span className="capitalize">{r.role}</span> },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openEdit(r)}
            className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
          >
            Edit
          </button>
          {r._id === current?._id ? (
            <span className="text-xs text-gray-400">(you)</span>
          ) : (
            <button
              onClick={() => setToDelete(r)}
              className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  const submit = (e) => {
    e.preventDefault();
    setError('');
    saveMut.mutate();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Users</h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + New Editor
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
        <DataTable columns={columns} rows={users} empty="No users" />
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={submit} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-ink">
              {isEdit ? 'Edit User' : 'New User'}
            </h3>
            {error && (
              <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}
            <div className="space-y-3">
              <input
                required
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
              />
              <input
                required={!isEdit}
                disabled={isEdit}
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
              />
              <input
                required={!isEdit}
                type="password"
                placeholder={isEdit ? 'New password (leave blank to keep current)' : 'Password (min 6 chars)'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand"
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
              >
                <option value="editor">editor</option>
                <option value="admin">admin</option>
              </select>
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
                {saveMut.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete user?"
        message={toDelete ? `${toDelete.name} (${toDelete.email}) will be removed.` : ''}
        loading={removeMut.isPending}
        onConfirm={() => removeMut.mutate(toDelete._id)}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
