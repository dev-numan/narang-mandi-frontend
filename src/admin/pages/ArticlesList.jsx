import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, articlesApi, categoriesApi } from '../../api/index.js';
import DataTable from '../components/DataTable.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Pagination from '../../components/Pagination.jsx';
import Loader, { ErrorState } from '../../components/Loader.jsx';
import { StatusBadge } from './Dashboard.jsx';

export default function ArticlesList() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [actionError, setActionError] = useState('');

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => categoriesApi.list(true),
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'articles', { page, status, category, search }],
    queryFn: () =>
      adminApi.articles({ page, limit: 15, status, category, search }),
  });

  const removeMut = useMutation({
    mutationFn: (id) => articlesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'articles'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
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
      header: 'Title',
      render: (r) => (
        <Link to={`/admin/articles/${r._id}/edit`} className="font-medium text-ink hover:text-brand">
          <span className="urdu">{r.title}</span>
        </Link>
      ),
    },
    { key: 'category', header: 'Category', render: (r) => <span className="urdu">{r.category?.name || '—'}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'views', header: 'Views', render: (r) => r.views },
    {
      key: 'date',
      header: 'Created',
      render: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          <Link
            to={`/admin/articles/${r._id}/edit`}
            className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
          >
            Edit
          </Link>
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
        <h1 className="text-2xl font-bold text-ink">Articles</h1>
        <Link
          to="/admin/articles/new"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          placeholder="Search title…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{actionError}</div>
      )}

      {isLoading ? (
        <Loader label="Loading…" />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <>
          <DataTable columns={columns} rows={data?.data || []} empty="No articles found" />
          <Pagination page={page} totalPages={data?.totalPages} onChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete article?"
        message={toDelete ? `“${toDelete.title}” will be permanently removed.` : ''}
        loading={removeMut.isPending}
        onConfirm={() => removeMut.mutate(toDelete._id)}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
