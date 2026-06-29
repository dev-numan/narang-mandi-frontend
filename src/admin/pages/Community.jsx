import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityApi } from '../../api/index.js';
import DataTable from '../components/DataTable.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Loader, { ErrorState } from '../../components/Loader.jsx';

export default function Community() {
  const qc = useQueryClient();
  const [toDelete, setToDelete] = useState(null);
  const [actionError, setActionError] = useState('');

  const {
    data: threads = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-threads'],
    queryFn: () => communityApi.adminThreads(),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-threads'] });

  const lockMut = useMutation({
    mutationFn: (id) => communityApi.adminLockThread(id),
    onSuccess: invalidate,
    onError: (err) => setActionError(err.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => communityApi.adminDeleteThread(id),
    onSuccess: () => {
      invalidate();
      setToDelete(null);
    },
    onError: (err) => {
      setToDelete(null);
      setActionError(err.message);
    },
  });

  const columns = [
    {
      key: 'title',
      header: 'Thread',
      render: (r) => (
        <div>
          <a
            href={`/community/${r.slug}`}
            target="_blank"
            rel="noreferrer"
            className="urdu font-medium text-brand hover:underline"
          >
            {r.title}
          </a>
          {r.description && <p className="urdu text-xs text-gray-400 line-clamp-1">{r.description}</p>}
        </div>
      ),
    },
    { key: 'authorName', header: 'By', render: (r) => <span className="urdu">{r.authorName}</span> },
    { key: 'messageCount', header: 'Messages' },
    {
      key: 'isLocked',
      header: 'Status',
      render: (r) =>
        r.isLocked ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">🔒 Locked</span>
        ) : (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Open</span>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          <button
            onClick={() => lockMut.mutate(r._id)}
            className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
          >
            {r.isLocked ? 'Unlock' : 'Lock'}
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Community</h1>
        <p className="mt-1 text-sm text-gray-500">
          Moderate discussion threads. Open a thread to remove individual messages.
        </p>
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{actionError}</div>
      )}

      {isLoading ? (
        <Loader label="Loading…" />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <DataTable columns={columns} rows={threads} empty="No threads yet" />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete thread?"
        message={toDelete ? `“${toDelete.title}” and all its messages will be removed.` : ''}
        loading={deleteMut.isPending}
        onConfirm={() => deleteMut.mutate(toDelete._id)}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
